import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Tokens last 24 hours, as stated in the API document (Security and Authentication).
const TOKEN_LIFETIME_HOURS = 24;

// A missing secret would be a silent security hole in production, but throwing
// here would break everyone's server the moment they pull. Falling back to a
// random per-boot secret keeps the app running: tokens simply stop working
// after a restart, which is loud enough to notice in development.
const SECRET = process.env.JWT_SECRET || (() => {
  console.warn(
    '[auth] JWT_SECRET is not set. Using a random secret for this run, so ' +
    'logins will be dropped when the server restarts. Add JWT_SECRET to server/.env.',
  );
  return crypto.randomBytes(32).toString('hex');
})();

/**
 * Issues a signed token for a logged-in user.
 * Returns the token and the moment it expires.
 */
export function issueToken(user) {
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_HOURS * 60 * 60 * 1000);

  const token = jwt.sign(
    { sub: String(user.id), role: user.role },
    SECRET,
    { expiresIn: `${TOKEN_LIFETIME_HOURS}h` },
  );

  return { token, expiresAt };
}

/**
 * Express middleware for the endpoints marked "Requires Authorization".
 * Reads 'Authorization: Bearer <token>' and puts { id, role } on req.user.
 *
 * Not wired into any route yet - see the note in the pull request.
 */
export function authenticate(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ code: 401, message: 'Not authenticated.' });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    return res.status(401).json({ code: 401, message: 'Session expired. Please log in again.' });
  }
}
