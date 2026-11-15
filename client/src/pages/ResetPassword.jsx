import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

const minPasswordLength = 8

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

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
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main>
        <h1>Reset password</h1>
        <p role="alert">This reset link is not valid.</p>
        <Link to="/forgot-password">Request a new link</Link>
      </main>
    )
  }

  return (
    <main>
      <h1>Set a new password</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={isLoading || Boolean(message)}>
          {isLoading ? 'Saving...' : 'Reset password'}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
      {error && (
        <p role="alert">
          {error} <Link to="/forgot-password">Request a new link</Link>
        </p>
      )}
    </main>
  )
}

export default ResetPassword
