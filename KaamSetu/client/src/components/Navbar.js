// KaamSetu - Navbar Component
// Responsive navigation bar with mobile support

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'worker': return '/worker/dashboard';
      case 'employer': return '/employer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-mark">K</span>
          <span className="brand-text">
            <strong>KaamSetu</strong>
            <small>Work Marketplace</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to={getDashboardLink()} onClick={closeMenu}>Dashboard</Link>

              {user.role === 'worker' && (
                <>
                  <Link to="/worker/jobs" onClick={closeMenu}>Find Jobs</Link>
                  <Link to="/worker/applications" onClick={closeMenu}>Applications</Link>
                </>
              )}

              {user.role === 'employer' && (
                <>
                  <Link to="/employer/post-job" onClick={closeMenu}>Post Job</Link>
                  <Link to="/employer/jobs" onClick={closeMenu}>My Jobs</Link>
                  <Link to="/employer/applications" onClick={closeMenu}>Applications</Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/users" onClick={closeMenu}>Users</Link>
                  <Link to="/admin/jobs" onClick={closeMenu}>Jobs</Link>
                  <Link to="/admin/verification" onClick={closeMenu}>Verification</Link>
                </>
              )}

              <Link to="/notifications" onClick={closeMenu}>
                Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </Link>

              <Link to={
                user.role === 'worker' ? '/worker/profile' :
                user.role === 'employer' ? '/employer/profile' : '/admin/dashboard'
              } onClick={closeMenu}>
                {user.name}
              </Link>

              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={closeMenu}>Home</Link>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu} className="btn-register-nav">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
