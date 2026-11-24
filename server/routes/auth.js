import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { issueToken } from '../token.js';

const router = Router();

// Compared against when the email is not registered, so a failed login takes
// about the same time whether or not the account exists. Without it, the
// response time alone reveals which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-never-used', 10);

// API doc 1.4 lists exactly one failure for bad input: 401 Invalid credentials.
// An unregistered email, a wrong password and an unverified account all return
// this, so the message cannot be used to discover which emails exist. Per 1.1
// and 1.2 an unverified row is not an account yet, so it logs in as invalid.
const INVALID_CREDENTIALS = 'Invalid email or password.';

/**
 * 1.4 POST /auth/login
 * 200 -> { data: { token, user_id, user_name, role, expires_at } }
 * 400 -> { code, message }   missing field
 * 401 -> { code, message }   invalid credentials
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ code: 400, message: 'Email and password are required.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, password_hash, role, verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );

    const user = rows[0];

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ code: 401, message: INVALID_CREDENTIALS });
    }

    if (!await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ code: 401, message: INVALID_CREDENTIALS });
    }

    if (!user.verified) {
      return res.status(401).json({ code: 401, message: INVALID_CREDENTIALS });
    }

    const { token, expiresAt } = issueToken(user);

    return res.status(200).json({
      data: {
        token,
        user_id: String(user.id),
        user_name: user.name,
        role: user.role,
        expires_at: expiresAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ code: 500, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
