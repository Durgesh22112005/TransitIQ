// =============================================================
// src/services/api.service.js – Driver App
// Axios instance pre-configured for the TransitIQ backend
// =============================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your backend IP/hostname for physical device testing
const BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor – attach JWT ──────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – normalise errors ───
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────
// Auth APIs
// ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
};

// ─────────────────────────────────────────────
// Driver APIs
// ─────────────────────────────────────────────
export const driverAPI = {
  getAll:    (params) => api.get('/drivers', { params }),
  getById:   (id)     => api.get(`/drivers/${id}`),
  create:    (data)   => api.post('/drivers', data),
  update:    (id, data) => api.put(`/drivers/${id}`, data),
  delete:    (id)     => api.delete(`/drivers/${id}`),
};

// ─────────────────────────────────────────────
// Route APIs
// ─────────────────────────────────────────────
export const routeAPI = {
  getAll:  (params) => api.get('/routes', { params }),
  getById: (id)     => api.get(`/routes/${id}`),
};

export const tripAPI = {
  getCurrent: ()     => api.get('/trips/current'),
  start:      (id)   => api.post(`/trips/${id}/start`),
  end:        (id)   => api.post(`/trips/${id}/end`),
};

export default api;
