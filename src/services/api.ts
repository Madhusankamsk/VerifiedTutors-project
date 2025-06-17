import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Subject API
export const getSubjects = async (params = {}) => {
  try {
    const response = await api.get('/api/subjects', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export default api; 