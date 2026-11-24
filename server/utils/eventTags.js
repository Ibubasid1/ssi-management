export const MAX_EVENT_TAGS = 3;
export const MAX_TAG_LENGTH = 30;


export function validateEventTags(rawTags, { defaultEmpty = false } = {}) {
  if (rawTags === undefined || rawTags === null) {
    return {
      valid: true,
      tags: defaultEmpty ? [] : undefined,
    };
  }

  if (!Array.isArray(rawTags)) {
    return {
      valid: false,
      code: 400,
      message: 'Tags must be an array of strings.',
    };
  }

  const normalized = [];
  const seen = new Set();

  for (const item of rawTags) {
    if (typeof item !== 'string') {
      return {
        valid: false,
        code: 400,
        message: 'Each tag must be a valid string.',
      };
    }

    const cleaned = item.trim().toLowerCase();
    if (!cleaned) {
      return {
        valid: false,
        code: 400,
        message: 'Tags cannot be empty or whitespace only.',
      };
    }

    if (cleaned.length > MAX_TAG_LENGTH) {
      return {
        valid: false,
        code: 400,
        message: `Each tag must be ${MAX_TAG_LENGTH} characters or fewer.`,
      };
    }

    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      normalized.push(cleaned);
    }
  }

  if (normalized.length > MAX_EVENT_TAGS) {
    return {
      valid: false,
      code: 400,
      message: `An event can have at most ${MAX_EVENT_TAGS} tags.`,
    };
  }

  return {
    valid: true,
    tags: normalized,
  };
}


export function buildTagFilterClause(tagQuery, paramIndex) {
  if (!tagQuery || typeof tagQuery !== 'string' || !tagQuery.trim()) {
    return null;
  }

  return {
    clause: `$${paramIndex} = ANY(tags)`,
    value: tagQuery.trim().toLowerCase(),
  };
}