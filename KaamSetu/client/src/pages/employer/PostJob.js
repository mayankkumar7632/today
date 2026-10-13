// KaamSetu - Post Job Page (Employer)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
          coordinates: [77.1025, 28.6139], // Default Delhi coordinates
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
