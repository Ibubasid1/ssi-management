import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import './OrganizerNav.css';

/**
 * Top bar shown on every organizer screen, per the wireframes.
 * "Check-in" has no route yet, so it is shown but not clickable.
 */
export default function OrganizerNav() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login', { replace: true });
    }

    return (
        <header className="org-nav">
            <div className="org-nav-inner">
                <span className="org-nav-brand">SSI MANAGEMENT</span>

                <nav className="org-nav-links">
                    <Link
                        to="/organizer"
                        className={pathname === '/organizer' ? 'org-nav-link is-active' : 'org-nav-link'}
                    >
                        My events
                    </Link>
                    <Link
                        to="/organizer/events/new"
                        className={pathname === '/organizer/events/new' ? 'org-nav-link is-active' : 'org-nav-link'}
                    >
                        Create event
                    </Link>
                    <span className="org-nav-link is-disabled" title="Not built yet">Check-in</span>
                </nav>

                <div className="org-nav-right">
                    <span className="org-nav-role">{user?.role === 'ORGANIZER' ? 'Organizer' : user?.role}</span>
                    <button type="button" className="org-nav-logout" onClick={handleLogout}>Log out</button>
                </div>
            </div>
        </header>
    );
}
