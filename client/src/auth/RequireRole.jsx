import { Navigate } from 'react-router';
import { HOME_BY_ROLE, useAuth } from './AuthContext.jsx';

/**
 * Wraps a route so only a logged-in user with one of `roles` can see it.
 * Anyone not logged in goes to /login; a logged-in user with the wrong
 * role is sent to their own home page instead.
 */
export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] ?? '/login'} replace />;
  }

  return children;
}
