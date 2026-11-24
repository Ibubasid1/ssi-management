import { useState } from 'react';
import TagInput from '../components/TagInput';
import EventTagList from '../components/EventTagList';
import './EventTags.css';

export default function EventTags() {
  const [eventId, setEventId] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!eventId.trim()) {
      setError('Please enter an Event ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(eventId.trim())}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.message || 'Failed to save event tags.');
      } else {
        setSuccess(`Saved ${body.data.tags.length} tag(s) for event #${body.data.event_id}.`);
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-tags-page">
      <h2>Manage Event Tags</h2>
      <p className="event-tags-subtitle">
        Attach up to 3 discovery tags so students can find your event easily.
      </p>

      {error && <div className="event-tags-alert-error">{error}</div>}
      {success && <div className="event-tags-alert-success">{success}</div>}

      <form onSubmit={handleSave}>
        <div className="event-tags-field">
          <label htmlFor="eventId">Event ID</label>
          <input
            id="eventId"
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>

        <TagInput tags={tags} onChange={setTags} disabled={loading} />

        <button type="submit" className="event-tags-submit" disabled={loading}>
          {loading ? 'Saving Tags...' : 'Save Event Tags'}
        </button>
      </form>

      {tags.length > 0 && (
        <div className="event-tags-preview">
          <small style={{ color: '#6b7280' }}>Student Card Preview:</small>
          <EventTagList tags={tags} />
        </div>
      )}
    </div>
  );
}