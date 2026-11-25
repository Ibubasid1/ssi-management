import { authenticate } from '../token.js';

const roles = ['STUDENT', 'ORGANIZER', 'ADMIN'];

export function requireRole(...allowedRoles) {
  return [
    authenticate,
    (req, res, next) => {
      if (!roles.includes(req.user.role) ||
          !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          code: 403,
          message: 'You do not have permission to access this feature.'
        });
      }

      next();
    }
  ];
}
