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
  getAll: (category) => api.get('/menu', { params: { category } }),
  getById: (id) => api.get(`/menu/${id}`),
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
  getSuggestions: () => api.get('/search/suggestions'),
  getRecommendations: (cartIds) => api.get('/search/recommendations', { params: { cart_ids: cartIds } }),
  chatbot: (message) => api.post('/search/chatbot', { message }),
  getFrequentlyBought: (itemId) => api.get(`/recommendations/frequently-bought/${itemId}`),
  getPersonalized: (email) => api.get('/recommendations/personalized', { params: { customer_email: email } }),
};

export default api;
