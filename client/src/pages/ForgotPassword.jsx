import { useState } from 'react'
import { Link } from 'react-router'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const body = await response.json()

      if (response.ok) {
        setMessage(body.data.message)
      } else {
        setError(body.message)
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <header className="forgot-header">
        <span className="forgot-brand">▦ SSI Management</span>
        <span className="forgot-header-note">Event Management</span>
      </header>

      <main className="forgot-content">
        <h1 className="forgot-title">Forgot password</h1>
        <p className="forgot-subtitle">Enter your email and we'll send a reset link.</p>

        <form className="forgot-card" onSubmit={handleSubmit}>
          <label className="forgot-label" htmlFor="email">University email</label>
          <input
            className="forgot-input"
            id="email"
            type="email"
            placeholder="name@university.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button className="forgot-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {message && <p className="forgot-success" role="status">{message}</p>}
        {error && <p className="forgot-error" role="alert">{error}</p>}

        <p className="forgot-back">
          <Link to="/login">← Back to log in</Link>
        </p>
      </main>
    </div>
  )
}

export default ForgotPassword
