import { Router } from 'express';
import { requireRole } from '../middleware/scrum24RoleAccess.js';

const router = Router();

router.get('/student', requireRole('STUDENT'), (req, res) => {
  res.json({ data: { role: req.user.role } });
});

router.get('/organizer', requireRole('ORGANIZER'), (req, res) => {
  res.json({ data: { role: req.user.role } });
});

router.get('/admin', requireRole('ADMIN'), (req, res) => {
  res.json({ data: { role: req.user.role } });
});

export default router;
