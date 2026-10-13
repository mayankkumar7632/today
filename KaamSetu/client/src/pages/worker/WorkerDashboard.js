// KaamSetu - Worker Dashboard

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI, recommendationAPI } from '../../services/api';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: 0, pending: 0, accepted: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [appRes, recRes] = await Promise.all([
        applicationAPI.getWorkerApplications(),
        recommendationAPI.getJobRecommendations().catch(() => ({ data: [] }))
      ]);

      const apps = appRes.data || [];
      setStats({
        applications: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length
      });

      setRecommendations((recRes.data || []).slice(0, 3));
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <p className="dashboard-subtitle">Worker Dashboard</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.applications}</h3>
          <p>Total Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{stats.accepted}</h3>
          <p>Accepted</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/worker/jobs" className="btn btn-primary">Find Jobs</Link>
          <Link to="/worker/applications" className="btn btn-secondary">My Applications</Link>
          <Link to="/worker/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>
      </div>

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <div className="section">
          <h2>Recommended Jobs</h2>
          <div className="jobs-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="job-card">
                <div className="job-card-header">
                  <h3>{rec.job.title}</h3>
                  <span className="match-score">{rec.matchScore}% Match</span>
                </div>
                <p className="job-wage">&#8377;{rec.job.dailyWage}/day</p>
                {rec.distance !== null && (
                  <p className="job-distance">{rec.distance} km away</p>
                )}
                <div className="job-reasons">
                  {rec.reasons.map((reason, i) => (
                    <span key={i} className="reason-tag">&#10003; {reason}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
