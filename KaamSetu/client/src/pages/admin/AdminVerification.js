// KaamSetu - Admin Verification Page

import React, { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';

const AdminVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVerifications(); }, []);

  const loadVerifications = async () => {
    try {
      const response = await verificationAPI.getPendingVerifications();
      setVerifications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (userId, status) => {
    try {
      await verificationAPI.reviewVerification(userId, { status, notes: `Admin ${status}` });
      loadVerifications();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Verification Requests</h1>
      {verifications.length === 0 ? (
        <div className="empty-state"><p>No pending verification requests.</p></div>
      ) : (
        <div className="applications-list">
          {verifications.map(v => (
            <div key={v._id} className="application-card">
              <h3>{v.user?.name}</h3>
              <p>Email: {v.user?.email}</p>
              <p>Phone: {v.user?.phone}</p>
              <p>Role: {v.user?.role}</p>
              <p>Status: {v.status}</p>
              <div className="job-actions">
                <button className="btn btn-success btn-small" onClick={() => handleReview(v.user._id, 'verified')}>
                  Approve
                </button>
                <button className="btn btn-danger btn-small" onClick={() => handleReview(v.user._id, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
