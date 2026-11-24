import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import OrganizerNav from '../components/OrganizerNav.jsx';
import TagInput from '../components/TagInput.jsx';
import './CreateEvent.css';

const CATEGORIES = ['SOCIETY_FEST', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'DEPARTMENTAL'];

// "SOCIETY_FEST" is stored, "Society Fest" is shown, as in the wireframe.
function prettyCategory(value) {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CreateEvent() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        description: '',
        date_time: '',
        venue: '',
        category: '',
        capacity: '',
    });
    const [tags, setTags] = useState([]);
    const [message, setMessage] = useState('');
    const [created, setCreated] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setSubmitting(true);

        // The picker gives "2026-12-01T18:30" with no timezone, so convert it to
        // a full ISO string rather than leaving the server to guess.
        const dateTime = form.date_time ? new Date(form.date_time).toISOString() : '';

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    date_time: dateTime,
                    venue: form.venue,
                    category: form.category,
                    capacity: Number(form.capacity),
                    tags,
                }),
            });

            const body = await res.json().catch(() => ({}));

            if (res.status === 401) {
                // Token missing or expired - send them back to sign in.
                logout();
                navigate('/login', { replace: true });
                return;
            }

            if (!res.ok) {
                setMessage(body.message || 'Could not create the event. Please try again.');
                setSubmitting(false);
                return;
            }

            setCreated(body.data);
        } catch {
            setMessage('Could not reach the server. Please try again.');
            setSubmitting(false);
        }
    }

    if (created) {
        return (
            <>
                <OrganizerNav />
                <main className="event-page">
                    <h1 className="event-title">Create event</h1>
                    <div className="event-card">
                        <p className="event-success" role="status">
                            Submitted for approval. The event is now <strong>{created.status}</strong> and
                            has entered the admin approval queue.
                        </p>
                        <p className="event-reference">Reference: #{created.event_id}</p>
                        <div className="event-actions">
                            <button type="button" className="event-primary" onClick={() => navigate('/organizer')}>
                                Back to my events
                            </button>
                            <button
                                type="button"
                                className="event-secondary"
                                onClick={() => { setCreated(null); setForm({ name: '', description: '', date_time: '', venue: '', category: '', capacity: '' }); setTags([]); setSubmitting(false); }}
                            >
                                Create another
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <OrganizerNav />
            <main className="event-page">
                <h1 className="event-title">Create event</h1>

                <form className="event-card" onSubmit={handleSubmit} noValidate>
                    {message && <p className="event-error" role="alert">{message}</p>}

                    <div className="event-field">
                        <label htmlFor="name">Event name <span className="event-required">*</span></label>
                        <input
                            id="name"
                            placeholder="e.g. Tech Society Fest"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            disabled={submitting}
                        />
                    </div>

                    <div className="event-field">
                        <label htmlFor="description">Description <span className="event-required">*</span></label>
                        <textarea
                            id="description"
                            rows="4"
                            placeholder="What is the event about?"
                            value={form.description}
                            onChange={(e) => update('description', e.target.value)}
                            disabled={submitting}
                        />
                    </div>

                    <div className="event-row">
                        <div className="event-field">
                            <label htmlFor="date_time">Date &amp; time <span className="event-required">*</span></label>
                            <input
                                id="date_time"
                                type="datetime-local"
                                value={form.date_time}
                                onChange={(e) => update('date_time', e.target.value)}
                                disabled={submitting}
                            />
                            <p className="event-hint">Must be a future date/time.</p>
                        </div>

                        <div className="event-field">
                            <label htmlFor="venue">Venue <span className="event-required">*</span></label>
                            <input
                                id="venue"
                                placeholder="e.g. Main Auditorium"
                                value={form.venue}
                                onChange={(e) => update('venue', e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="event-row">
                        <div className="event-field">
                            <label htmlFor="category">Category <span className="event-required">*</span></label>
                            <select
                                id="category"
                                value={form.category}
                                onChange={(e) => update('category', e.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Choose a category</option>
                                {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>{prettyCategory(category)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="event-field">
                            <label htmlFor="capacity">Capacity <span className="event-required">*</span></label>
                            <input
                                id="capacity"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="e.g. 50"
                                value={form.capacity}
                                onChange={(e) => update('capacity', e.target.value)}
                                disabled={submitting}
                            />
                            <p className="event-hint">Must be a positive number.</p>
                        </div>
                    </div>

                    <TagInput tags={tags} onChange={setTags} disabled={submitting} />

                    <div className="event-actions">
                        <button type="submit" className="event-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit for approval'}
                        </button>
                        <button
                            type="button"
                            className="event-secondary"
                            onClick={() => navigate('/organizer')}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    </div>

                    <p className="event-footnote">Required fields are marked *.</p>
                </form>
            </main>
        </>
    );
}
