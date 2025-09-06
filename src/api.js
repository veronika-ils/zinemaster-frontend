// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // ← your Spring Boot port
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

