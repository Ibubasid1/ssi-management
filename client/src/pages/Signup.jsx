import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

const UNIVERSITY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(khi\.)?iba\.edu\.pk$/i;

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!UNIVERSITY_EMAIL_REGEX.test(formData.email.trim())) {
      setError('Please enter a valid IBA university email (@khi.iba.edu.pk or @iba.edu.pk).');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body.message || 'Signup failed.');
      } else {
        setSuccessData(body.data);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'STUDENT',
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

      {successData && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px' }}>
          Verification code sent to <strong>{successData.email}</strong> ({successData.status}).
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
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>University Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@khi.iba.edu.pk"
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
            <option value="STUDENT">Student</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '0.5rem', padding: '0.65rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '1.25rem', marginBottom: 0, textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
          style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Signup;
