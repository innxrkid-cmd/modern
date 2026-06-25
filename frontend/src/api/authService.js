import api from './http.js';

export const login = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.get('/auth/refresh');
  return response.data;
};
