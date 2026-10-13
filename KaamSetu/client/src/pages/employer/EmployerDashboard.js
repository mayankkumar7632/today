// KaamSetu - Employer Dashboard

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobAPI.getMyJobs(),
        applicationAPI.getEmployerApplications()
      ]);
      setStats({
        jobs: jobsRes.data?.length || 0,
        applications: appsRes.data?.length || 0,
        pending: (appsRes.data || []).filter(a => a.status === 'pending').length
      });
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <p className="dashboard-subtitle">Employer Dashboard</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.jobs}</h3>
          <p>Jobs Posted</p>
        </div>
        <div className="stat-card">
          <h3>{stats.applications}</h3>
          <p>Total Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending Review</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/employer/post-job" className="btn btn-primary">Post New Job</Link>
          <Link to="/employer/jobs" className="btn btn-secondary">My Jobs</Link>
          <Link to="/employer/applications" className="btn btn-secondary">Review Applications</Link>
          <Link to="/employer/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
