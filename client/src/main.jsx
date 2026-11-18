import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router'
import { AuthProvider, HOME_BY_ROLE, useAuth } from './auth/AuthContext'
import RequireRole from './auth/RequireRole.jsx'
import './index.css'
import AdminDashboard from './pages/AdminDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Verify from './pages/Verify'

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? (HOME_BY_ROLE[user.role] ?? '/login'): '/login'} replace />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} /> and <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <RequireRole roles={['STUDENT']}>
        <Route path="/student" element={<StudentDashboard />} />
        </RequireRole>
        <RequireRole roles={['ORGANIZER']}>
        <Route path="/organizer" element={<OrganizerDashboard />} />
        </RequireRole>
        <RequireRole roles={['ADMIN']}>
        <Route path="/admin" element={<AdminDashboard />} />
        </RequireRole>
        <RequireRole roles={['STUDENT', 'ORGANIZER', 'ADMIN ']}>
        <Route path="/change-password" element={<ChangePassword />} />
        </RequireRole>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
