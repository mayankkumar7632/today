// KaamSetu - API Service
// This file handles all communication between frontend and backend

const configuredApiUrl =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');
export const API_ORIGIN = configuredApiUrl.replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api`;

export const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  if (/^https?:\/\//i.test(photoPath)) return photoPath;
  return `${API_ORIGIN}${photoPath}`;
};

// Helper function to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('kaamsetu_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: getHeaders(),
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) }
  };

  let response;
  let responseText;
  try {
    response = await fetch(url, config);
    responseText = await response.text();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw error;
  }

  let data;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error(`Server returned a non-JSON response (${response.status}).`);
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }

  return data;
};

// ===========================
// Auth API
// ===========================
export const authAPI = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  logout: () =>
    apiCall('/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiCall('/auth/me')
};

// Profile photo requests use FormData instead of JSON.
export const userAPI = {
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('kaamsetu_token');
    const response = await fetch(`${API_BASE}/auth/profile-photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not upload the profile photo.');
    }

    return data;
  },

  removePhoto: async () => {
    const token = localStorage.getItem('kaamsetu_token');
    const response = await fetch(`${API_BASE}/auth/profile-photo`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not remove the profile photo.');
    }

    return data;
  }
};

// ===========================
// Worker Profile API
// ===========================
export const workerAPI = {
  getProfile: () => apiCall('/workers/profile'),
  createOrUpdateProfile: (data) =>
    apiCall('/workers/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getWorkerProfile: (userId) => apiCall(`/workers/profile/${userId}`),
  searchWorkers: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/workers/search?${query}`);
  }
};

// ===========================
// Employer Profile API
// ===========================
export const employerAPI = {
  getProfile: () => apiCall('/employers/profile'),
  createOrUpdateProfile: (data) =>
    apiCall('/employers/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getEmployerProfile: (userId) => apiCall(`/employers/profile/${userId}`)
};

// ===========================
// Job API
// ===========================
export const jobAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/jobs?${query}`);
  },
  getRecommended: () => apiCall('/jobs/recommended'),
  getById: (id) => apiCall(`/jobs/${id}`),
  getMyJobs: () => apiCall('/jobs/employer/my-jobs'),
  create: (data) =>
    apiCall('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiCall(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    apiCall(`/jobs/${id}`, { method: 'DELETE' })
};

// ===========================
// Application API
// ===========================
export const applicationAPI = {
  apply: (data) =>
    apiCall('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getWorkerApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/applications/worker?${query}`);
  },
  getEmployerApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/applications/employer?${query}`);
  },
  accept: (id) =>
    apiCall(`/applications/${id}/accept`, { method: 'PUT' }),
  reject: (id) =>
    apiCall(`/applications/${id}/reject`, { method: 'PUT' }),
  complete: (id) =>
    apiCall(`/applications/${id}/complete`, { method: 'PUT' }),
  cancel: (id) =>
    apiCall(`/applications/${id}/cancel`, { method: 'PUT' })
};

// ===========================
// Recommendation API
// ===========================
export const recommendationAPI = {
  getJobRecommendations: () => apiCall('/recommendations/jobs'),
  getWorkerRecommendations: (jobId) => apiCall(`/recommendations/workers/${jobId}`)
};

// ===========================
// Location API
// ===========================
export const locationAPI = {
  geocode: (address, city) => {
    const params = new URLSearchParams({ address: address || '', city: city || '' }).toString();
    return apiCall(`/location/geocode?${params}`);
  },
  reverse: (lat, lng) => apiCall(`/location/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`),
  findNearbyJobs: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/location/nearby-jobs?${query}`);
  },
  updateLocation: (data) =>
    apiCall('/location/update', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// ===========================
// Verification API
// ===========================
export const verificationAPI = {
  getStatus: () => apiCall('/verifications/status'),
  requestVerification: (data = {}) =>
    apiCall('/verifications/request', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getPendingVerifications: () => apiCall('/verifications/pending'),
  reviewVerification: (userId, data) =>
    apiCall(`/verifications/${userId}/review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// ===========================
// Review API
// ===========================
export const reviewAPI = {
  create: (data) =>
    apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getUserReviews: (userId) => apiCall(`/reviews/user/${userId}`),
  getJobReviews: (jobId) => apiCall(`/reviews/job/${jobId}`),
  report: (id) => apiCall(`/reviews/${id}/report`, { method: 'POST' }),
  getMyReviews: () => apiCall('/reviews/my-reviews')
};

// ===========================
// Notification API
// ===========================
export const notificationAPI = {
  getAll: () => apiCall('/notifications'),
  markAsRead: (id) =>
    apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () =>
    apiCall('/notifications/read-all', { method: 'PUT' }),
  delete: (id) =>
    apiCall(`/notifications/${id}`, { method: 'DELETE' })
};

// ===========================
// Complaint API
// ===========================
export const complaintAPI = {
  file: (data) =>
    apiCall('/complaints', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getMyComplaints: () => apiCall('/complaints/my'),
  getAllComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/complaints/all?${query}`);
  },
  update: (id, data) =>
    apiCall(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// ===========================
// Admin API
// ===========================
export const adminAPI = {
  getStats: () => apiCall('/admin/stats'),
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/admin/users?${query}`);
  },
  toggleUserActive: (id) =>
    apiCall(`/admin/users/${id}/toggle-active`, { method: 'PUT' }),
  deleteUser: (id) =>
    apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
  getAllJobs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/admin/jobs?${query}`);
  },
  getAllApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/admin/applications?${query}`);
  },
  getModerationReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/admin/reviews?${query}`);
  },
  getFlaggedUsers: () => apiCall('/admin/reviews/flagged-users'),
  hideReview: (id, reason) => apiCall(`/admin/reviews/${id}/hide`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  suspendUser: (id, reason) => apiCall(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  softDeleteUser: (id, reason) => apiCall(`/admin/users/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
  deleteReview: (id) => apiCall(`/admin/reviews/${id}`, { method: 'DELETE' })
};

// ===========================
// Chatbot API
// ===========================
export const chatbotAPI = {
  send: (message, history = [], signal) =>
    apiCall('/chatbot', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
      signal
    }),
  command: (text, state = {}, signal) =>
    apiCall('/assistant/command', {
      method: 'POST',
      body: JSON.stringify({ text, state }),
      signal
    })
};

export default apiCall;
