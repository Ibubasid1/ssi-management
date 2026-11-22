import { validateEventFields } from './eventValidation.js';

// Fields an organizer may still change after the admin approved the event (API doc 2.4).
export const EDITABLE_AFTER_APPROVAL = ['name', 'description', 'capacity', 'tags'];
export const EDITABLE_FIELDS = ['name', 'description', 'date_time', 'venue', 'category', 'capacity', 'tags'];

// Decides if `userId` may apply the edit `body` to `event`.
// event: { organizer_id, status, date_time, registered_count }
// Returns { ok: true, changes } with only the known fields, or { ok: false, status, message }.
export function checkEventEdit(event, userId, body, now = new Date()) {
  if (event.organizer_id !== userId) {
    return fail(403, 'You can only edit your own events.');
  }
  if (new Date(event.date_time) <= now) {
    return fail(409, 'This event has already started and cannot be edited.');
  }
  if (event.status === 'CANCELLED') {
    return fail(409, 'A cancelled event cannot be edited.');
  }
  if (event.status === 'REJECTED') {
    return fail(409, 'A rejected event cannot be edited.');
  }

  const changes = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in (body ?? {})) changes[field] = body[field];
  }
  if (Object.keys(changes).length === 0) {
    return fail(400, 'No changes were provided.');
  }

  if (event.status === 'APPROVED') {
    const locked = Object.keys(changes).filter((f) => !EDITABLE_AFTER_APPROVAL.includes(f));
    if (locked.length > 0) {
      return fail(409, `After approval only name, description, capacity and tags can be edited (not: ${locked.join(', ')}).`);
    }
  }

  const problem = validateEventFields(changes, now);
  if (problem) return fail(400, problem);

  if ('capacity' in changes && changes.capacity < event.registered_count) {
    return fail(400, `Capacity cannot be lower than the ${event.registered_count} students already registered.`);
  }

  return { ok: true, changes };
}

function fail(status, message) {
  return { ok: false, status, message };
}
