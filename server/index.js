import express from 'express';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const ALLOWED_ROLES = ['STUDENT', 'ORGANIZER', 'ADMIN'];
const UNIVERSITY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(khi\.)?iba\.edu\.pk$/i;

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
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

  try {
    // Section 1.1: Ensure ORGANIZER and ADMIN are on the allowed emails list
    if (role === 'ORGANIZER' || role === 'ADMIN') {
      const allowedCheck = await pool.query(
        'SELECT email FROM allowed_role_emails WHERE email = $1 AND role = $2',
        [normalizedEmail, role]
      );
      if (allowedCheck.rows.length === 0) {
        return res.status(403).json({
          code: 403,
          message: `This email is not authorized to register as ${role}.`,
        });
      }
    }

    const existingUser = await pool.query(
      'SELECT id, is_verified FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0 && existingUser.rows[0].is_verified) {
      return res.status(409).json({
        code: 409,
        message: 'An account with this email is already verified.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser.rows.length > 0) {
      // Unverified account exists: update with new registration details
      await pool.query(
        `UPDATE users
         SET name = $1, password_hash = $2, role = $3
         WHERE id = $4`,
        [name.trim(), passwordHash, role, existingUser.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, FALSE)`,
        [name.trim(), normalizedEmail, passwordHash, role]
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});