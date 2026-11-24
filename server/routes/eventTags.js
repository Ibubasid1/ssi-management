import { Router } from 'express';
import pool from '../db.js';
import { validateEventTags } from '../utils/eventTags.js';

const router = Router();

// Validates up to 3 tags (used by organizer UI / integration checks)
router.post('/event-tags/validate', (req, res) => {
  const { tags } = req.body ?? {};
  const result = validateEventTags(tags, { defaultEmpty: true });

  if (!result.valid) {
    return res.status(result.code).json({
      code: result.code,
      message: result.message,
    });
  }

  return res.status(200).json({
    data: { tags: result.tags },
  });
});

// Attaches/updates up to 3 tags on an existing event once the `events` table exists
router.patch('/events/:id/tags', async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body ?? {};

  if (!Array.isArray(tags)) {
    return res.status(400).json({
      code: 400,
      message: 'Tags must be provided as an array of up to 3 strings.',
    });
  }

  const result = validateEventTags(tags);
  if (!result.valid) {
    return res.status(result.code).json({
      code: result.code,
      message: result.message,
    });
  }

  try {
    const update = await pool.query(
      'UPDATE events SET tags = $1 WHERE id = $2 RETURNING id, tags',
      [result.tags, id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Event not found.',
      });
    }

    return res.status(200).json({
      data: {
        event_id: String(update.rows[0].id),
        tags: update.rows[0].tags,
      },
    });
  } catch (err) {
    console.error('Event tags update error:', err.message);
    return res.status(500).json({
      code: 500,
      message: 'Failed to update event tags.',
    });
  }
});

export default router;