'use strict';

/**
 * tests/unit/users.service.test.js
 *
 * Unit tests for users.service.js (user profile management).
 */

jest.mock('../../src/modules/users/users.repository', () => ({
  usersRepository: {
    findById:   jest.fn(),
    updateUser: jest.fn(),
  },
}));

const { usersService }    = require('../../src/modules/users/users.service');
const { usersRepository } = require('../../src/modules/users/users.repository');
const AppError            = require('../../src/utils/errors');

const mockProfile = {
  id: 'user_123',
  name: 'Hardik Test',
  email: 'hardik@example.com',
  phone: '9876543210',
  role: 'CUSTOMER',
  avatarUrl: null,
  isActive: true,
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('usersService.getProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns user profile for valid userId', async () => {
    usersRepository.findById.mockResolvedValue(mockProfile);

    const profile = await usersService.getProfile('user_123');

    expect(profile.id).toBe('user_123');
    expect(profile.email).toBe('hardik@example.com');
    expect(profile.passwordHash).toBeUndefined();
  });

  test('throws 404 Not Found when profile does not exist', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(usersService.getProfile('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('usersService.updateProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updates permitted profile fields (name, phone, avatarUrl)', async () => {
    usersRepository.findById.mockResolvedValue(mockProfile);
    usersRepository.updateUser.mockResolvedValue({
      ...mockProfile,
      name: 'Hardik Updated',
      phone: '9998887770',
    });

    const updated = await usersService.updateProfile('user_123', {
      name: 'Hardik Updated',
      phone: '9998887770',
    });

    expect(updated.name).toBe('Hardik Updated');
    expect(usersRepository.updateUser).toHaveBeenCalledWith('user_123', {
      name: 'Hardik Updated',
      phone: '9998887770',
    });
  });

  test('ignores attempt to modify protected fields (role, passwordHash, email)', async () => {
    usersRepository.findById.mockResolvedValue(mockProfile);
    usersRepository.updateUser.mockResolvedValue(mockProfile);

    await usersService.updateProfile('user_123', {
      name: 'Hardik',
      role: 'ADMIN', // malicious client payload
      passwordHash: 'hacked_hash',
      email: 'hacked@example.com',
    });

    // Verify repository was called ONLY with 'name'
    expect(usersRepository.updateUser).toHaveBeenCalledWith('user_123', {
      name: 'Hardik',
    });
  });

  test('throws 404 when updating non-existent profile', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(
      usersService.updateProfile('ghost', { name: 'New Name' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
