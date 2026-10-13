// KaamSetu - Find Jobs Page (Worker)

import React, { useState, useEffect } from 'react';
import { jobAPI, applicationAPI } from '../../services/api';

const FindJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: '', city: '' });
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getAll(filters);
      setJobs(response.data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    loadJobs();
  };

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await applicationAPI.apply({ jobId });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="page">
      <h1>Find Jobs</h1>

      {/* Search Filters */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by skill (e.g., painting, plumbing)"
          value={filters.skills}
          onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
        />
        <input
          type="text"
          placeholder="Search by city"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs found. Try different filters.</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className="job-status">{job.status}</span>
              </div>
              <p className="job-description">{job.description}</p>
              <div className="job-details">
                <span className="job-wage">&#8377;{job.dailyWage}/day</span>
                {job.location?.city && <span className="job-location">{job.location.city}</span>}
                <span className="job-date">{new Date(job.jobDate).toLocaleDateString()}</span>
              </div>
              {job.requiredSkills?.length > 0 && (
                <div className="job-skills">
                  {job.requiredSkills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
              <button
                className="btn btn-primary btn-small"
                onClick={() => handleApply(job._id)}
                disabled={applying === job._id}
              >
                {applying === job._id ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindJobs;
