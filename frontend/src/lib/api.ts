import axios from 'axios';

const API_BASE_URL = 'http://localhost:8004';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  me: () => api.get('/auth/me'),
};

// Trade accounts API
export const accountsApi = {
  getAll: () => api.get('/api/v1/accounts'),
  create: (data: any) => api.post('/api/v1/accounts', data),
  update: (id: string, data: any) => api.put(`/api/v1/accounts/${id}`, data),
};

// Trades API
export const tradesApi = {
  getAll: (params?: any) => api.get('/api/v1/trades', { params }),
  getById: (id: string) => api.get(`/api/v1/trades/${id}`),
  create: (data: any) => api.post('/api/v1/trades', data),
  update: (id: string, data: any) => api.put(`/api/v1/trades/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/trades/${id}`),
  importCsv: (accountId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/v1/import/csv?account_id=${accountId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Analytics API  
export const analyticsApi = {
  getDashboardStats: () => api.get('/api/v1/dashboard/stats'),
  getPerformance: (params?: any) => api.get('/api/v1/analytics/performance', { params }),
};

// Tags API
export const tagsApi = {
  getAll: () => api.get('/api/v1/tags'),
  create: (data: any) => api.post('/api/v1/tags', data),
  update: (id: string, data: any) => api.put(`/api/v1/tags/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/tags/${id}`),
};

// Journal API
export const journalApi = {
  create: (data: any) => api.post('/api/v1/journal', data),
  getByTrade: (tradeId: string) => api.get(`/api/v1/trades/${tradeId}/journal`),
  update: (id: string, data: any) => api.put(`/api/v1/journal/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/journal/${id}`),
};