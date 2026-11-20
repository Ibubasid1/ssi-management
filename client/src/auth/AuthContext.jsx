import { createContext, useContext } from 'react';

export const HOME_BY_ROLE = {
    STUDENT: '/student',
    ORGANIZER: '/organizer',
    ADMIN: '/admin'
};

const AuthContext = createContext({user: null});

export function AuthProvider({children}){
    return children;
}

export function useAuth() {
    return useContext(AuthContext);
}