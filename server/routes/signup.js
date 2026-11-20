import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = Router();

const ALLOWED_ROLES = ['STUDENT', 'ORGANIZER', 'ADMIN'];
const UNIVERSITY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(khi\.)?iba\.edu\.pk$/i;

// Add authorized ORGANIZER and ADMIN university emails here
const ALLOWED_ROLE_EMAILS = {
  ORGANIZER: new Set([
    'organizer@khi.iba.edu.pk',
  ]),
  ADMIN: new Set([
    'm.samee.30765@khi.iba.edu.pk',
    'admin@khi.iba.edu.pk',
  ]),
};

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !password || !role) {
    return res.status(400).json({
      code: 400,
      message: 'Role, name, email, and password are required.',
    });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      code: 400,
      message: 'Invalid role. Allowed values are STUDENT, ORGANIZER, or ADMIN.',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!UNIVERSITY_EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({
      code: 400,
      message: 'Please use a valid IBA university email address.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      code: 400,
      message: 'Password must be at least 8 characters.',
    });
  }

  if (
    (role === 'ORGANIZER' || role === 'ADMIN') &&
    !ALLOWED_ROLE_EMAILS[role]?.has(normalizedEmail)
  ) {
    return res.status(403).json({
      code: 403,
      message: `This email is not on the allowed list for ${role}.`,
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id, verified FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0 && existingUser.rows[0].verified) {
      return res.status(409).json({
        code: 409,
        message: 'An account with this email is already verified.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 1000000);
    const codeExpiryTime = new Date(Date.now() + 15 * 60 * 1000);

    if (existingUser.rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET name = $1,
             password_hash = $2,
             role = $3,
             code = $4,
             code_expiry_time = $5
         WHERE id = $6`,
        [
          name.trim(),
          passwordHash,
          role,
          verificationCode,
          codeExpiryTime,
          existingUser.rows[0].id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, code, code_expiry_time, verified)
         VALUES ($1, $2, $3, $4, $5, $6, FALSE)`,
        [
          name.trim(),
          normalizedEmail,
          passwordHash,
          role,
          verificationCode,
          codeExpiryTime,
        ]
      );
    }

    return res.status(200).json({
      data: {
        email: normalizedEmail,
        status: 'PENDING_VERIFICATION',
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error.',
    });
  }
});

export default router;