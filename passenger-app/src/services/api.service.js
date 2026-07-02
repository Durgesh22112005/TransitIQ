// =============================================================
// src/services/api.service.js – Passenger App
// =============================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

export const routeAPI = {
  getAll:  (params) => api.get('/routes', { params }),
  getById: (id)     => api.get(`/routes/${id}`),
};

export const stopAPI = {
  getAll: (params) => api.get('/stops', { params }),
};

export default api;
