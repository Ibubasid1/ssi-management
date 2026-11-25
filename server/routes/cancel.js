import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../token.js';

const router = Router();

router.post('/:id/cancel', authenticate, async (req, res) => {
    const eventID = Number(req.params.id);
    if (!Number.isInteger(eventID) || eventID <= 0) return res.status(404).json({code: 404, message: 'Invalid event ID'});
    if (req.user.role !== 'ORGANIZER') return res.status(403).json({code: 403, message: "Not an organizer"});
    const query = await pool.query('SELECT * FROM events WHERE id = $1', [eventID]);
    if (query.rows.length == 0) return res.status(404).json({code: 404, message: 'Event not found'});
    if (query.rows[0].organizer_id !== req.user.id) return res.status(403).json({code: 403, message: 'Not the organizer for this event'});
    if (query.rows[0].date_time <= Date.now()) return res.status(409).json({code: 409, message: 'Event has already started'});
    if (query.rows[0].status == 'CANCELLED') return res.status(409).json({code: 409, message: 'Event is already cancelled'});
    if (query.rows[0].status == 'REJECTED') return res.status(409).json({code: 409, message: 'Event was rejected'});
    await pool.query("UPDATE events SET status = $1 WHERE id = $2", ['CANCELLED', eventID]);
    return res.status(200).json({data: {event_id: String(eventID), status: "CANCELLED"}});
})

export default router;