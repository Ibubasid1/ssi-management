import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = Router();

// Compared against when the email is not registered, so a failed login takes
// roughly the same time whether or not the account exists. Without this, the
// response time alone reveals which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-never-used', 10);

// The same message is returned for an unknown email and a wrong password.
// Telling them apart would let someone discover which emails are registered.
const INVALID_CREDENTIALS = 'Invalid email or password';

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ code: 400, message: 'Missing field(s)' });
  }

  const query = await pool.query(
    'SELECT id, password_hash, role, verified FROM users WHERE email = $1',
    [String(email).toLowerCase().trim()],
  );

  if (query.rows.length == 0) {
    await bcrypt.compare(password, DUMMY_HASH);
    return res.status(401).json({ code: 401, message: INVALID_CREDENTIALS });
  }

  const user = query.rows[0];

  if (!await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ code: 401, message: INVALID_CREDENTIALS });
  }

  // Checked only after the password is confirmed, so this message cannot be
  // used to find out which emails are registered.
  if (!user.verified) {
    return res.status(401).json({ code: 401, message: 'Account is not verified' });
  }

  res.status(200).json({ data: { user_id: String(user.id), role: user.role } });
});

export default router;
