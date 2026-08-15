'use strict';

/**
 * tests/unit/auth.service.test.js
 *
 * Unit tests for the auth service.
 * Prisma and bcrypt are mocked — no real DB calls.
 *
 * Sensitive data rules followed in tests:
 *  - No real passwords logged
 *  - No real JWTs logged
 *  - No real secrets used (mocked)
 */

// ── Mock dependencies before requiring the service ───────────
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock the repository so we don't touch the database
jest.mock('../../src/modules/auth/auth.repository', () => ({
  authRepository: {
    emailExists:         jest.fn(),
    createUser:          jest.fn(),
    findByEmailWithHash: jest.fn(),
    findById:            jest.fn(),
  },
}));

// Mock env to control JWT_SECRET in tests
jest.mock('../../src/config/env', () => ({
  JWT_SECRET:    'test-secret-not-real',
  JWT_EXPIRES_IN: '15m',
  NODE_ENV:      'test',
  PORT:           3000,
  DATABASE_URL:  'postgresql://mock',
  CORS_ORIGIN:   'http://localhost:5173',
}));

const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const { authService } = require('../../src/modules/auth/auth.service');
const { authRepository } = require('../../src/modules/auth/auth.repository');
const AppError      = require('../../src/utils/errors');

// ── Fixtures ─────────────────────────────────────────────────

const mockUser = {
  id: 'user_abc123',
  name: 'Test User',
  email: 'test@example.com',
  phone: null,
  role: 'CUSTOMER',
  avatarUrl: null,
  isActive: true,
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── register ─────────────────────────────────────────────────

describe('authService.register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a user and returns safe user (no passwordHash)', async () => {
    authRepository.emailExists.mockResolvedValue(false);
    bcrypt.hash.mockResolvedValue('hashed_password_not_real');
    authRepository.createUser.mockResolvedValue(mockUser);

    const result = await authService.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!',
    });

    expect(result.user).toBeDefined();
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.user.email).toBe('test@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('Password1!', 12);
  });

  test('throws 409 conflict when email already exists', async () => {
    authRepository.emailExists.mockResolvedValue(true);

    await expect(
      authService.register({ name: 'T', email: 'exists@example.com', password: 'Password1!' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('never returns passwordHash in the response', async () => {
    authRepository.emailExists.mockResolvedValue(false);
    bcrypt.hash.mockResolvedValue('hashed_value');
    authRepository.createUser.mockResolvedValue({ ...mockUser, passwordHash: 'hashed_value' });

    const result = await authService.register({
      name: 'Test', email: 'test@example.com', password: 'Password1!'
    });

    expect(result.user.passwordHash).toBeUndefined();
  });
});

// ── login ─────────────────────────────────────────────────────

describe('authService.login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns safe user and token on valid credentials', async () => {
    authRepository.findByEmailWithHash.mockResolvedValue({
      ...mockUser, passwordHash: 'hashed_password',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('signed.jwt.token');

    const result = await authService.login({
      email: 'test@example.com',
      password: 'Password1!',
    });

    expect(result.token).toBe('signed.jwt.token');
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.user.email).toBe('test@example.com');
  });

  test('throws 401 when email is not found', async () => {
    authRepository.findByEmailWithHash.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'ghost@example.com', password: 'Password1!' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test('throws 401 when password does not match', async () => {
    authRepository.findByEmailWithHash.mockResolvedValue({
      ...mockUser, passwordHash: 'hashed_password',
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({ email: 'test@example.com', password: 'WrongPassword1!' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test('throws 401 when account is inactive', async () => {
    authRepository.findByEmailWithHash.mockResolvedValue({
      ...mockUser, isActive: false, passwordHash: 'hashed_password',
    });

    await expect(
      authService.login({ email: 'test@example.com', password: 'Password1!' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test('never returns passwordHash in login result', async () => {
    authRepository.findByEmailWithHash.mockResolvedValue({
      ...mockUser, passwordHash: 'secret_hash',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('jwt');

    const result = await authService.login({
      email: 'test@example.com', password: 'Password1!'
    });

    expect(result.user.passwordHash).toBeUndefined();
  });

  test('error message does not reveal whether email exists (enumeration protection)', async () => {
    authRepository.findByEmailWithHash.mockResolvedValue(null);

    let notFoundError;
    try {
      await authService.login({ email: 'noone@example.com', password: 'Password1!' });
    } catch (e) {
      notFoundError = e;
    }

    authRepository.findByEmailWithHash.mockResolvedValue({ ...mockUser, passwordHash: 'hash' });
    bcrypt.compare.mockResolvedValue(false);

    let wrongPasswordError;
    try {
      await authService.login({ email: 'test@example.com', password: 'Wrong1!' });
    } catch (e) {
      wrongPasswordError = e;
    }

    // Both cases should give the same message
    expect(notFoundError.message).toBe(wrongPasswordError.message);
  });
});

// ── getMe ─────────────────────────────────────────────────────

describe('authService.getMe', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns safe user for valid userId', async () => {
    authRepository.findById.mockResolvedValue(mockUser);

    const result = await authService.getMe('user_abc123');
    expect(result.user.id).toBe('user_abc123');
    expect(result.user.passwordHash).toBeUndefined();
  });

  test('throws 401 when user does not exist', async () => {
    authRepository.findById.mockResolvedValue(null);

    await expect(authService.getMe('nonexistent')).rejects.toMatchObject({ statusCode: 401 });
  });

  test('throws 401 when account is inactive', async () => {
    authRepository.findById.mockResolvedValue({ ...mockUser, isActive: false });

    await expect(authService.getMe('user_abc123')).rejects.toMatchObject({ statusCode: 401 });
  });
});
