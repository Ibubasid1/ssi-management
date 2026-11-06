import { readFile } from 'node:fs/promises';
import pool from '../db.js';

const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
const seed = await readFile(new URL('./seed.sql', import.meta.url), 'utf8');

await pool.query(schema);
await pool.query(seed);
console.log('Database reset: schema and seed loaded.');

await pool.end();