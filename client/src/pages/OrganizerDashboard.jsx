import { useNavigate } from 'react-router';
import OrganizerNav from '../components/OrganizerNav.jsx';
import './CreateEvent.css';

/**
 * "My events" per the wireframes. The event list itself belongs to the
 * GET /events/mine story (API doc 2.6) - only the shell and the
 * "+ Create event" entry point are here.
 */
export default function OrganizerDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <OrganizerNav />
      <main className="event-page">
        <div className="event-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="event-title" style={{ margin: 0 }}>My events</h1>
          <button type="button" className="event-primary" onClick={() => navigate('/organizer/events/new')}>
            + Create event
          </button>
        </div>

        <p className="event-hint" style={{ marginTop: 20 }}>
          The event list is part of the &quot;my events&quot; story and is not built yet.
        </p>
      </main>
    </>
  );
}
