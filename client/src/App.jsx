import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [successUser, setSuccessUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessUser(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed.');
      } else {
        setSuccessUser(data.user);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'student',
        });
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'left' }}>
      <h2 style={{ marginTop: 0 }}>Create an Account</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>SSI Management System — User Registration</p>

      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {successUser && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px' }}>
          Account created for <strong>{successUser.name}</strong> ({successUser.email}) as <strong>{successUser.role}</strong>!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Muhammad Samee"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '0.5rem', padding: '0.65rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default App;
