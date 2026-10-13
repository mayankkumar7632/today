// KaamSetu - Worker Profile Page

import React, { useState, useEffect } from 'react';
import { workerAPI } from '../../services/api';

const WorkerProfile = () => {
  const [profile, setProfile] = useState({
    skills: '',
    experience: '',
    yearsOfExperience: 0,
    expectedWage: 0,
    availability: '',
    bio: '',
    location: { address: '', city: '', coordinates: [0, 0] }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await workerAPI.getProfile();
      const p = response.data;
      setProfile({
        skills: (p.skills || []).join(', '),
        experience: p.experience || '',
        yearsOfExperience: p.yearsOfExperience || 0,
        expectedWage: p.expectedWage || 0,
        availability: p.availability || '',
        bio: p.bio || '',
        location: p.location || { address: '', city: '', coordinates: [0, 0] }
      });
    } catch (err) {
      // Profile doesn't exist yet - that's OK
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address' || name === 'city') {
      setProfile({
        ...profile,
        location: { ...profile.location, [name]: value }
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = {
        ...profile,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
        expectedWage: Number(profile.expectedWage),
        yearsOfExperience: Number(profile.yearsOfExperience)
      };
      await workerAPI.createOrUpdateProfile(data);
      setMessage('Profile saved successfully!');
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Worker Profile</h1>
      {message && (
        <div className={`alert ${message.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Skills (comma separated)</label>
          <input
            type="text"
            name="skills"
            value={profile.skills}
            onChange={handleChange}
            placeholder="e.g., Plumbing, Painting, Electrician"
          />
        </div>
        <div className="form-group">
          <label>Experience Description</label>
          <textarea
            name="experience"
            value={profile.experience}
            onChange={handleChange}
            placeholder="Describe your work experience"
            rows="3"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={profile.yearsOfExperience}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Expected Daily Wage (&#8377;)</label>
            <input
              type="number"
              name="expectedWage"
              value={profile.expectedWage}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Availability</label>
          <input
            type="text"
            name="availability"
            value={profile.availability}
            onChange={handleChange}
            placeholder="e.g., Monday to Saturday, 8 AM to 6 PM"
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell employers about yourself"
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={profile.location.city}
            onChange={handleChange}
            placeholder="Your city"
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={profile.location.address}
            onChange={handleChange}
            placeholder="Your address"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default WorkerProfile;
