'use strict';

/**
 * tests/integration/auth.routes.test.js
 *
 * Integration tests for authentication routes.
 * Uses supertest to make HTTP requests against the Express app.
 * Uses a real Neon test database — requires DATABASE_URL and JWT_SECRET in env.
 *
 * Tests clean up created users after each describe block.
 *
 * Security rules:
 *  - Test passwords never logged
 *  - Returned tokens never logged
 *  - Response bodies checked for absence of passwordHash
 */

const request  = require('supertest');
const app      = require('../../src/app');
const prisma   = require('../../src/config/database');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

// Unique email suffix per test run to avoid conflicts between runs
const RUN_ID  = Date.now();
const testEmail = (label) => `testuser_${label}_${RUN_ID}@quickkart-test.example`;

// ── Helpers ───────────────────────────────────────────────────

async function cleanupUser(email) {
  try {
    await prisma.user.deleteMany({ where: { email } });
  } catch (_) {}
}

// ── POST /api/auth/register ───────────────────────────────────

describe('POST /api/auth/register', () => {
  const email = testEmail('register');
  afterAll(() => cleanupUser(email));

  test('201 — creates user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hardik Test', email, password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.name).toBe('Hardik Test');
    expect(res.body.data.user.role).toBe('CUSTOMER');
  });

  test('response never contains passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Hash', email: testEmail('nohash'), password: 'Password1!' });

    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    await cleanupUser(testEmail('nohash'));
  });

  test('409 — duplicate email', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'First', email: testEmail('dup'), password: 'Password1!' });

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Second', email: testEmail('dup'), password: 'Password1!' });

    expect(res.status).toBe(409);
    await cleanupUser(testEmail('dup'));
  });

  test('400 — invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad', email: 'not-an-email', password: 'Password1!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 — missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail('noname'), password: 'Password1!' });

    expect(res.status).toBe(400);
  });

  test('400 — missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Pass', email: testEmail('nopass') });

    expect(res.status).toBe(400);
  });

  test('400 — password too short (< 8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: testEmail('short'), password: 'Ab1' });

    expect(res.status).toBe(400);
  });

  test('400 — weak password (no uppercase)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak', email: testEmail('weak'), password: 'password1!' });

    expect(res.status).toBe(400);
  });

  test('password stored as bcrypt hash in database', async () => {
    const hashEmail = testEmail('hashcheck');
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hash Check', email: hashEmail, password: 'Password1!' });

    const dbUser = await prisma.user.findUnique({
      where: { email: hashEmail },
      select: { passwordHash: true },
    });

    expect(dbUser.passwordHash).toBeDefined();
    expect(dbUser.passwordHash).not.toBe('Password1!');
    const isHash = await bcrypt.compare('Password1!', dbUser.passwordHash);
    expect(isHash).toBe(true);

    await cleanupUser(hashEmail);
  });
});

// ── POST /api/auth/login ──────────────────────────────────────

describe('POST /api/auth/login', () => {
  const loginEmail = testEmail('login');

  beforeAll(async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Login User', email: loginEmail, password: 'Password1!' });
  });

  afterAll(() => cleanupUser(loginEmail));

  test('200 — valid credentials returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.').length).toBe(3); // JWT has 3 parts
    expect(res.body.data.user.email).toBe(loginEmail);
  });

  test('response never contains passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'Password1!' });

    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  test('401 — wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'WrongPass999!' });

    expect(res.status).toBe(401);
    expect(res.body.data).toBeUndefined();
  });

  test('401 — unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@quickkart-test.example', password: 'Password1!' });

    expect(res.status).toBe(401);
  });

  test('401 — same error message for unknown email and wrong password', async () => {
    const r1 = await request(app).post('/api/auth/login')
      .send({ email: 'nobody@quickkart-test.example', password: 'Password1!' });
    const r2 = await request(app).post('/api/auth/login')
      .send({ email: loginEmail, password: 'WrongPass1!' });

    expect(r1.body.message).toBe(r2.body.message);
  });

  test('400 — missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password1!' });

    expect(res.status).toBe(400);
  });

  test('400 — missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail });

    expect(res.status).toBe(400);
  });

  test('JWT token is verifiable', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'Password1!' });

    const token = res.body.data.token;
    const env = require('../../src/config/env');
    const payload = jwt.verify(token, env.JWT_SECRET);
    expect(payload.userId).toBeDefined();
    expect(payload.role).toBe('CUSTOMER');
    // Do not log the token
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────

describe('GET /api/auth/me', () => {
  const meEmail = testEmail('me');
  let validToken;

  beforeAll(async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Me User', email: meEmail, password: 'Password1!' });

    const loginRes = await request(app).post('/api/auth/login')
      .send({ email: meEmail, password: 'Password1!' });
    validToken = loginRes.body.data.token;
  });

  afterAll(() => cleanupUser(meEmail));

  test('200 — authenticated user is returned', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(meEmail);
    expect(res.body.data.user.name).toBe('Me User');
  });

  test('response never contains passwordHash', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  test('401 — no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('401 — invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.not.valid');

    expect(res.status).toBe(401);
  });

  test('401 — expired token', async () => {
    const env = require('../../src/config/env');
    const expiredToken = jwt.sign(
      { userId: 'fake_user_id', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    await new Promise(r => setTimeout(r, 10)); // ensure expiry

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  test('401 — Bearer without token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ');

    expect(res.status).toBe(401);
  });
});
