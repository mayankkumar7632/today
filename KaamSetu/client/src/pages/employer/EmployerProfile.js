// KaamSetu - Employer Profile Page

import React, { useState, useEffect } from 'react';
import { employerAPI } from '../../services/api';

const EmployerProfile = () => {
  const [profile, setProfile] = useState({
    businessName: '', ownerName: '', businessType: '',
    phone: '', description: '',
    location: { address: '', city: '', coordinates: [0, 0] }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await employerAPI.getProfile();
      const p = response.data;
      setProfile({
        businessName: p.businessName || '',
        ownerName: p.ownerName || '',
        businessType: p.businessType || '',
        phone: p.phone || '',
        description: p.description || '',
        location: p.location || { address: '', city: '', coordinates: [0, 0] }
      });
    } catch (err) {
      // Profile doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address' || name === 'city') {
      setProfile({ ...profile, location: { ...profile.location, [name]: value } });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await employerAPI.createOrUpdateProfile(profile);
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
      <h1>Employer Profile</h1>
      {message && (
        <div className={`alert ${message.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Business Name *</label>
          <input type="text" name="businessName" value={profile.businessName} onChange={handleChange} required placeholder="Your business/company name" />
        </div>
        <div className="form-group">
          <label>Owner Name</label>
          <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} placeholder="Owner's full name" />
        </div>
        <div className="form-group">
          <label>Business Type</label>
          <input type="text" name="businessType" value={profile.businessType} onChange={handleChange} placeholder="e.g., Construction, Event Management" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="Contact number" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={profile.description} onChange={handleChange} rows="3" placeholder="About your business" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input type="text" name="city" value={profile.location.city} onChange={handleChange} placeholder="Business city" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={profile.location.address} onChange={handleChange} placeholder="Business address" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default EmployerProfile;
