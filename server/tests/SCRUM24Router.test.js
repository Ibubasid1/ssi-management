import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { issueToken } from '../token.js';
import scrum24Router from '../routes/scrum24Access.js';

const app = express();
app.use('/api/access', scrum24Router);

test('SCRUM-24 router permissions', async () => {
  const server = app.listen(0);

  try {
    const base = `http://127.0.0.1:${server.address().port}`;

    const { token: student } = issueToken({ id: 1, role: 'STUDENT' });
const { token: organizer } = issueToken({ id: 2, role: 'ORGANIZER' });
const { token: admin } = issueToken({ id: 3, role: 'ADMIN' });

    async function check(path, token, expected) {
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await fetch(`${base}${path}`, { headers });

      assert.equal(response.status, expected);
    }

    await check('/api/access/student', student, 200);
    await check('/api/access/organizer', organizer, 200);
    await check('/api/access/admin', admin, 200);

    await check('/api/access/admin', student, 403);
    await check('/api/access/organizer', admin, 403);
    await check('/api/access/student', null, 401);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
