import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;

/**
 * Hash a plain-text password.
 * Format stored in the database: scrypt$<salt-hex>$<hash-hex>
 */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/**
 * Check a plain-text password against a stored hash.
 * Uses a constant-time comparison so an attacker cannot measure how
 * much of the hash matched.
 */
export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;

  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, salt, expected.length);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/**
 * A throwaway hash used when the email does not exist, so that a failed
 * login takes roughly the same time whether or not the account is real.
 * Without this, response timing leaks which emails are registered.
 */
const DUMMY_HASH = await hashPassword(randomBytes(32).toString('hex'));

export async function wasteTime() {
  await verifyPassword('not-a-real-password', DUMMY_HASH);
}
