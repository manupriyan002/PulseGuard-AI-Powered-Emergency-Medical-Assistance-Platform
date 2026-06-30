import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pulseguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pulseguard_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// ─── Profile ──────────────────────────────
export const profileService = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// ─── Medical ──────────────────────────────
export const medicalService = {
  getProfile: () => api.get('/medical'),
  updateProfile: (data) => api.put('/medical', data),
};

// ─── Emergency Contacts ───────────────────
export const emergencyService = {
  getContacts: () => api.get('/contacts'),
  addContact: (data) => api.post('/contacts', data),
  updateContact: (id, data) => api.put(`/contacts/${id}`, data),
  removeContact: (id) => api.delete(`/contacts/${id}`),
};

// ─── SOS ──────────────────────────────────
export const sosService = {
  activate: (data) => api.post('/sos/activate', data),
  deactivate: (data) => api.post('/sos/deactivate', data),
  getHistory: () => api.get('/sos/history'),
  getSession: (id) => api.get(`/sos/session/${id}`),
};

// ─── Tracking ─────────────────────────────
export const trackingService = {
  updateLocation: (data) => api.post('/tracking/update', data),
  getSession: (sessionId) => api.get(`/tracking/session/${sessionId}`),
  getLive: (sessionId) => api.get(`/tracking/live/${sessionId}`),
};

// ─── Triage ───────────────────────────────
export const triageService = {
  assess: (data) => api.post('/triage/assess', data),
  getHistory: () => api.get('/triage/history'),
};

// ─── QR ───────────────────────────────────
export const qrService = {
  generate: () => api.post('/qr/generate'),
  getProfile: (userId) => api.get(`/qr/${userId}`),
  verifyPin: (userId, pin) => api.post(`/qr/${userId}/verify`, { pin }),
  setPin: (data) => api.post('/qr/set-pin', data),
  getAccessLogs: () => api.get('/qr/access-logs/list'),
};

// ─── Hospitals ────────────────────────────
export const hospitalService = {
  findNearby: (lat, lng, radius) =>
    api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`),
};

export default api;
