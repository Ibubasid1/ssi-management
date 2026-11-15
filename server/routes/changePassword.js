import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';


const router = Router();
const minPasswordLength = 8;
router.patch('/change-password', async (req, res) => {
  const { current_password, new_password } = req.body || {};

  if (typeof current_password !== 'string' ||
      typeof new_password !== 'string' ||
      !current_password || !new_password) {
    return res.status(400).json({
      code: 400,
      message: 'Current password and new password are required.'
    });
  }

  if (new_password.length < minPasswordLength) {
    return res.status(400).json({
      code: 400,
      message: 'Password must be at least 8 characters.'
    });
  }
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'Not authenticated.'
    });
  }

  try {
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0 || !rows[0].password_hash) {
      return res.status(401).json({
        code: 401,
        message: 'Not authenticated.'
      });
    }

    const validPassword = await bcrypt.compare(
      current_password,
      rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({
        code: 400,
        message: 'Current password is incorrect.'
      });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    res.json({
      data: { message: 'Password changed successfully.' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: 'Something went wrong. Please try again.'
    });
  }
});
export default router;