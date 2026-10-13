// KaamSetu - API Service
// This file handles all communication between frontend and backend

const API_BASE = 'http://localhost:5000/api';

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
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
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
  deleteReview: (id) =>
    apiCall(`/admin/reviews/${id}`, { method: 'DELETE' })
};

export default apiCall;
