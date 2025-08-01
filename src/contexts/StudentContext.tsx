import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
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
  selectedTopics?: {
    _id: string;
    name: string;
    description?: string;
  }[];
  startTime: string;
  endTime: string;
  duration?: number;
  learningMethod?: string;
  status: string;
  amount: number;
  paymentStatus: string;
  meetingLink?: string;
  notes?: string;
  contactNumber?: string;
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

export const StudentProvider: React.FC<StudentProviderProps> = ({
  children,
}) => {
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
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle the new API response structure with pagination
      if (response.data.success && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        // Fallback for old API response structure
        setBookings(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      toast.error('Error fetching bookings.');

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
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch favourites');
      toast.error('Error fetching favourites.');
      console.error('Error fetching favourites:', err);
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

      toast.success('Tutor added to favorites.');
      fetchFavorites();
    } catch (err: any) {
      toast.error('Failed to add tutor to favorites. Please try again.');
    }
  };

  const removeFavorite = async (tutorId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/students/favorites/${tutorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Tutor removed from favorites.');
      fetchFavorites();
    } catch (err: any) {
      toast.error('Failed to remove tutor from favorites. Please try again.');
    }
  };

  const isFavorite = (tutorId: string) => {
    return favorites.some((fav) => fav.tutor._id === tutorId);
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
    isFavorite,
  };

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
};
