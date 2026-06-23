import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu endpoints
export const menuAPI = {
  getAll: (category, showAll = false) => api.get('/menu', { params: { category, all: showAll } }),
  getCategories: () => api.get('/menu/categories'),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

// Order endpoints
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (status) => api.get('/orders', { params: { status } }),
  getByEmail: (email) => api.get('/orders', { params: { email } }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/admin/stats'),
};

// Search endpoints
export const searchAPI = {
  search: (query) => api.get('/search', { params: { q: query } }),
  chatbot: (message) => api.post('/search/chatbot', { message }),
  getFrequentlyBought: (itemId, cartIds = '') => api.get(`/recommendations/frequently-bought/${itemId}`, { params: { cart_ids: cartIds } }),
  getPersonalized: (email) => api.get('/recommendations/personalized', { params: { customer_email: email } }),
};

// Auth endpoints
export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  signup: (email, password, role) => api.post('/auth/signup', { email, password, role }),
};

export default api;
