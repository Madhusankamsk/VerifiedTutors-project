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
  medium: typeof MEDIUM_OPTIONS[number];
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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTutors: 0,
    totalStudents: 0,
    activeSubjects: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const verifyTutor = async (tutorId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/verify`);
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
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/reject`, { reason });
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
      await axios.delete(`${API_URL}/admin/tutors/${tutorId}`);
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
        isActive: !subject.isActive
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
      const locationsData = Array.isArray(response.data) ? response.data : [];
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
    
    // For Level 1 Towns (level 2), show only cities (level 1)
    if (level === 2) {
      return locations.filter(loc => loc.level === 1);
    }
    
    // For Home Towns (level 3), show only Level 1 Towns (level 2)
    if (level === 3) {
      return locations.filter(loc => loc.level === 2);
    }
    
    return [];
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
    getAvailableParents
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