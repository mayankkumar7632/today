// KaamSetu - Register Page

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleOptions = [
  {
    value: 'worker',
    label: 'Worker',
    subtitle: 'Find jobs and earn',
    accent: 'worker-role'
  },
  {
    value: 'employer',
    label: 'Employer',
    subtitle: 'Hire trusted workers',
    accent: 'employer-role'
  },
  {
    value: 'admin',
    label: 'Admin',
    subtitle: 'Manage platform access',
    accent: 'admin-role'
  }
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'worker'
  });
  const [loading, setLoading] = useState(false);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await register(formData);
      switch (response.user.role) {
        case 'worker': navigate('/worker/dashboard'); break;
        case 'employer': navigate('/employer/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      // Error handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-large">
        <div className="auth-header">
          <div>
            <span className="eyebrow eyebrow-dark">Join KaamSetu</span>
            <h2>Create Account</h2>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label>Select Account Type</label>
            <div className="role-selector">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`role-option ${formData.role === option.value ? 'active' : ''} ${option.accent}`}
                  onClick={() => setFormData({ ...formData, role: option.value })}
                >
                  <span>{option.label}</span>
                  <small>{option.subtitle}</small>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
