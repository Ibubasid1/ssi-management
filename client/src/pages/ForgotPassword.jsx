import { useState } from 'react'
import { Link } from 'react-router'

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
    <main>
      <h1>Forgot password</h1>
      <p>Enter your email and we'll send a reset link.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">University email</label>
        <input
          id="email"
          type="email"
          placeholder="name@university.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      <p>
        <Link to="/login">← Back to log in</Link>
      </p>
    </main>
  )
}

export default ForgotPassword
