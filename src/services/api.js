import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  login: (name, studentId) => {
    return api.post('/api/auth/login', { name, studentId });
  },
  register: (name, studentId) => {
    return api.post('/api/auth/register', { name, studentId });
  },
};

// File API
export const fileApi = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getFile: (fileName) => {
    return api.get(`/api/files/${fileName}`, {
      responseType: 'blob',
    });
  },
};

export default api;
