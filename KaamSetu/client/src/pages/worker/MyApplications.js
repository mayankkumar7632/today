// KaamSetu - My Applications Page (Worker)

import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import ReviewForm from '../../components/ReviewForm';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await applicationAPI.getWorkerApplications();
      setApplications(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    try {
      await applicationAPI.cancel(id);
      loadApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f0ad4e',
      accepted: '#5cb85c',
      rejected: '#d9534f',
      completed: '#0275d8',
      cancelled: '#999'
    };
    return colors[status] || '#999';
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>My Applications</h1>

      <div className="filter-tabs">
        {['all', 'pending', 'accepted', 'rejected', 'completed'].map(s => (
          <button
            key={s}
            className={`tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No applications found.</p></div>
      ) : (
        <div className="applications-list">
          {filtered.map(app => (
            <div key={app._id} className="application-card">
              <div className="app-header">
                <h3>{app.job?.title || 'Job'}</h3>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                  {app.status}
                </span>
              </div>
              <p>Wage: &#8377;{app.job?.dailyWage}/day</p>
              <p>Employer: {app.employer?.name}</p>
              <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
              {app.status === 'pending' && (
                <button className="btn btn-danger btn-small" onClick={() => handleCancel(app._id)}>
                  Cancel
                </button>
              )}
              {app.status === 'completed' && app.job?._id && <ReviewForm jobId={app.job._id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
