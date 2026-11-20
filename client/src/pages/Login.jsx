import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { HOME_BY_ROLE, useAuth } from '../auth/AuthContext';
import './Login.css';

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Already signed in - no reason to show the form again.
    if (user) return <Navigate to={HOME_BY_ROLE[user.role] ?? '/login'} replace />;

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setSubmitting(true);

        try {
            const loggedIn = await login(email, password);
            navigate(HOME_BY_ROLE[loggedIn.role] ?? '/login', { replace: true });
        } catch (err) {
            // The form keeps its values so the user can correct and retry.
            setMessage(err.message);
            setSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit} noValidate>
                <h1>Sign in</h1>
                <p className="login-subtitle">SSI Management - University Events</p>

                {message && <p className="login-error" role="alert">{message}</p>}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                />

                <Link className="login-forgot" to="/forgot-password">Forgot password?</Link>

                <button type="submit" className="login-button" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="login-divider">New to SSI Management?</p>

                <button
                    type="button"
                    className="login-secondary"
                    onClick={() => navigate('/signup')}
                    disabled={submitting}
                >
                    Create an account
                </button>
            </form>
        </main>
    );
}
