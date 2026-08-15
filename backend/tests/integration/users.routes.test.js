'use strict';

/**
 * tests/integration/users.routes.test.js
 *
 * Integration tests for User Profile routes against Neon PostgreSQL.
 */

const request  = require('supertest');
const app      = require('../../src/app');
const prisma   = require('../../src/config/database');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const env      = require('../../src/config/env');

const RUN_ID = Date.now();
const testEmail = `profile_test_${RUN_ID}@quickkart-test.example`;

let testUser;
let testToken;

async function cleanupUser() {
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  } catch (_) {}
}

describe('User Profile Routes (/api/users)', () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    testUser = await prisma.user.create({
      data: {
        name: 'Profile Tester',
        email: testEmail,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    testToken = jwt.sign(
      { userId: testUser.id, role: testUser.role },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    await cleanupUser();
  });

  describe('GET /api/users/me', () => {
    test('200 — retrieves current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(testUser.id);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    test('401 — returns 401 Unauthorized when token is missing', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    test('200 — updates name and phone number', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Updated Profile Name',
          phone: '+919876543210',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Profile Name');
      expect(res.body.data.user.phone).toBe('+919876543210');
    });

    test('Security — payload role modification attempt is ignored (role remains CUSTOMER)', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Security Test',
          role: 'ADMIN', // malicious payload
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    test('400 — returns 400 Bad Request for invalid phone format', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          phone: 'invalid-phone-string',
        });

      expect(res.status).toBe(400);
    });
  });
});
