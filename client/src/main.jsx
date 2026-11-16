import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router'
import './index.css'
import { AuthProvider, HOME_BY_ROLE, useAuth } from './auth/AuthContext.jsx'
import RequireRole from './auth/RequireRole.jsx'
import Login from './pages/Login.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import OrganizerDashboard from './pages/OrganizerDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

/** "/" sends you to your role's home page, or to the login form. */
function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? (HOME_BY_ROLE[user.role] ?? '/login') : '/login'} replace />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/student"
            element={
              <RequireRole roles={['student']}>
                <StudentDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/organizer"
            element={
              <RequireRole roles={['organizer']}>
                <OrganizerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={['admin']}>
                <AdminDashboard />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
