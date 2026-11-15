import express from 'express';
import pool from './db.js';
import {sendVerificationCode} from './verification.js';

setInterval(async () => {
  try{
  await pool.query("DELETE FROM users WHERE verified = false AND COALESCE(code_expiry_time, created_at) + interval '20 minutes' < $1",
     [new Date()])
    } catch(err) {
      console.error('Failed to delete unverified users: ', err.message);
    }
  }, 60 * 1000);
    

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
  const {email, code} = req.body ?? {};
  if(!email || !code) return res.status(400).json({code: 400, message: 'Missing field(s)'});
  const query = await pool.query('SELECT code, code_expiry_time, verified FROM users WHERE email = $1', [email]);
  if(query.rows.length == 0) return res.status(400).json({code: 400, message: 'No user has this email'});
  if(query.rows[0].verified) return res.status(409).json({code: 409, message: 'Account already verified'});
  if(code != query.rows[0].code) return res.status(400).json({code: 400, message: 'Incorrect Code'});
  else{
    if(!query.rows[0].code_expiry_time || Date.now() > query.rows[0].code_expiry_time) return res.status(400).json({code: 400, message: 'Code timed out'});
    const update = await pool.query('UPDATE users SET verified = $1, code = NULL, code_expiry_time = NULL WHERE email = $2 RETURNING id', ['true', email]);
    res.status(201).json({data: {user_id: String(update.rows[0].id)}});
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  const {email} = req.body ?? {};
  if(!email) return res.status(400).json({code: 400, message: "Missing email field"});
  const query = await pool.query('SELECT 1 FROM users WHERE email = $1 AND verified = false', [email]);
  if(query.rows.length == 0) return res.status(404).json({code: 404, message: 'No pending sign-up for this email'});
  await sendVerificationCode(email);
  res.status(200).json({data: {message: 'New code sent'}});
});

app.use((err, req, res, next) => {
  if(err.status == 400) return res.status(400).json({code: 400, message: 'Invalid request body'});
  console.error(err);
  res.status(500).json({code: 500, message: 'Something went wrong on our server'});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});