// KaamSetu - My Jobs Page (Employer)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getMyJobs();
      setJobs(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobAPI.delete(id);
      loadJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#5cb85c', closed: '#999', 'in-progress': '#f0ad4e',
      completed: '#0275d8', cancelled: '#d9534f'
    };
    return colors[status] || '#999';
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Jobs</h1>
        <Link to="/employer/post-job" className="btn btn-primary">Post New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>You haven't posted any jobs yet.</p>
          <Link to="/employer/post-job" className="btn btn-primary">Post Your First Job</Link>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                  {job.status}
                </span>
              </div>
              <p>{job.description?.substring(0, 100)}...</p>
              <div className="job-details">
                <span>&#8377;{job.dailyWage}/day</span>
                <span>{job.workersRequired} worker(s) needed</span>
                <span>{job.workersAccepted} applied</span>
                <span>{new Date(job.jobDate).toLocaleDateString()}</span>
              </div>
              <div className="job-actions">
                <Link to={`/employer/applications?jobId=${job._id}`} className="btn btn-secondary btn-small">
                  View Applications
                </Link>
                <button className="btn btn-danger btn-small" onClick={() => handleDelete(job._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
