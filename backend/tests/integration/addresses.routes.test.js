'use strict';

/**
 * tests/integration/addresses.routes.test.js
 *
 * Integration tests for Address Management & Geocoding routes against Neon PostgreSQL.
 * Verifies address CRUD, default address switching, ownership checks, and reverse geocoding.
 */

const request  = require('supertest');
const app      = require('../../src/app');
const prisma   = require('../../src/config/database');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const env      = require('../../src/config/env');

const RUN_ID = Date.now();

let userA, tokenA;
let userB, tokenB;
let addressA1, addressA2;

async function createTestUser(name, label) {
  const email = `addr_${label}_${RUN_ID}@quickkart-test.example`;
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'CUSTOMER' },
  });
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  return { user, token };
}

async function cleanup() {
  try {
    await prisma.user.deleteMany({
      where: { email: { contains: `_${RUN_ID}@quickkart-test.example` } },
    });
  } catch (_) {}
}

describe('Address Management Routes (/api/addresses)', () => {
  beforeAll(async () => {
    const a = await createTestUser('User A', 'usera');
    const b = await createTestUser('User B', 'userb');
    userA = a.user; tokenA = a.token;
    userB = b.user; tokenB = b.token;
  });

  afterAll(async () => {
    await cleanup();
  });

  // ── POST /api/addresses ─────────────────────────────────────

  describe('POST /api/addresses', () => {
    test('201 — creates a new address for authenticated user', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          label: 'Home',
          line1: 'H.No 42, Sector 14',
          city: 'Rajpura',
          state: 'Punjab',
          pincode: '140401',
          latitude: 30.4843,
          longitude: 76.5932,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.address.label).toBe('Home');
      expect(res.body.data.address.userId).toBe(userA.id);
      expect(res.body.data.address.isDefault).toBe(true); // First address is auto default

      addressA1 = res.body.data.address;
    });

    test('201 — creates a second address and manages default status', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          label: 'Office',
          line1: 'IT Park, Tower B',
          city: 'Chandigarh',
          state: 'Chandigarh',
          pincode: '160002',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.address.isDefault).toBe(true);

      addressA2 = res.body.data.address;
    });

    test('400 — returns 400 Bad Request when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          label: 'Incomplete Address',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('400 — returns 400 when latitude is out of range', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          label: 'Bad Coords',
          line1: 'Line 1',
          city: 'City',
          state: 'State',
          pincode: '140401',
          latitude: 999.0, // invalid latitude
          longitude: 76.5932,
        });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/addresses ──────────────────────────────────────

  describe('GET /api/addresses', () => {
    test('200 — returns only addresses belonging to authenticated user', async () => {
      const res = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.addresses.length).toBeGreaterThanOrEqual(2);
      for (const addr of res.body.data.addresses) {
        expect(addr.userId).toBe(userA.id);
      }
    });

    test('401 — returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/addresses');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/addresses/:id ──────────────────────────────────

  describe('GET /api/addresses/:id', () => {
    test('200 — owner can retrieve their address', async () => {
      const res = await request(app)
        .get(`/api/addresses/${addressA1.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.address.id).toBe(addressA1.id);
    });

    test('403 — User B cannot retrieve User A address (Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/addresses/${addressA1.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('404 — non-existent address returns 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/addresses/cuid_non_existent_address_id')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
    });
  });

  // ── PATCH /api/addresses/:id ────────────────────────────────

  describe('PATCH /api/addresses/:id', () => {
    test('200 — owner can update address line', async () => {
      const res = await request(app)
        .patch(`/api/addresses/${addressA1.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ line1: 'Updated H.No 42-B' });

      expect(res.status).toBe(200);
      expect(res.body.data.address.line1).toBe('Updated H.No 42-B');
    });

    test('403 — User B cannot update User A address', async () => {
      const res = await request(app)
        .patch(`/api/addresses/${addressA1.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ line1: 'Hacked Address Line' });

      expect(res.status).toBe(403);
    });
  });

  // ── PATCH /api/addresses/:id/default ────────────────────────

  describe('PATCH /api/addresses/:id/default', () => {
    test('200 — owner can set default address', async () => {
      const res = await request(app)
        .patch(`/api/addresses/${addressA1.id}/default`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.address.isDefault).toBe(true);

      // Verify that addressA2 is no longer default
      const allRes = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${tokenA}`);
      const a2 = allRes.body.data.addresses.find(a => a.id === addressA2.id);
      expect(a2.isDefault).toBe(false);
    });

    test('403 — User B cannot set default on User A address', async () => {
      const res = await request(app)
        .patch(`/api/addresses/${addressA1.id}/default`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
    });
  });

  // ── DELETE /api/addresses/:id ───────────────────────────────

  describe('DELETE /api/addresses/:id', () => {
    test('403 — User B cannot delete User A address', async () => {
      const res = await request(app)
        .delete(`/api/addresses/${addressA1.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
    });

    test('200 — owner can delete address', async () => {
      const res = await request(app)
        .delete(`/api/addresses/${addressA1.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── POST /api/addresses/reverse-geocode ────────────────────

  describe('POST /api/addresses/reverse-geocode', () => {
    test('200 — resolves reverse geocoding for valid coordinates', async () => {
      const res = await request(app)
        .post('/api/addresses/reverse-geocode')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          latitude: 30.4843,
          longitude: 76.5932,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.address.latitude).toBe(30.4843);
      expect(res.body.data.address.longitude).toBe(76.5932);
    });

    test('400 — returns 400 when coordinates are out of range', async () => {
      const res = await request(app)
        .post('/api/addresses/reverse-geocode')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          latitude: 120.0, // invalid latitude > 90
          longitude: 76.5932,
        });

      expect(res.status).toBe(400);
    });
  });
});
