// KaamSetu - Find Jobs Page (Worker)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, applicationAPI, locationAPI, workerAPI } from '../../services/api';
import MatchBadge from '../../components/MatchBadge';

// Calculate distance in kilometres from GeoJSON coordinates [longitude, latitude].
const calculateDistance = (from, to) => {
  const toRadians = value => value * Math.PI / 180;
  const [longitude1, latitude1] = from;
  const [longitude2, latitude2] = to;
  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);
  const a = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2))
    * Math.sin(longitudeDifference / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

const FindJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: '', city: '' });
  const [applying, setApplying] = useState(null);
  const [radius, setRadius] = useState('10');
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [minMatch, setMinMatch] = useState(0);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [sortBy, minMatch]);

  const loadJobs = async () => {
    try {
      const params = { ...filters };
      if (sortBy === 'match') params.sort = 'match';
      if (minMatch) params.minMatch = String(minMatch);

      const [jobsResponse, profileResponse] = await Promise.all([
        jobAPI.getAll(params),
        workerAPI.getProfile().catch(() => null)
      ]);
      const profileData = profileResponse?.data || null;
      const skills = Array.isArray(profileData?.skills) ? profileData.skills : [];
      const expectedWage = Number(profileData?.expectedWage) || 0;
      const location = profileData?.location;
      const hasArea = Boolean(
        (location && location.city) ||
        (Array.isArray(location?.coordinates) && location.coordinates.length === 2 &&
          location.coordinates.some((c) => Number(c) !== 0))
      );
      setProfileIncomplete(skills.length === 0 || !hasArea || expectedWage <= 0);

      const workerCoordinates = profileResponse?.data?.location?.coordinates;
      const hasWorkerCoordinates = Array.isArray(workerCoordinates)
        && workerCoordinates.length === 2
        && workerCoordinates.some(coordinate => Number(coordinate) !== 0);

      const jobsWithDistance = jobsResponse.data.map(job => {
        const jobCoordinates = job.location?.coordinates;
        const hasJobCoordinates = Array.isArray(jobCoordinates)
          && jobCoordinates.length === 2
          && jobCoordinates.some(coordinate => Number(coordinate) !== 0);
        if (!hasWorkerCoordinates || !hasJobCoordinates) return job;

        return {
          ...job,
          distance: calculateDistance(workerCoordinates.map(Number), jobCoordinates.map(Number))
        };
      });
      setJobs(jobsWithDistance);
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

  const findJobsNearMe = () => {
    if (!navigator.geolocation || !window.isSecureContext) {
      setNearbyError('Location access requires HTTPS or localhost. Please open the site on a secure URL and allow location permission.');
      return;
    }
    setLocationLoading(true);
    setNearbyError('');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await locationAPI.findNearbyJobs({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          radius
        });
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        setNearbyError(error.message);
      } finally {
        setLoading(false);
        setLocationLoading(false);
      }
    }, (error) => {
      const messages = { 1: 'Location permission was denied.', 2: 'Your location is currently unavailable.', 3: 'Location request timed out.' };
      setNearbyError(messages[error.code] || 'Could not get your location.');
      setLocationLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
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

      <div className="job-match-controls">
        <label>
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="match">Best match</option>
            <option value="recent">Most recent</option>
          </select>
        </label>
        <label>
          Minimum match
          <select value={String(minMatch)} onChange={(e) => setMinMatch(Number(e.target.value))}>
            <option value="0">Any</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
          </select>
        </label>
      </div>

      <div className="nearby-controls">
        <label>Nearby radius
          <select value={radius} onChange={(e) => setRadius(e.target.value)}>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
          </select>
        </label>
        <button type="button" className="btn btn-secondary location-button" onClick={findJobsNearMe} disabled={locationLoading || loading}>
          {locationLoading ? 'Finding nearby jobs...' : 'Jobs near me'}
        </button>
      </div>
      {nearbyError && <div className="alert alert-error">{nearbyError}</div>}
      {profileIncomplete && (
        <div className="profile-banner">
          <span>Complete your profile for better matches</span>
          <Link to="/worker/profile" className="btn btn-secondary btn-small">Complete Profile</Link>
        </div>
      )}

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
                {job.matchScore !== undefined && job.matchScore !== null && (
                  <MatchBadge score={job.matchScore} breakdown={job.breakdown} contributions={job.contributions} />
                )}
                <span className="job-status">{job.status}</span>
              </div>
              <p className="job-description">{job.description}</p>
              <div className="job-details">
                <span className="job-wage">&#8377;{job.dailyWage}/day</span>
                {job.location?.city && <span className="job-location">{job.location.city}</span>}
                {typeof job.distance === 'number' && <span className="job-distance">{job.distance.toFixed(1)} km away</span>}
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
