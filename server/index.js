import express from 'express';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  const {email, code} = req.body;
  const correctCode = await pool.query('SELECT code FROM users WHERE email = $1', [email]);
  if(code != correctCode) return res.status(400).json({error: 'Incorrect Code'});
  else{
    const expiryExists = await pool.query('SELECT code_expiry_time IS NULL AS is_empty FROM users WHERE email = $1', [email]);
    const expiryTime = await pool.query('SELECT code_expiry_time FROM users WHERE email = $1', [email]);
    if(Date.now() > expiryTime && !expiryExists) return res.status(400).json({error: 'Code timed out'});
    await pool.query('UPDATE users SET verified TO $1 WHERE email = $2', ['true', email]);
    res.status(201).json({status: 'Account created successfully'});
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});