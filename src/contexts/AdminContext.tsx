import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/constants';

// Types
interface DashboardStats {
  totalTutors: number;
  totalStudents: number;
  activeSubjects: number;
  pendingVerifications: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface Tutor {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  gender?: 'Male' | 'Female' | 'Other';
  mobileNumber?: string;
  bio?: string;
  subjects?: Array<{
    subject: {
      _id: string;
      name: string;
      category: string;
    };
    rates?: {
      individual: number;
      group: number;
      online: number;
    };
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience?: Array<{
    position: string;
    institution: string;
    duration: string;
    description: string;
  }>;
  hourlyRate?: number;
  rating?: number;
  totalRatings?: number;
  isVerified: boolean;
  documents?: string[];
  createdAt: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface Booking {
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'notified';
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface Location {
  _id: string;
  name: string;
  level: number;
  parent: string | null;
  isActive: boolean;
  children?: Location[];
}

export interface Subject {
  _id: string;
  name: string;
  category: string;
  description: string;
  topics: string[];
  educationLevel: keyof typeof EDUCATION_LEVELS;
  isActive: boolean;
  createdAt: string;
}

// Constants
export const SUBJECT_CATEGORIES = {
  PRIMARY: [
    'Sinhala Language',
    'Tamil Language',
    'English Language',
    'Mathematics',
    'Environmental Studies',
    'Religion',
    'Aesthetics',
    'Health & Physical Education'
  ],
  JUNIOR_SECONDARY: [
    'Sinhala Language',
    'Tamil Language',
    'English Language',
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Citizenship Education',
    'Health & Physical Education',
    'Aesthetics',
    'Practical & Technical Skills',
    'Religion'
  ],
  SENIOR_SECONDARY: [
    'Sinhala Language',
    'Tamil Language',
    'English Language',
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Citizenship Education',
    'Health & Physical Education',
    'Aesthetics',
    'Practical & Technical Skills',
    'Religion',
    'Information & Communication Technology',
    'Entrepreneurship Studies'
  ],
  ADVANCED_LEVEL: {
    ARTS: [
      'Sinhala',
      'Tamil',
      'English',
      'Buddhism',
      'Christianity',
      'Hinduism',
      'Islam',
      'History',
      'Geography',
      'Political Science',
      'Economics',
      'Logic & Scientific Method',
      'Art',
      'Music',
      'Dancing',
      'Drama & Theatre',
      'Information & Communication Technology'
    ],
    COMMERCE: [
      'Business Studies',
      'Economics',
      'Accounting',
      'Business Statistics',
      'Information & Communication Technology'
    ],
    SCIENCE: [
      'Physics',
      'Chemistry',
      'Biology',
      'Combined Mathematics',
      'Information & Communication Technology',
      'Agricultural Science',
      'Engineering Technology',
      'Bio Systems Technology'
    ]
  }
};

export const EDUCATION_LEVELS = {
  PRIMARY: 'Primary (Grade 1-5)',
  JUNIOR_SECONDARY: 'Junior Secondary (Grade 6-9)',
  SENIOR_SECONDARY: 'Senior Secondary (Grade 10-11)',
  ADVANCED_LEVEL: 'Advanced Level (Grade 12-13)',
  HIGHER_EDUCATION: 'Higher Education'
};

export const MEDIUM_OPTIONS = [
  'English',
  'Sinhala',
  'Tamil'
] as const;

interface AdminContextType {
  // Dashboard Stats
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
  
  // Tutor Management
  tutors: Tutor[];
  totalPages: number;
  currentPage: number;
  fetchTutors: (page: number, search: string, filters: TutorFilters) => Promise<void>;
  verifyTutor: (tutorId: string) => Promise<void>;
  rejectTutor: (tutorId: string, reason: string) => Promise<void>;
  deleteTutor: (tutorId: string) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  
  // Subject Management
  subjects: Subject[];
  fetchSubjects: () => Promise<void>;
  createSubject: (subjectData: Omit<Subject, '_id' | 'createdAt'>) => Promise<void>;
  updateSubject: (id: string, subjectData: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  toggleSubjectStatus: (id: string) => Promise<void>;
  
  // Location Management
  locations: Location[];
  fetchLocations: () => Promise<void>;
  createLocation: (locationData: Omit<Location, '_id' | 'children'>) => Promise<Location>;
  updateLocation: (id: string, locationData: Partial<Location>) => Promise<Location>;
  deleteLocation: (id: string) => Promise<void>;
  getAvailableParents: (level: number) => Location[];

  // Booking Management
  bookings: Booking[];
  bookingLoading: boolean;
  bookingError: string | null;
  bookingTotalPages: number;
  bookingCurrentPage: number;
  fetchBookings: (page: number, status: string, sortBy: string) => Promise<void>;
  notifyTutorAboutBooking: (bookingId: string) => Promise<void>;
}

interface TutorFilters {
  verified: string;
  rating: string;
  sortBy: string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Get token from localStorage directly
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState<DashboardStats>({
    totalTutors: 0,
    totalStudents: 0,
    activeSubjects: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for booking management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);

  // Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard stats';
      setError(errorMessage);
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tutor Management
  const fetchTutors = async (page: number, search: string, filters: TutorFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/api/admin/tutors?page=${page}&search=${search}&verified=${filters.verified}&rating=${filters.rating}&sortBy=${filters.sortBy}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.data || !Array.isArray(response.data.tutors)) {
        throw new Error('Invalid response format');
      }

      setTutors(response.data.tutors);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tutors';
      setError(errorMessage);
      console.error('Fetch tutors error:', err);
      setTutors([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const verifyTutor = async (tutorId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.patch(`${API_URL}/api/admin/tutors/${tutorId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchDashboardStats();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify tutor';
      setError(errorMessage);
      console.error('Verify tutor error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectTutor = async (tutorId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.patch(`${API_URL}/api/admin/tutors/${tutorId}/reject`, { reason }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchDashboardStats();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject tutor';
      setError(errorMessage);
      console.error('Reject tutor error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTutor = async (tutorId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/admin/tutors/${tutorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchDashboardStats();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete tutor';
      setError(errorMessage);
      console.error('Delete tutor error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/admin/students/${studentId}`);
      await fetchDashboardStats();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete student';
      setError(errorMessage);
      console.error('Delete student error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subject Management
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/subjects`);
      setSubjects(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch subjects';
      setError(errorMessage);
      console.error('Fetch subjects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subjectData: Omit<Subject, '_id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/api/subjects`, subjectData);
      setSubjects(prev => [...prev, response.data]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create subject';
      setError(errorMessage);
      console.error('Create subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_URL}/api/subjects/${id}`, subjectData);
      setSubjects(prev => prev.map(subject => 
        subject._id === id ? response.data : subject
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update subject';
      setError(errorMessage);
      console.error('Update subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/subjects/${id}`);
      setSubjects(prev => prev.filter(subject => subject._id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete subject';
      setError(errorMessage);
      console.error('Delete subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleSubjectStatus = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const subject = subjects.find(s => s._id === id);
      if (!subject) throw new Error('Subject not found');
      
      const response = await axios.put(`${API_URL}/api/subjects/${id}`, {
        isActive: !subject.isActive,
        topics: subject.topics
      });
      
      setSubjects(prev => prev.map(subject => 
        subject._id === id ? response.data : subject
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle subject status';
      setError(errorMessage);
      console.error('Toggle subject status error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Location Management
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/locations`);      
      // Handle the new response structure
      const locationsData = response.data.tree || [];
      setLocations(locationsData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch locations';
      setError(errorMessage);
      console.error('Fetch locations error:', err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (locationData: Omit<Location, '_id' | 'children'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/api/locations`, locationData);
      await fetchLocations();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create location';
      setError(errorMessage);
      console.error('Create location error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: string, locationData: Partial<Location>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_URL}/api/locations/${id}`, locationData);
      await fetchLocations();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update location';
      setError(errorMessage);
      console.error('Update location error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/locations/${id}`);
      await fetchLocations();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete location';
      setError(errorMessage);
      console.error('Delete location error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableParents = (level: number): Location[] => {
    if (!Array.isArray(locations)) return [];
    
    // For Towns (level 2), show only cities (level 1)
    if (level === 2) {
      return locations.filter(loc => loc.level === 1);
    }
    
    // For Home Towns (level 3), show only towns (level 2)
    if (level === 3) {
      // Flatten the nested structure to get all towns
      const allTowns: Location[] = [];
      locations.forEach(city => {
        if (city.children) {
          allTowns.push(...city.children);
        }
      });
      return allTowns;
    }
    
    return [];
  };

  // Fetch bookings with pagination and filters
  const fetchBookings = async (page: number, status: string, sortBy: string) => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      
      const response = await axios.get(`${API_URL}/api/admin/bookings`, {
        params: { page, status, sortBy },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data.bookings);
      setBookingTotalPages(response.data.totalPages);
      setBookingCurrentPage(page);
      setBookingLoading(false);
    } catch (error: any) {
      setBookingError(error.response?.data?.message || 'Failed to fetch bookings');
      setBookingLoading(false);
    }
  };

  // Notify tutor about a booking
  const notifyTutorAboutBooking = async (bookingId: string) => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      
      await axios.post(`${API_URL}/api/admin/bookings/${bookingId}/notify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh bookings after notification
      await fetchBookings(bookingCurrentPage, 'all', 'newest');
      setBookingLoading(false);
      return Promise.resolve();
    } catch (error: any) {
      setBookingError(error.response?.data?.message || 'Failed to notify tutor');
      setBookingLoading(false);
      return Promise.reject(error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardStats();
      fetchSubjects();
      fetchLocations();
    }
  }, [user]);

  const value = {
    // Dashboard Stats
    stats,
    loading,
    error,
    fetchDashboardStats,
    
    // Tutor Management
    tutors,
    totalPages,
    currentPage,
    fetchTutors,
    verifyTutor,
    rejectTutor,
    deleteTutor,
    deleteStudent,
    
    // Subject Management
    subjects,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    toggleSubjectStatus,
    
    // Location Management
    locations,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    getAvailableParents,

    // Booking Management
    bookings,
    bookingLoading,
    bookingError,
    bookingTotalPages,
    bookingCurrentPage,
    fetchBookings,
    notifyTutorAboutBooking
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
} 