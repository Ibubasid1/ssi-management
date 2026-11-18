import express from 'express';
import pool from './db.js';
import signupRouter from './routes/signup.js';
import verifyRouter from './routes/verify.js';
import authRouter from './routes/auth.js';
import passwordResetRouter from './routes/passwordReset.js';
import changePasswordRouter from './routes/changePassword.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.use('/api/auth', signupRouter);
app.use('/api/auth', verifyRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth', passwordResetRouter);
app.use('/api/auth', changePasswordRouter);

app.use((err, req, res, next) => {
  if(err.status >= 400 && err.status < 500) return res.status(400).json({code: 400, message: 'Invalid request body'});
console.error(err);
res.status(500).json({code: 500, message: 'Something went wrong on our server'});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});