// KaamSetu - Worker Verification Page

import React, { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';

const WorkerVerification = () => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const response = await verificationAPI.getStatus();
      setVerification(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    try {
      await verificationAPI.requestVerification({ reason: 'Worker requesting verification' });
      loadStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Verification Status</h1>
      <div className="profile-form">
        <div className="verification-levels">
          <div className={`verification-level ${verification?.phoneVerified ? 'verified' : ''}`}>
            <span className="level-icon">{verification?.phoneVerified ? '\u2705' : '\u25CB'}</span>
            <div>
              <h4>Level 1: Phone Verification</h4>
              <p>{verification?.phoneVerified ? 'Verified' : 'Not verified'}</p>
            </div>
          </div>
          <div className={`verification-level ${verification?.emailVerified ? 'verified' : ''}`}>
            <span className="level-icon">{verification?.emailVerified ? '\u2705' : '\u25CB'}</span>
            <div>
              <h4>Level 1: Email Verification</h4>
              <p>{verification?.emailVerified ? 'Verified' : 'Not verified'}</p>
            </div>
          </div>
          <div className={`verification-level ${verification?.profileVerified ? 'verified' : ''}`}>
            <span className="level-icon">{verification?.profileVerified ? '\u2705' : '\u25CB'}</span>
            <div>
              <h4>Level 2: Profile Verification</h4>
              <p>{verification?.profileVerified ? 'Verified' : 'Not verified'}</p>
            </div>
          </div>
          <div className={`verification-level ${verification?.skillVerified ? 'verified' : ''}`}>
            <span className="level-icon">{verification?.skillVerified ? '\u2705' : '\u25CB'}</span>
            <div>
              <h4>Level 3: Skill Verification</h4>
              <p>{verification?.skillVerified ? 'Verified' : 'Not verified'}</p>
            </div>
          </div>
          <div className={`verification-level ${verification?.trustedStatus ? 'verified' : ''}`}>
            <span className="level-icon">{verification?.trustedStatus ? '\uD83C\uDFC6' : '\u25CB'}</span>
            <div>
              <h4>Level 4: Trusted Worker</h4>
              <p>{verification?.trustedStatus ? 'Trusted' : 'Not yet'}</p>
            </div>
          </div>
        </div>

        <p className="verification-status">
          Overall Status: <strong>{verification?.status || 'pending'}</strong>
        </p>

        {verification?.status === 'pending' && (
          <button className="btn btn-primary" onClick={handleRequest}>
            Request Verification
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkerVerification;
