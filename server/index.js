import express from 'express';
import pool from './db.js';
import {sendVerificationCode} from './verification.js';

setInterval(async () => {
  try{
  await pool.query("DELETE FROM users WHERE verified = false AND code_expiry_time + interval '20 minutes' < $1",
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
  const {email, code} = req.body;
  if(!email || !code) return res.status(400).json({error: 'Missing field(s)'});
  const query = await pool.query('SELECT code, code_expiry_time FROM users WHERE email = $1', [email]);
  if(query.rows.length == 0) return res.status(400).json({error: 'No user has this email'});
  if(code != query.rows[0].code) return res.status(400).json({error: 'Incorrect Code'});
  else{
    if(Date.now() > query.rows[0].code_expiry_time && query.rows[0].code_expiry_time) return res.status(400).json({error: 'Code timed out'});
    await pool.query('UPDATE users SET verified = $1 WHERE email = $2', ['true', email]);
    res.status(201).json({status: 'Account created successfully'});
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  const {email} = req.body;
  if(!email) return res.status(400).json({error: "Missing email field"});
  const query = await pool.query('SELECT 1 FROM users WHERE email = $1 AND verified = false', [email]);
  if(query.rows.length == 0) return res.status(404).json({error: 'No pending sign-up for this email'});
  await sendVerificationCode(email);
  res.status(200).json({status: 'New code sent'});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});