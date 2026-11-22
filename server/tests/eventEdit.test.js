import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEventFields, cleanTags } from '../eventValidation.js';
import { checkEventEdit } from '../eventEditRules.js';

const now = new Date('2026-11-22T12:00:00Z');
const future = '2026-12-10T15:00:00Z';
const past = '2026-11-01T15:00:00Z';

const pendingEvent = { organizer_id: 7, status: 'PENDING', date_time: future, registered_count: 0 };
const approvedEvent = { organizer_id: 7, status: 'APPROVED', date_time: future, registered_count: 30 };

test('validation: empty body fields are rejected', () => {
  assert.match(validateEventFields({ name: '  ' }, now), /name/i);
  assert.match(validateEventFields({ description: '' }, now), /description/i);
  assert.match(validateEventFields({ venue: '' }, now), /venue/i);
});

test('validation: date must be valid and in the future', () => {
  assert.match(validateEventFields({ date_time: 'not a date' }, now), /not valid/i);
  assert.match(validateEventFields({ date_time: past }, now), /future/i);
  assert.equal(validateEventFields({ date_time: future }, now), null);
});

test('validation: category must be one of the five allowed values', () => {
  assert.match(validateEventFields({ category: 'PARTY' }, now), /Category/);
  assert.equal(validateEventFields({ category: 'WORKSHOP' }, now), null);
});

test('validation: capacity must be a positive whole number', () => {
  for (const bad of [0, -5, 2.5, '50', null]) {
    assert.match(validateEventFields({ capacity: bad }, now), /Capacity/, `capacity ${bad}`);
  }
  assert.equal(validateEventFields({ capacity: 50 }, now), null);
});

test('validation: at most 3 tags, duplicates count once', () => {
  assert.match(validateEventFields({ tags: ['a', 'b', 'c', 'd'] }, now), /at most 3/);
  assert.equal(validateEventFields({ tags: ['a', 'b', 'c'] }, now), null);
  assert.equal(validateEventFields({ tags: ['Tech', 'tech ', 'b', 'c'] }, now), null);
  assert.match(validateEventFields({ tags: ['a', ''] }, now), /non-empty/);
  assert.deepEqual(cleanTags(['Tech', ' tech', 'AI']), ['Tech', 'AI']);
});

test('validation: only the fields that are sent are checked', () => {
  assert.equal(validateEventFields({}, now), null);
  assert.equal(validateEventFields({ venue: 'Main Hall' }, now), null);
});

test('edit: another organizer gets 403', () => {
  const r = checkEventEdit(pendingEvent, 99, { venue: 'Hall' }, now);
  assert.deepEqual([r.ok, r.status], [false, 403]);
});

test('edit: event that already started gets 409', () => {
  const started = { ...pendingEvent, date_time: past };
  const r = checkEventEdit(started, 7, { venue: 'Hall' }, now);
  assert.deepEqual([r.ok, r.status], [false, 409]);
});

test('edit: cancelled and rejected events get 409', () => {
  for (const status of ['CANCELLED', 'REJECTED']) {
    const r = checkEventEdit({ ...pendingEvent, status }, 7, { venue: 'Hall' }, now);
    assert.deepEqual([r.ok, r.status], [false, 409], status);
  }
});

test('edit: empty body gets 400', () => {
  assert.equal(checkEventEdit(pendingEvent, 7, {}, now).status, 400);
  assert.equal(checkEventEdit(pendingEvent, 7, undefined, now).status, 400);
  assert.equal(checkEventEdit(pendingEvent, 7, { unknown_field: 1 }, now).status, 400);
});

test('edit: pending event allows every field', () => {
  const body = { name: 'New', description: 'D', date_time: future, venue: 'V', category: 'SEMINAR', capacity: 10, tags: ['x'] };
  const r = checkEventEdit(pendingEvent, 7, body, now);
  assert.equal(r.ok, true);
  assert.deepEqual(r.changes, body);
});

test('edit: unknown fields are ignored (status cannot be changed by the organizer)', () => {
  const r = checkEventEdit(pendingEvent, 7, { venue: 'V', status: 'APPROVED', organizer_id: 1 }, now);
  assert.equal(r.ok, true);
  assert.deepEqual(r.changes, { venue: 'V' });
});

test('edit: approved event allows only name, description, capacity, tags', () => {
  const ok = checkEventEdit(approvedEvent, 7, { name: 'N', description: 'D', capacity: 40, tags: ['a'] }, now);
  assert.equal(ok.ok, true);
  for (const field of ['venue', 'date_time', 'category']) {
    const value = field === 'date_time' ? future : field === 'category' ? 'SPORTS' : 'Hall';
    const r = checkEventEdit(approvedEvent, 7, { [field]: value }, now);
    assert.deepEqual([r.ok, r.status], [false, 409], field);
  }
});

test('edit: capacity cannot go below registered count', () => {
  const low = checkEventEdit(approvedEvent, 7, { capacity: 29 }, now);
  assert.deepEqual([low.ok, low.status], [false, 400]);
  assert.match(low.message, /30/);
  assert.equal(checkEventEdit(approvedEvent, 7, { capacity: 30 }, now).ok, true);
});

test('edit: invalid field value gets 400', () => {
  const r = checkEventEdit(pendingEvent, 7, { date_time: past }, now);
  assert.deepEqual([r.ok, r.status], [false, 400]);
});

test('edit: ownership is checked before anything else', () => {
  const r = checkEventEdit({ ...pendingEvent, status: 'CANCELLED' }, 99, { venue: 'V' }, now);
  assert.equal(r.status, 403);
});
