import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../token.js';
import { validateEventFields } from '../eventValidation.js';
import { validateEventTags } from '../utils/eventTags.js';

const router = Router();

const REQUIRED_FIELDS = ['name', 'description', 'date_time', 'venue', 'category', 'capacity'];

/**
 * 2.3 POST /events  (Requires Authorization)
 * 201 -> { data: { event_id, status: "PENDING" } }
 * 400 -> { code, message }   invalid field, past date, bad capacity, >3 tags
 * 401 -> { code, message }   not authenticated   (handled by authenticate)
 * 403 -> { code, message }   not an organizer
 */
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'ORGANIZER') {
    return res.status(403).json({ code: 403, message: 'Only organizers can create events.' });
  }

  const body = req.body || {};

  const missing = REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === null);
  if (missing.length > 0) {
    return res.status(400).json({ code: 400, message: `Missing required field(s): ${missing.join(', ')}.` });
  }

  // Shared with the edit story (2.4) so both endpoints reject the same things.
  const fieldError = validateEventFields({
    name: body.name,
    description: body.description,
    date_time: body.date_time,
    venue: body.venue,
    category: body.category,
    capacity: body.capacity,
  });
  if (fieldError) {
    return res.status(400).json({ code: 400, message: fieldError });
  }

  // Tags go through the tag story's helper, which lowercases them. The browse
  // filter (2.1) matches lowercase, so storing them any other way would make
  // tagged events unfindable.
  const tagResult = validateEventTags(body.tags, { defaultEmpty: true });
  if (!tagResult.valid) {
    return res.status(tagResult.code).json({ code: tagResult.code, message: tagResult.message });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO events (organizer_id, name, description, category, tags, date_time, venue, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, status`,
      [
        req.user.id,
        body.name.trim(),
        body.description.trim(),
        body.category,
        tagResult.tags,
        body.date_time,
        body.venue.trim(),
        body.capacity,
      ],
    );

    return res.status(201).json({
      data: {
        event_id: String(rows[0].id),
        status: rows[0].status,
      },
    });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ code: 500, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
