import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ChangePassword.jsx already reads the bearer token from localStorage['token'],
// so login writes it under that key. The rest of the user goes beside it.
const TOKEN_KEY = 'token';
const USER_KEY = 'ssi.user';

export const HOME_BY_ROLE = {
    STUDENT: '/student',
    ORGANIZER: '/organizer',
    ADMIN: '/admin'
};

const AuthContext = createContext({user: null});

function readStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;

        const stored = JSON.parse(raw);

        // Tokens last 24 hours. Drop an expired one rather than letting the
        // user into a dashboard whose API calls would all fail with 401.
        if (stored.expires_at && Date.parse(stored.expires_at) <= Date.now()) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return null;
        }

        return stored;
    } catch {
        return null;
    }
}

export function AuthProvider({children}){
    const [user, setUser] = useState(readStoredUser);

    // Returns the logged-in user, or throws an Error carrying the message the
    // API sent back, which is written to be shown to the user as-is.
    const login = useCallback(async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(body.message || 'Login failed. Please try again.');

        const {token, ...profile} = body.data;

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setUser(profile);

        return profile;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    const value = useMemo(() => ({user, login, logout}), [user, login, logout]);

    return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
    return useContext(AuthContext);
}
