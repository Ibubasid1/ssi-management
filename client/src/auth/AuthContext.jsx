import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ssi.user';

/** Where each role lands after a successful login. */
export const HOME_BY_ROLE = {
  student: '/student',
  organizer: '/organizer',
  admin: '/admin',
};

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  /**
   * Calls the login endpoint.
   * Returns the logged-in user on success, or throws an Error whose
   * message is safe to show to the user.
   */
  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      // Server returned something that was not JSON.
    }

    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please try again.');
    }

    setUser(data.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}
