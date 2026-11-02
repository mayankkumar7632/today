// KaamSetu - Post Job Page (Employer)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, locationAPI } from '../../services/api';

const getLocalToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState([0, 0]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    requiredExperience: 0,
    dailyWage: '',
    jobDate: '',
    workersRequired: 1,
    address: '',
    city: '',
    startHour: '08:00',
    endHour: '18:00'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation || !window.isSecureContext) {
      alert('Location access requires HTTPS or localhost. Please open the site on a secure URL and allow location permission.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;
      // GeoJSON uses [longitude, latitude].
      setLocationCoordinates([longitude, latitude]);
      try {
        const result = await locationAPI.reverse(latitude, longitude);
        if (result.success) {
          setFormData((current) => ({
            ...current,
            city: current.city || result.city || '',
            address: current.address || result.address || ''
          }));
        }
      } catch (error) {
        alert(`Location set, but address details could not be loaded: ${error.message}`);
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      const messages = { 1: 'Location permission was denied.', 2: 'Your location is currently unavailable.', 3: 'Location request timed out.' };
      alert(messages[error.code] || 'Could not get your location.');
      setLocationLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        requiredExperience: Number(formData.requiredExperience),
        dailyWage: Number(formData.dailyWage),
        jobDate: formData.jobDate,
        workersRequired: Number(formData.workersRequired),
        workingHours: { start: formData.startHour, end: formData.endHour },
        location: {
          type: 'Point',
          coordinates: locationCoordinates,
          address: formData.address,
          city: formData.city
        }
      };
      await jobAPI.create(data);
      alert('Job created successfully!');
      navigate('/employer/jobs');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Post a New Job</h1>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., House Painting Required"
          />
        </div>
        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the work in detail"
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Required Skills (comma separated)</label>
          <input
            type="text"
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleChange}
            placeholder="e.g., Painting, Wall Preparation"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Daily Wage (&#8377;) *</label>
            <input
              type="number"
              name="dailyWage"
              value={formData.dailyWage}
              onChange={handleChange}
              required
              min="0"
              placeholder="e.g., 700"
            />
          </div>
          <div className="form-group">
            <label>Experience Required (years)</label>
            <input
              type="number"
              name="requiredExperience"
              value={formData.requiredExperience}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Job Date *</label>
            <input
              type="date"
              name="jobDate"
              value={formData.jobDate}
              onChange={handleChange}
              required
              min={getLocalToday()}
            />
          </div>
          <div className="form-group">
            <label>Workers Needed</label>
            <input
              type="number"
              name="workersRequired"
              value={formData.workersRequired}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" name="startHour" value={formData.startHour} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="time" name="endHour" value={formData.endHour} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City name"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Work location address"
            />
          </div>
        </div>
        <button type="button" className="btn btn-secondary location-button" onClick={useCurrentLocation} disabled={locationLoading || loading}>
          {locationLoading ? 'Getting location...' : 'Use my current location'}
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
