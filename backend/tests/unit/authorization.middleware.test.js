'use strict';

/**
 * tests/unit/authorization.middleware.test.js
 *
 * Unit tests for authorization middleware (authorize & authorizeOwnership).
 * Tests role checking, ownership verification, and security boundaries.
 */

const { authorize, authorizeOwnership } = require('../../src/middleware/role.middleware');
const AppError = require('../../src/utils/errors');

describe('authorize middleware (Role-Based Access Control)', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {};
    next = jest.fn();
  });

  test('401 — fails when req.user is missing (unauthenticated)', () => {
    const middleware = authorize('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  test('200 / next() — ADMIN accessing ADMIN-only route is allowed', () => {
    req.user = { userId: 'admin_123', role: 'ADMIN' };
    const middleware = authorize('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // called with no error
  });

  test('403 — CUSTOMER accessing ADMIN-only route is forbidden', () => {
    req.user = { userId: 'cust_123', role: 'CUSTOMER' };
    const middleware = authorize('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  test('200 / next() — STORE_MANAGER accessing permitted store route is allowed', () => {
    req.user = { userId: 'store_123', role: 'STORE_MANAGER' };
    const middleware = authorize('STORE_MANAGER', 'ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('403 — STORE_MANAGER accessing ADMIN-only route is forbidden', () => {
    req.user = { userId: 'store_123', role: 'STORE_MANAGER' };
    const middleware = authorize('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  test('Security — client body role manipulation is ignored (role is read strictly from req.user)', () => {
    req.body = { role: 'ADMIN' }; // client attempts payload manipulation
    req.user = { userId: 'cust_123', role: 'CUSTOMER' }; // actual verified JWT identity

    const middleware = authorize('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });
});

describe('authorizeOwnership middleware (Resource-Level Ownership)', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null, params: { id: 'order_123' } };
    res = {};
    next = jest.fn();
  });

  test('401 — fails when req.user is missing', async () => {
    const middleware = authorizeOwnership({
      getResourceOwnerId: async () => 'user_owner_123',
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test('200 / next() — user accessing their own resource is allowed', async () => {
    req.user = { userId: 'user_owner_123', role: 'CUSTOMER' };

    const middleware = authorizeOwnership({
      getResourceOwnerId: async () => 'user_owner_123',
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('403 — user accessing another user resource is forbidden', async () => {
    req.user = { userId: 'user_attacker_999', role: 'CUSTOMER' };

    const middleware = authorizeOwnership({
      getResourceOwnerId: async () => 'user_owner_123',
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  test('200 / next() — ADMIN role bypasses ownership check when allowed', async () => {
    req.user = { userId: 'admin_user_777', role: 'ADMIN' };

    const middleware = authorizeOwnership({
      getResourceOwnerId: async () => 'user_owner_123',
      allowBypassRoles: ['ADMIN'],
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('404 — resource not found returns 404', async () => {
    req.user = { userId: 'user_owner_123', role: 'CUSTOMER' };

    const middleware = authorizeOwnership({
      getResourceOwnerId: async () => null, // resource does not exist
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  test('Security — client-supplied userId in body is ignored for ownership (uses DB lookup & verified req.user)', async () => {
    req.body = { userId: 'user_owner_123' }; // attacker claims to be owner in body
    req.user = { userId: 'user_attacker_999', role: 'CUSTOMER' }; // actual verified JWT ID

    const middleware = authorizeOwnership({
      getResourceOwnerId: async () => 'user_owner_123',
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});
