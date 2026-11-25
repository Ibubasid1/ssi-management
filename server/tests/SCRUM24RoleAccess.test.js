import test from 'node:test';
import assert from 'node:assert/strict';
import { issueToken } from '../token.js';
import { requireRole } from '../middleware/scrum24RoleAccess.js';

async function checkAccess(role, allowedRoles, token = null) {
  const req = {
    get: () => token ? `Bearer ${token}` : ''
  };

  let status = 200;
  let message = null;
  let allowed = false;

  const res = {
    status(code) {
      status = code;
      return this;
    },
    json(data) {
      message = data;
      return this;
    }
  };

  const middleware = requireRole(...allowedRoles);

  await new Promise((resolve) => {
    middleware[0](req, res, () => {
      middleware[1](req, res, () => {
        allowed = true;
      });
      resolve();
    });

    if (status !== 200) resolve();
  });

  return { status, message, allowed };
}

test('No login returns 401', async () => {
  const result = await checkAccess(null, ['ORGANIZER']);
  assert.equal(result.status, 401);
});

test('Student cannot access organizer features', async () => {
  const { token } = issueToken({ id: 1, role: 'STUDENT' });
  const result = await checkAccess('STUDENT', ['ORGANIZER'], token);

  assert.equal(result.status, 403);
});

test('Organizer can access organizer features', async () => {
  const { token } = issueToken({ id: 2, role: 'ORGANIZER' });
  const result = await checkAccess('ORGANIZER', ['ORGANIZER'], token);

  assert.equal(result.allowed, true);
});

test('Admin can access admin features', async () => {
  const { token } = issueToken({ id: 3, role: 'ADMIN' });
  const result = await checkAccess('ADMIN', ['ADMIN'], token);

  assert.equal(result.allowed, true);
});

test('Organizer cannot access admin features', async () => {
  const { token } = issueToken({ id: 2, role: 'ORGANIZER' });
  const result = await checkAccess('ORGANIZER', ['ADMIN'], token);

  assert.equal(result.status, 403);
});

test('Invalid token returns 401', async () => {
  const result = await checkAccess(null, ['ADMIN'], 'invalid-token');
  assert.equal(result.status, 401);
});
