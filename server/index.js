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

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});