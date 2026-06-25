import api from './http.js';

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
