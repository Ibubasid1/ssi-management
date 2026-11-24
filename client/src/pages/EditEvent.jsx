import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import OrganizerNav from '../components/OrganizerNav.jsx';
import TagInput from '../components/TagInput.jsx';
import './CreateEvent.css';

const CATEGORIES = ['SOCIETY_FEST', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'DEPARTMENTAL'];

// Fields the organizer can still change once an event is APPROVED (API doc 2.4).
const LOCKED_AFTER_APPROVAL = ['date_time', 'venue', 'category'];

function prettyCategory(value) {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// "2026-12-01T18:30:00.000Z" -> "2026-12-01T18:30" for the datetime-local input.
function toLocalInputValue(isoString) {
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditEvent() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState(null);
    const [tags, setTags] = useState([]);
    const [status, setStatus] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [message, setMessage] = useState('');
    const [saved, setSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(`/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const body = await res.json().catch(() => ({}));

                if (res.status === 401) {
                    logout();
                    navigate('/login', { replace: true });
                    return;
                }
                if (!res.ok) {
                    if (!cancelled) setLoadError(body.message || 'Could not load this event.');
                    return;
                }
                if (cancelled) return;

                const event = body.data;
                setStatus(event.status);
                setForm({
                    name: event.name,
                    description: event.description,
                    date_time: toLocalInputValue(event.date_time),
                    venue: event.venue,
                    category: event.category,
                    capacity: String(event.capacity),
                });
                setTags(event.tags || []);
            } catch {
                if (!cancelled) setLoadError('Could not reach the server. Please try again.');
            }
        }

        load();
        return () => { cancelled = true; };
    }, [id, logout, navigate]);

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setSubmitting(true);

        const dateTime = form.date_time ? new Date(form.date_time).toISOString() : '';

        // Once approved, only name/description/capacity/tags may change, so those
        // disabled fields must not be sent even though the form still holds them
        // (sending the old value back would still count as changing it).
        const payload = { name: form.name, description: form.description, capacity: Number(form.capacity), tags };
        if (status !== 'APPROVED') {
            payload.date_time = dateTime;
            payload.venue = form.venue;
            payload.category = form.category;
        }

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const body = await res.json().catch(() => ({}));

            if (res.status === 401) {
                logout();
                navigate('/login', { replace: true });
                return;
            }

            if (!res.ok) {
                setMessage(body.message || 'Could not save the event. Please try again.');
                setSubmitting(false);
                return;
            }

            setSaved(true);
        } catch {
            setMessage('Could not reach the server. Please try again.');
            setSubmitting(false);
        }
    }

    if (loadError) {
        return (
            <>
                <OrganizerNav />
                <main className="event-page">
                    <h1 className="event-title">Edit event</h1>
                    <p className="event-error" role="alert">{loadError}</p>
                    <button type="button" className="event-secondary" onClick={() => navigate('/organizer')}>
                        Back to my events
                    </button>
                </main>
            </>
        );
    }

    if (!form) {
        return (
            <>
                <OrganizerNav />
                <main className="event-page">
                    <h1 className="event-title">Edit event</h1>
                    <p>Loading...</p>
                </main>
            </>
        );
    }

    if (saved) {
        return (
            <>
                <OrganizerNav />
                <main className="event-page">
                    <h1 className="event-title">Edit event</h1>
                    <div className="event-card">
                        <p className="event-success" role="status">Event updated successfully.</p>
                        <div className="event-actions">
                            <button type="button" className="event-primary" onClick={() => navigate('/organizer')}>
                                Back to my events
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    // Once approved, only name, description, capacity and tags may change (API doc 2.4).
    const locked = status === 'APPROVED';

    return (
        <>
            <OrganizerNav />
            <main className="event-page">
                <h1 className="event-title">Edit event</h1>

                <form className="event-card" onSubmit={handleSubmit} noValidate>
                    {message && <p className="event-error" role="alert">{message}</p>}
                    {locked && (
                        <p className="event-hint">
                            This event is already approved, so only the name, description, capacity and tags can be changed.
                        </p>
                    )}

                    <div className="event-field">
                        <label htmlFor="name">Event name <span className="event-required">*</span></label>
                        <input
                            id="name"
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
                                disabled={submitting || locked}
                            />
                            <p className="event-hint">Must be a future date/time.</p>
                        </div>

                        <div className="event-field">
                            <label htmlFor="venue">Venue <span className="event-required">*</span></label>
                            <input
                                id="venue"
                                value={form.venue}
                                onChange={(e) => update('venue', e.target.value)}
                                disabled={submitting || locked}
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
                                disabled={submitting || locked}
                            >
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
                            {submitting ? 'Saving...' : 'Save changes'}
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
