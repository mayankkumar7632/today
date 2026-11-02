// KaamSetu - Worker Dashboard

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI, jobAPI, workerAPI } from '../../services/api';
import MatchBadge from '../../components/MatchBadge';

const isProfileIncomplete = (profileData) => {
  const skills = Array.isArray(profileData?.skills) ? profileData.skills : [];
  const expectedWage = Number(profileData?.expectedWage) || 0;
  const location = profileData?.location;
  const hasArea = Boolean(
    (location && location.city) ||
    (Array.isArray(location?.coordinates) && location.coordinates.length === 2 &&
      location.coordinates.some((c) => Number(c) !== 0))
  );
  return skills.length === 0 || !hasArea || expectedWage <= 0;
};

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: 0, pending: 0, accepted: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [appRes, recRes, profileRes] = await Promise.all([
        applicationAPI.getWorkerApplications(),
        jobAPI.getRecommended().catch(() => ({ data: [] })),
        workerAPI.getProfile().catch(() => null)
      ]);

      const apps = appRes.data || [];
      setStats({
        applications: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length
      });

      setRecommendations((recRes.data || []).slice(0, 3));
      setProfile(profileRes?.data || null);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading...</p></div>;

  const incomplete = isProfileIncomplete(profile);

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <p className="dashboard-subtitle">Worker Dashboard</p>

      {incomplete && (
        <div className="profile-banner">
          <span>Complete your profile for better matches</span>
          <Link to="/worker/profile" className="btn btn-secondary btn-small">Complete Profile</Link>
        </div>
      )}

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
            {recommendations.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <MatchBadge score={job.matchScore} breakdown={job.breakdown} contributions={job.contributions} />
                </div>
                <p className="job-wage">&#8377;{job.dailyWage}/day</p>
                {typeof job.distance === 'number' && (
                  <p className="job-distance">{job.distance} km away</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
