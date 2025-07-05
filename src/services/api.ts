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

// Booking API
export const createBooking = async (bookingData: {
  tutorId: string;
  subjectId: string;
  startTime: Date;
  endTime: Date;
  notes: string;
  learningMethod: 'online' | 'individual' | 'group';
  contactNumber: string;
  selectedTopics: string[];
  duration: number;
}) => {
  try {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBookings = async () => {
  try {
    const response = await api.get('/api/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    const response = await api.patch(`/api/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export default api; 