import api from './http.js';

export const getLeaveRequests = async () => {
  const response = await api.get('/leaves');
  return response.data;
};

export const getLeaveRequestById = async (id) => {
  const response = await api.get(`/leaves/${id}`);
  return response.data;
};

export const createLeaveRequest = async (payload) => {
  const response = await api.post('/leaves', payload);
  return response.data;
};

export const approveLeaveRequest = async (id) => {
  const response = await api.post(`/leaves/${id}/approve`);
  return response.data;
};

export const rejectLeaveRequest = async (id, payload) => {
  const response = await api.post(`/leaves/${id}/reject`, payload);
  return response.data;
};

export const deleteLeaveRequest = async (id) => {
  const response = await api.delete(`/leaves/${id}`);
  return response.data;
};
