import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import './ResetPassword.css'

const minPasswordLength = 8

// The server sends this message when the link is expired, already used, or unknown.
const invalidLinkMessage = 'This reset link is invalid or has expired. Please request a new one.'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLinkInvalid, setIsLinkInvalid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLinkInvalid(false)

    if (newPassword.length < minPasswordLength) {
      setError(`Password must be at least ${minPasswordLength} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      })
      const body = await response.json()

      if (response.ok) {
        setMessage(body.data.message)
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(body.message)
        // Offer a new link only when the link itself is the problem.
        setIsLinkInvalid(response.status === 400 && body.message === invalidLinkMessage)
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const requestNewLink = (
    <p className="reset-link">
      <Link to="/forgot-password">Request a new link</Link>
    </p>
  )

  return (
    <div className="reset-page">
      <header className="reset-header">
        <span className="reset-brand">▦ SSI Management</span>
        <span className="reset-header-note">Event Management</span>
      </header>

      <main className="reset-content">
        {!token ? (
          <>
            <h1 className="reset-title">Reset password</h1>
            <p className="reset-error" role="alert">This reset link is not valid.</p>
            {requestNewLink}
          </>
        ) : (
          <>
            <h1 className="reset-title">Set a new password</h1>
            <p className="reset-subtitle">Opened from the reset link in your email.</p>

            <form className="reset-card" onSubmit={handleSubmit}>
              <label className="reset-label" htmlFor="newPassword">New password</label>
              <input
                className="reset-input"
                id="newPassword"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <label className="reset-label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                className="reset-input"
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button className="reset-button" type="submit" disabled={isLoading || Boolean(message)}>
                {isLoading ? 'Saving...' : 'Save new password'}
              </button>
            </form>

            {message && <p className="reset-success" role="status">{message}</p>}
            {error && <p className="reset-error" role="alert">{error}</p>}
            {isLinkInvalid && requestNewLink}
          </>
        )}
      </main>
    </div>
  )
}

export default ResetPassword
