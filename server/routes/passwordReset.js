import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { sendPasswordResetEmail } from '../resetMailer.js';

const router = Router();
const resetTokenMinutes = 60;
const minPasswordLength = 8;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /api/auth/forgot-password  (API doc 1.5, FR-07)
router.post('/forgot-password', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ code: 400, message: 'Email is required.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1 AND verified = true',
      [email]
    );

    if (rows.length > 0) {
      const userId = rows[0].id;
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + resetTokenMinutes * 60 * 1000);

      // The link is one-time: cancel any older unused links for this user.
      await pool.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
        [userId]
      );
      // Only the hash is stored, so a database leak cannot be used to reset passwords.
      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, hashToken(resetToken), expiresAt]
      );
      await sendPasswordResetEmail(email, resetToken);
    }

    // Same reply whether or not the email exists or is verified (as written in the API doc).
    // Unverified accounts get no link (only verified accounts can reset a password).
    res.json({ data: { message: 'If this email is registered, a reset link has been sent.' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/reset-password  (API doc 1.6, FR-07)
router.post('/reset-password', async (req, res) => {
  const token = req.body?.token;
  const newPassword = req.body?.new_password;

  if (typeof token !== 'string' || typeof newPassword !== 'string' || !token || !newPassword) {
    return res.status(400).json({ code: 400, message: 'Token and new_password are required.' });
  }
  if (newPassword.length < minPasswordLength) {
    return res.status(400).json({
      code: 400,
      message: `Password must be at least ${minPasswordLength} characters.`,
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Valid = matches, not used yet, not expired. FOR UPDATE stops two requests using it at once.
    const { rows } = await client.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [hashToken(token)]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        code: 400,
        message: 'This reset link is invalid or has expired. Please request a new one.',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      rows[0].user_id,
    ]);
    await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [rows[0].id]);

    await client.query('COMMIT');
    res.json({ data: { message: 'Password reset successfully. You can now log in.' } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ code: 500, message: 'Something went wrong. Please try again.' });
  } finally {
    client.release();
  }
});

export default router;
