import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData, let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Public API
export const getConfessions = async (limit = 100) => {
  const response = await api.get('/confessions', { params: { limit } });
  return response.data.confessions || response.data; // Handle both old and new format
};

export const submitConfession = async (formData) => {
  const response = await api.post('/confessions/submit', formData);
  return response.data;
};

// Admin API
export const adminLogin = async (username, password) => {
  const response = await api.post('/admin/login', { username, password });
  return response.data;
};

export const getPendingConfessions = async (source = 'all') => {
  const response = await api.get('/admin/pending', { params: { source } });
  return response.data;
};

export const approveConfession = async (id, sourceType) => {
  const response = await api.post(`/admin/approve/${id}`, { sourceType });
  return response.data;
};

export const deleteConfession = async (id, sourceType) => {
  const response = await api.delete(`/admin/delete/${id}`, { data: { sourceType } });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export default api;
