import axios from 'axios';

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

if (typeof window !== 'undefined' && window.location && window.location.hostname) {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    apiBaseUrl = apiBaseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
  }
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
