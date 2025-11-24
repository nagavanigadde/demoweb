import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const getProducts = async (search = '') => {
  const response = await api.get('/products', { params: { search } });
  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post('/products', product);
  return response.data;
};

export default api;
