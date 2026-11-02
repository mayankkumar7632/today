// KaamSetu - Applications Page (Employer)

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import UserReviews from '../../components/UserReviews';
import ReviewForm from '../../components/ReviewForm';

const EmployerApplications = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const jobId = searchParams.get('jobId');
      const params = jobId ? { jobId } : {};
      const response = await applicationAPI.getEmployerApplications(params);
      setApplications(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await applicationAPI.accept(id);
      loadApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await applicationAPI.reject(id);
      loadApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      await applicationAPI.complete(id);
      loadApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f0ad4e', accepted: '#5cb85c', rejected: '#d9534f',
      completed: '#0275d8', cancelled: '#999'
    };
    return colors[status] || '#999';
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Applications</h1>

      <div className="filter-tabs">
        {['all', 'pending', 'accepted', 'rejected', 'completed'].map(s => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
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
                <h3>{app.worker?.name || 'Worker'}</h3>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                  {app.status}
                </span>
              </div>
              <p><strong>Job:</strong> {app.job?.title}</p>
              <p><strong>Email:</strong> {app.worker?.email}</p>
              <p><strong>Phone:</strong> {app.worker?.phone}</p>
              <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
              {app.message && <p><strong>Message:</strong> {app.message}</p>}
              {app.worker?._id && <UserReviews userId={app.worker._id} />}

              {app.status === 'pending' && (
                <div className="job-actions">
                  <button className="btn btn-success btn-small" onClick={() => handleAccept(app._id)}>
                    Accept
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleReject(app._id)}>
                    Reject
                  </button>
                </div>
              )}
              {app.status === 'accepted' && (
                <button className="btn btn-primary btn-small" onClick={() => handleComplete(app._id)}>
                  Mark Completed
                </button>
              )}
              {app.status === 'completed' && app.job?._id && app.worker?._id && <ReviewForm jobId={app.job._id} revieweeId={app.worker._id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;
