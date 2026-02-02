import axios from 'axios';

const API_BASE_URL = 'https://enstarsbe.vercel.app/api';

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

// Get confessions progressively (multiple batches)
export const getConfessionsProgressive = async (totalLimit = 500, batchSize = 100, onBatchReceived) => {
  const allConfessions = [];
  const batches = Math.ceil(totalLimit / batchSize);
  
  for (let i = 0; i < batches; i++) {
    try {
      const response = await api.get('/confessions', { 
        params: { limit: batchSize } 
      });
      
      const newData = response.data.confessions || response.data;
      
      // Filter out duplicates based on ID
      const existingIds = new Set(allConfessions.map(c => c._id || c.id));
      const uniqueNew = newData.filter(c => !existingIds.has(c._id || c.id));
      
      allConfessions.push(...uniqueNew);
      
      // Callback to update UI immediately
      if (onBatchReceived) {
        onBatchReceived([...allConfessions], allConfessions.length, totalLimit);
      }
      
      // Stop if we got less than expected (no more data)
      if (newData.length < batchSize || allConfessions.length >= totalLimit) {
        break;
      }
    } catch (error) {
      console.error(`Error fetching batch ${i + 1}:`, error);
      break;
    }
  }
  
  return allConfessions;
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

export const getPendingConfessions = async (source = 'all', page = 1, limit = 50, status = 'pending') => {
  const response = await api.get('/admin/pending', { 
    params: { source, page, limit, status } 
  });
  return response.data;
};

export const approveConfession = async (id, sourceType) => {
  const response = await api.post(`/admin/approve/${id}`, { sourceType });
  return response.data;
};

export const approveAllConfessions = async (sourceFilter = 'all', statusFilter = 'pending') => {
  const response = await api.post('/admin/approve-all', { sourceFilter, statusFilter });
  return response.data;
};

export const rejectConfession = async (id, sourceType) => {
  const response = await api.post(`/admin/reject/${id}`, { sourceType });
  return response.data;
};

export const deleteConfession = async (id, sourceType) => {
  const response = await api.delete(`/admin/delete/${id}`, { data: { sourceType } });
  return response.data;
};

export const deleteAllConfessions = async (sourceFilter = 'all', statusFilter = 'approved') => {
  const response = await api.post('/admin/delete-all', { sourceFilter, statusFilter });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export default api;
