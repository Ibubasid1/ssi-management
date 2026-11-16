import { Router } from 'express';
import pool from '../db.js';
import { verifyPassword, wasteTime } from '../auth.js';

const router = Router();

// The same message is returned for "no such email" and "wrong password".
// Telling them apart would let someone discover which emails are registered.
const INVALID_CREDENTIALS = 'Invalid email or password.';

/**
 * FR-01 — POST /api/auth/login
 * Body: { email, password }
 * 200 -> { user: { id, name, email, role } }
 * 400 -> missing fields
 * 401 -> bad email or password
 * 403 -> account exists but is not verified
 */
router.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, password_hash, role, is_verified
         FROM users
        WHERE LOWER(email) = LOWER($1)`,
      [email],
    );

    const user = rows[0];

    if (!user) {
      await wasteTime();
      return res.status(401).json({ error: INVALID_CREDENTIALS });
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: INVALID_CREDENTIALS });
    }

    // Checked only after the password is confirmed, so an attacker cannot
    // use this message to find out which emails are registered.
    if (!user.is_verified) {
      return res.status(403).json({
        error: 'Your account is not verified yet. Please check your email.',
      });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
