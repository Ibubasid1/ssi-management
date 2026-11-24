// Field checks for creating/editing an event (API doc 2.3 and 2.4).
// Pure functions: no database and no Express, so they are easy to test.

export const CATEGORIES = ['SOCIETY_FEST', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'DEPARTMENTAL'];
export const MAX_TAGS = 3;

// Returns an error message for the first invalid field, or null if all given fields are fine.
// Only the fields present in `fields` are checked, so it works for a partial edit (PATCH).
export function validateEventFields(fields, now = new Date()) {
  if ('name' in fields) {
    if (typeof fields.name !== 'string' || !fields.name.trim()) {
      return 'Event name cannot be empty.';
    }
  }
  if ('description' in fields) {
    if (typeof fields.description !== 'string' || !fields.description.trim()) {
      return 'Description cannot be empty.';
    }
  }
  if ('venue' in fields) {
    if (typeof fields.venue !== 'string' || !fields.venue.trim()) {
      return 'Venue cannot be empty.';
    }
  }
  if ('date_time' in fields) {
    const date = new Date(fields.date_time);
    if (typeof fields.date_time !== 'string' || Number.isNaN(date.getTime())) {
      return 'Date and time is not valid.';
    }
    if (date <= now) {
      return 'Date and time must be in the future.';
    }
  }
  if ('category' in fields) {
    if (!CATEGORIES.includes(fields.category)) {
      return `Category must be one of: ${CATEGORIES.join(', ')}.`;
    }
  }
  if ('capacity' in fields) {
    if (!Number.isInteger(fields.capacity) || fields.capacity <= 0) {
      return 'Capacity must be a positive whole number.';
    }
  }
  if ('tags' in fields) {
    if (!Array.isArray(fields.tags) || fields.tags.some((t) => typeof t !== 'string' || !t.trim())) {
      return 'Tags must be a list of non-empty text values.';
    }
    if (cleanTags(fields.tags).length > MAX_TAGS) {
      return `An event can have at most ${MAX_TAGS} tags.`;
    }
  }
  return null;
}

// Trims tags and removes duplicates (ignoring upper/lower case), so "Tech" and "tech " count once.
export function cleanTags(tags) {
  const seen = new Set();
  const result = [];
  for (const tag of tags) {
    const trimmed = tag.trim();
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  }
  return result;
}
