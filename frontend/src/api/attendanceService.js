import api from './http.js';

export const getAttendanceRecords = async () => {
  const response = await api.get('/attendance');
  return response.data;
};

export const getAttendanceByUser = async (userId) => {
  const response = await api.get(`/attendance/user/${userId}`);
  return response.data;
};

export const createAttendance = async (payload) => {
  const response = await api.post('/attendance', payload);
  return response.data;
};

export const updateAttendance = async (id, payload) => {
  const response = await api.put(`/attendance/${id}`, payload);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};
