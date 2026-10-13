// KaamSetu - Admin Dashboard

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p className="dashboard-subtitle">System Overview</p>

      {stats && (
        <div className="stats-grid admin-stats">
          <div className="stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalWorkers}</h3>
            <p>Workers</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalEmployers}</h3>
            <p>Employers</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
          <div className="stat-card">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completedJobs}</h3>
            <p>Completed Jobs</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingApplications}</h3>
            <p>Pending Applications</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingVerifications}</h3>
            <p>Pending Verification</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalReviews}</h3>
            <p>Total Reviews</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingComplaints}</h3>
            <p>Pending Complaints</p>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2>Management</h2>
        <div className="action-buttons">
          <Link to="/admin/users?role=worker" className="btn btn-primary">Manage Workers</Link>
          <Link to="/admin/users?role=employer" className="btn btn-primary">Manage Employers</Link>
          <Link to="/admin/users" className="btn btn-secondary">All Users</Link>
          <Link to="/admin/jobs" className="btn btn-secondary">Manage Jobs</Link>
          <Link to="/admin/verification" className="btn btn-secondary">Verification</Link>
          <Link to="/admin/complaints" className="btn btn-secondary">Complaints</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
