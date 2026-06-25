import api from './http.js';

export const getPayrolls = async () => {
  const response = await api.get('/payrolls');
  return response.data;
};

export const getPayrollById = async (id) => {
  const response = await api.get(`/payrolls/${id}`);
  return response.data;
};

export const createPayroll = async (payload) => {
  const response = await api.post('/payrolls', payload);
  return response.data;
};

export const updatePayroll = async (id, payload) => {
  const response = await api.put(`/payrolls/${id}`, payload);
  return response.data;
};

export const deletePayroll = async (id) => {
  const response = await api.delete(`/payrolls/${id}`);
  return response.data;
};
