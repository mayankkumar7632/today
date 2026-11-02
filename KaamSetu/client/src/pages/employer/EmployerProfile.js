// KaamSetu - Employer Profile Page

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employerAPI, getPhotoUrl, locationAPI, userAPI } from '../../services/api';
import UserReviews from '../../components/UserReviews';

const emptyProfile = {
  businessName: '',
  ownerName: '',
  businessType: '',
  phone: '',
  description: '',
  profileImage: '',
  location: { address: '', city: '', coordinates: [0, 0] }
};

const toFormProfile = (profile) => ({
  ...emptyProfile,
  ...(profile || {}),
  profileImage: (profile && profile.profileImage) || '',
  location: {
    ...emptyProfile.location,
    ...(profile && profile.location ? profile.location : {})
  }
});

const displayValue = (value) => {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return 'Not added yet';
  }
  return value;
};

const EmployerProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [profileUser, setProfileUser] = useState(authUser || {});
  const [savedUser, setSavedUser] = useState(authUser || {});
  const [incomplete, setIncomplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const photoInputRef = useRef(null);

  const photoUrl = photoPreview || getPhotoUrl(profileUser.profilePhoto);

  useEffect(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      return () => URL.revokeObjectURL(photoPreview);
    }
  }, [photoPreview]);

  useEffect(() => {
    setPhotoLoadError(false);
  }, [photoUrl]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await employerAPI.getProfile();
      const loadedProfile = toFormProfile(response.data);
      const loadedUser = response.user || authUser || {};
      setProfile(loadedProfile);
      setSavedProfile(loadedProfile);
      setProfileUser(loadedUser);
      setSavedUser(loadedUser);
      setIncomplete(!response.data);
    } catch (error) {
      setMessage(`Error: Could not load your profile. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'address' || name === 'city') {
      setProfile((current) => ({
        ...current,
        location: { ...current.location, [name]: value }
      }));
    } else {
      setProfile((current) => ({ ...current, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = (profileUser.name || '').trim();
    const phone = (profileUser.phone || '').trim();
    if (name.length < 2 || name.length > 100) {
      setMessage('Error: Name must be between 2 and 100 characters.');
      return;
    }
    if (!phone) {
      setMessage('Error: Phone number cannot be empty.');
      return;
    }
    if (!profile.businessName.trim()) {
      setMessage('Error: Business name is required.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const response = await employerAPI.createOrUpdateProfile({
        ...profile,
        name,
        phone,
        businessPhone: profile.phone
      });
      const saved = toFormProfile(response.data);
      const updatedUser = response.user || { ...profileUser, name, phone };
      setProfile(saved);
      setSavedProfile(saved);
      setProfileUser(updatedUser);
      setSavedUser(updatedUser);
      updateUser(updatedUser);
      setIncomplete(false);
      setIsEditing(false);
      setMessage('Profile saved successfully!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation || !window.isSecureContext) {
      setMessage('Error: Location access requires HTTPS or localhost. Please open the site on a secure URL and allow location permission.');
      return;
    }
    setLocationLoading(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;
      // GeoJSON coordinates are [longitude, latitude].
      setProfile((current) => ({ ...current, location: { ...current.location, coordinates: [longitude, latitude] } }));
      try {
        const result = await locationAPI.reverse(latitude, longitude);
        if (result.success) {
          setProfile((current) => ({
            ...current,
            location: {
              ...current.location,
              city: current.location.city || result.city || '',
              address: current.location.address || result.address || '',
              coordinates: [longitude, latitude]
            }
          }));
        }
      } catch (error) {
        setMessage(`Location set, but address details could not be loaded: ${error.message}`);
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      const messages = { 1: 'Location permission was denied.', 2: 'Your location is currently unavailable.', 3: 'Location request timed out.' };
      setMessage(`Error: ${messages[error.code] || 'Could not get your location.'}`);
      setLocationLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };

  const cancelEdit = () => {
    setProfile(savedProfile);
    setProfileUser(savedUser);
    setIsEditing(false);
    setMessage('');
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Error: Choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Error: Profile photos must be 2 MB or smaller.');
      return;
    }

    setMessage('');
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      const response = await userAPI.uploadPhoto(file);
      const updatedUser = { ...profileUser, profilePhoto: response.data.profilePhoto };
      setProfileUser(updatedUser);
      setSavedUser(updatedUser);
      updateUser({ profilePhoto: response.data.profilePhoto });
      setPhotoPreview(null);
      setMessage('Profile photo uploaded successfully!');
    } catch (error) {
      setPhotoPreview(null);
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    setMessage('');
    try {
      await userAPI.removePhoto();
      const updatedUser = { ...profileUser, profilePhoto: null };
      setProfileUser(updatedUser);
      setSavedUser(updatedUser);
      updateUser({ profilePhoto: null });
      setPhotoPreview(null);
      setMessage('Profile photo removed successfully!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
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
      {incomplete && (
        <div className="profile-banner">
          Your profile is incomplete. Click Edit Profile to add your details.
        </div>
      )}

      {!isEditing ? (
        <section className="profile-card">
          <div className="profile-avatar-section">
            {photoUrl && !photoLoadError
              ? <img className="profile-avatar" src={photoUrl} alt={`${profileUser.name || 'User'} profile`} onError={() => setPhotoLoadError(true)} />
              : <div className="profile-avatar-placeholder">{(profileUser.name || '?').charAt(0).toUpperCase()}</div>}
          </div>
          <div className="profile-row"><strong>Name</strong><span>{displayValue(profileUser.name)}</span></div>
          <div className="profile-row"><strong>Email</strong><span>{displayValue(profileUser.email)}</span></div>
          <div className="profile-row"><strong>Phone</strong><span>{displayValue(profileUser.phone)}</span></div>
          <div className="profile-row"><strong>Role</strong><span>{displayValue(profileUser.role)}</span></div>
          <div className="profile-row"><strong>Business Name</strong><span>{displayValue(profile.businessName)}</span></div>
          <div className="profile-row"><strong>Owner Name</strong><span>{displayValue(profile.ownerName)}</span></div>
          <div className="profile-row"><strong>Business Type</strong><span>{displayValue(profile.businessType)}</span></div>
          <div className="profile-row"><strong>Business Phone</strong><span>{displayValue(profile.phone)}</span></div>
          <div className="profile-row"><strong>Description</strong><span>{displayValue(profile.description)}</span></div>
          <div className="profile-row"><strong>Location</strong><span>{profile.location.city ? profile.location.city : 'Location not set'}</span></div>
          <div className="profile-row"><strong>Address</strong><span>{displayValue(profile.location.address)}</span></div>
          {profile.location.coordinates && Number(profile.location.coordinates[0]) !== 0 && Number(profile.location.coordinates[1]) !== 0 && (
            <div className="profile-row"><strong>Map</strong><a className="location-map-link" href={`https://www.openstreetmap.org/?mlat=${profile.location.coordinates[1]}&mlon=${profile.location.coordinates[0]}#map=15/${profile.location.coordinates[1]}/${profile.location.coordinates[0]}`} target="_blank" rel="noreferrer">View on map</a></div>
          )}
          <div className="profile-row"><strong>Profile Image</strong><span>{displayValue(profile.profileImage)}</span></div>
          <div className="profile-row"><strong>Average Rating</strong><span>{displayValue(profile.averageRating)}</span></div>
          <div className="profile-row"><strong>Total Reviews</strong><span>{displayValue(profile.totalReviews)}</span></div>
          <div className="profile-row"><strong>Total Jobs Posted</strong><span>{displayValue(profile.totalJobsPosted)}</span></div>
          <div className="profile-row"><strong>Completed Jobs</strong><span>{displayValue(profile.completedJobs)}</span></div>
          <button type="button" className="btn btn-primary" onClick={() => {
            setMessage('');
            setIsEditing(true);
          }}>
            Edit Profile
          </button>
        </section>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-photo-editor">
            {photoUrl && !photoLoadError
              ? <img className="profile-avatar" src={photoUrl} alt={`${profileUser.name || 'User'} profile`} onError={() => setPhotoLoadError(true)} />
              : <div className="profile-avatar-placeholder">{(profileUser.name || '?').charAt(0).toUpperCase()}</div>}
            <div className="avatar-upload-actions">
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                hidden
              />
              <button type="button" className="btn btn-secondary" onClick={() => photoInputRef.current.click()} disabled={uploadingPhoto}>
                {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
              </button>
              {profileUser.profilePhoto && (
                <button type="button" className="btn btn-secondary" onClick={handleRemovePhoto} disabled={uploadingPhoto}>
                  Remove Photo
                </button>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={profileUser.name || ''}
              onChange={(event) => setProfileUser({ ...profileUser, name: event.target.value })}
              minLength="2"
              maxLength="100"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={profileUser.email || ''} readOnly />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={profileUser.phone || ''}
              onChange={(event) => setProfileUser({ ...profileUser, phone: event.target.value })}
              required
            />
          </div>
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
            <label>Business Phone</label>
            <input type="tel" name="businessPhone" value={profile.phone} onChange={(event) => {
              setProfile({ ...profile, phone: event.target.value });
            }} placeholder="Contact number" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={profile.description} onChange={handleChange} rows="3" placeholder="About your business" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={profile.location.city || ''} onChange={handleChange} placeholder="Business city" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={profile.location.address || ''} onChange={handleChange} placeholder="Business address" />
            </div>
          </div>
          <button type="button" className="btn btn-secondary location-button" onClick={useCurrentLocation} disabled={locationLoading}>
            {locationLoading ? 'Getting location...' : 'Use my current location'}
          </button>
          <div className="profile-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {authUser && <UserReviews userId={authUser._id || authUser.id} />}
    </div>
  );
};

export default EmployerProfile;
