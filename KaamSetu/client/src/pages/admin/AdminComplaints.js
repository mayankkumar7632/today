// KaamSetu - Admin Complaints Page

import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    try {
      const response = await complaintAPI.getAllComplaints();
      setComplaints(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await complaintAPI.update(id, { status, adminNotes: `Marked as ${status} by admin` });
      loadComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Complaints</h1>
      {complaints.length === 0 ? (
        <div className="empty-state"><p>No complaints filed yet.</p></div>
      ) : (
        <div className="applications-list">
          {complaints.map(c => (
            <div key={c._id} className="application-card">
              <div className="app-header">
                <h3>{c.reason}</h3>
                <span className={`status-badge ${c.status}`}>{c.status}</span>
              </div>
              <p>Reported by: {c.reportedBy?.name}</p>
              {c.reportedUser && <p>Against: {c.reportedUser.name}</p>}
              {c.job && <p>Job: {c.job.title}</p>}
              <p>{c.description}</p>
              <p><small>{new Date(c.createdAt).toLocaleString()}</small></p>
              {c.status === 'pending' && (
                <div className="job-actions">
                  <button className="btn btn-success btn-small" onClick={() => handleUpdate(c._id, 'resolved')}>Resolve</button>
                  <button className="btn btn-secondary btn-small" onClick={() => handleUpdate(c._id, 'reviewed')}>Review</button>
                  <button className="btn btn-danger btn-small" onClick={() => handleUpdate(c._id, 'dismissed')}>Dismiss</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
