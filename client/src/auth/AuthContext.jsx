import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ssi.user';

export const HOME_BY_ROLE = {
    STUDENT: '/student',
    ORGANIZER: '/organizer',
    ADMIN: '/admin'
};

const AuthContext = createContext({user: null});

function readStoredUser() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({children}){
    const [user, setUser] = useState(readStoredUser);

    // Returns the logged-in user, or throws an Error whose message is the one
    // the API sent back and is safe to show.
    const login = useCallback(async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(body.message || 'Login failed. Please try again.');

        setUser(body.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(body.data));
        return body.data;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const value = useMemo(() => ({user, login, logout}), [user, login, logout]);

    return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
    return useContext(AuthContext);
}
