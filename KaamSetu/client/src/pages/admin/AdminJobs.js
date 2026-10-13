// KaamSetu - Admin Jobs Page

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const response = await adminAPI.getAllJobs();
      setJobs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Manage Jobs</h1>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Employer</th>
              <th>Wage</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.employer?.name}</td>
                <td>&#8377;{job.dailyWage}</td>
                <td><span className={`status-badge ${job.status}`}>{job.status}</span></td>
                <td>{new Date(job.jobDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobs;
