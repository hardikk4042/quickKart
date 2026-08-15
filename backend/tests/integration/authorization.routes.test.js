'use strict';

/**
 * tests/integration/authorization.routes.test.js
 *
 * Integration tests for Role-Based Access Control (RBAC) & Ownership Authorization.
 * Tests real HTTP requests against Express app and Neon PostgreSQL.
 *
 * Role matrix tested:
 *   - CUSTOMER
 *   - ADMIN
 *   - STORE_MANAGER
 *   - DELIVERY_PARTNER
 */

const request  = require('supertest');
const app      = require('../../src/app');
const prisma   = require('../../src/config/database');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const env      = require('../../src/config/env');

const RUN_ID = Date.now();
const testEmail = (role) => `rbac_${role.toLowerCase()}_${RUN_ID}@quickkart-test.example`;

let tokens = {};
let users = {};

async function createTestUser(name, email, role) {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
    select: { id: true, email: true, role: true },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { user, token };
}

async function cleanupTestUsers() {
  try {
    await prisma.user.deleteMany({
      where: {
        email: { contains: `_${RUN_ID}@quickkart-test.example` },
      },
    });
  } catch (_) {}
}

describe('Role-Based Access Control (RBAC) Integration Tests', () => {
  beforeAll(async () => {
    const customer = await createTestUser('Customer User', testEmail('CUSTOMER'), 'CUSTOMER');
    const admin = await createTestUser('Admin User', testEmail('ADMIN'), 'ADMIN');
    const storeManager = await createTestUser('Store Manager', testEmail('STORE_MANAGER'), 'STORE_MANAGER');
    const deliveryPartner = await createTestUser('Delivery Partner', testEmail('DELIVERY_PARTNER'), 'DELIVERY_PARTNER');

    users = {
      customer: customer.user,
      admin: admin.user,
      storeManager: storeManager.user,
      deliveryPartner: deliveryPartner.user,
    };

    tokens = {
      customer: customer.token,
      admin: admin.token,
      storeManager: storeManager.token,
      deliveryPartner: deliveryPartner.token,
    };
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  // ── CUSTOMER Access Tests ─────────────────────────────────

  describe('CUSTOMER Role Access', () => {
    test('200 — CUSTOMER can access /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokens.customer}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    test('403 — CUSTOMER cannot access /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${tokens.customer}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('403 — CUSTOMER cannot access /api/store/dashboard', async () => {
      const res = await request(app)
        .get('/api/store/dashboard')
        .set('Authorization', `Bearer ${tokens.customer}`);

      expect(res.status).toBe(403);
    });

    test('403 — CUSTOMER cannot access /api/delivery/dashboard', async () => {
      const res = await request(app)
        .get('/api/delivery/dashboard')
        .set('Authorization', `Bearer ${tokens.customer}`);

      expect(res.status).toBe(403);
    });
  });

  // ── ADMIN Access Tests ────────────────────────────────────

  describe('ADMIN Role Access', () => {
    test('200 — ADMIN can access /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('200 — ADMIN can access store manager routes', async () => {
      const res = await request(app)
        .get('/api/store/dashboard')
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(res.status).toBe(200);
    });

    test('200 — ADMIN can access delivery partner routes', async () => {
      const res = await request(app)
        .get('/api/delivery/dashboard')
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(res.status).toBe(200);
    });
  });

  // ── STORE_MANAGER Access Tests ───────────────────────────

  describe('STORE_MANAGER Role Access', () => {
    test('200 — STORE_MANAGER can access /api/store/dashboard', async () => {
      const res = await request(app)
        .get('/api/store/dashboard')
        .set('Authorization', `Bearer ${tokens.storeManager}`);

      expect(res.status).toBe(200);
    });

    test('403 — STORE_MANAGER cannot access /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${tokens.storeManager}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ── DELIVERY_PARTNER Access Tests ────────────────────────

  describe('DELIVERY_PARTNER Role Access', () => {
    test('200 — DELIVERY_PARTNER can access /api/delivery/dashboard', async () => {
      const res = await request(app)
        .get('/api/delivery/dashboard')
        .set('Authorization', `Bearer ${tokens.deliveryPartner}`);

      expect(res.status).toBe(200);
    });

    test('403 — DELIVERY_PARTNER cannot access /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${tokens.deliveryPartner}`);

      expect(res.status).toBe(403);
    });
  });

  // ── Unauthenticated & Security Edge Cases ────────────────

  describe('Unauthenticated & Security Boundaries', () => {
    test('401 — missing token on protected admin route returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/dashboard');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('401 — invalid token on protected store route returns 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/store/dashboard')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.status).toBe(401);
    });
  });
});
