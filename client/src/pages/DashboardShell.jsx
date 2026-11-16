import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * Shared frame for every role's home page.
 * Each role's own dashboard fills in `children`.
 */
export default function DashboardShell({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14 }}>
            Signed in as {user.name} ({user.role})
          </p>
        </div>
        <button type="button" onClick={handleLogout} style={{ font: 'inherit', fontSize: 15, padding: '8px 14px', cursor: 'pointer' }}>
          Log out
        </button>
      </header>

      {children}
    </main>
  );
}
