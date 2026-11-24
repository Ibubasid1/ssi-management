import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../token.js';
import { checkEventEdit } from '../eventEditRules.js';

const router = Router();

/**
 * 2.4 PATCH /events/{id}  (Requires Authorization)
 * 200 -> { data: { message } }
 * 400 invalid field, past date, bad capacity, more than 3 tags
 * 401 not authenticated (handled by authenticate)
 * 403 not the owner of this event
 * 404 event not found
 * 409 event started, cancelled or rejected, or a locked field after approval
 */
router.patch('/:id', authenticate, async (req, res) => {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(404).json({ code: 404, message: 'Event not found.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, organizer_id, status, date_time FROM events WHERE id = $1',
      [eventId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: 'Event not found.' });
    }

    // There is no registrations table yet (browse/register stories), so nobody
    // can be registered. Replace 0 with a real count when that story lands.
    const event = { ...rows[0], registered_count: 0 };

    const result = checkEventEdit(event, req.user.id, req.body);
    if (!result.ok) {
      return res.status(result.status).json({ code: result.status, message: result.message });
    }

    // Column names come from the fixed list in eventEditRules.js, never from the request.
    const columns = Object.keys(result.changes);
    const setClause = columns.map((column, i) => `${column} = $${i + 2}`).join(', ');
    await pool.query(`UPDATE events SET ${setClause} WHERE id = $1`, [
      eventId,
      ...columns.map((column) => cleanValue(column, result.changes[column])),
    ]);

    return res.json({ data: { message: 'Event updated successfully.' } });
  } catch (err) {
    console.error('Edit event error:', err);
    return res.status(500).json({ code: 500, message: 'Something went wrong. Please try again.' });
  }
});

// Same trimming the create route does.
function cleanValue(column, value) {
  return ['name', 'description', 'venue'].includes(column) ? value.trim() : value;
}

export default router;
