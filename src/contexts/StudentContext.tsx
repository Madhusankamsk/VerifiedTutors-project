import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config/constants';

interface Booking {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  tutor: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
  };
  subject: {
    _id: string;
    name: string;
    category: string;
  };
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
  paymentStatus: string;
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

interface Favorite {
  _id: string;
  student: string;
  tutor: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    bio: string;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
  };
  createdAt: string;
}

interface StudentContextType {
  bookings: Booking[];
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addFavorite: (tutorId: string) => Promise<void>;
  removeFavorite: (tutorId: string) => Promise<void>;
  isFavorite: (tutorId: string) => boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/students/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/students/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFavorites(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const addFavorite = async (tutorId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/students/favorites/${tutorId}`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Added to favorites');
      fetchFavorites();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add favorite');
    }
  };
  
  const removeFavorite = async (tutorId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/students/favorites/${tutorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Removed from favorites');
      fetchFavorites();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };
  
  const isFavorite = (tutorId: string) => {
    return favorites.some(fav => fav.tutor._id === tutorId);
  };
  
  useEffect(() => {
    if (user && user.role === 'student') {
      fetchBookings();
      fetchFavorites();
    }
  }, [user]);
  
  const value = {
    bookings,
    favorites,
    loading,
    error,
    fetchBookings,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
  
  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}; 