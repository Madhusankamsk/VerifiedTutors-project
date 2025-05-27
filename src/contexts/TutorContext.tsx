import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'student' | 'tutor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface Location {
  _id: string;
  name: string;
  province: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

interface Subject {
  _id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Education {
  _id: string;
  degree: string;
  institution: string;
  year: number;
  fieldOfStudy: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Experience {
  _id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  isBooked: boolean;
  bookingId?: string;
}

interface DayAvailability {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  slots: AvailabilitySlot[];
  isAvailable: boolean;
}

interface Tutor {
  _id: string;
  user: User;
  gender: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  locations: Location[];
  bio: string;
  subjects: Subject[];
  education: Education[];
  experience: Experience[];
  hourlyRate: number;
  availability: DayAvailability[];
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  documents: string[];
  status: 'active' | 'inactive' | 'suspended';
  preferences: {
    teachingStyle: string[];
    preferredStudents: string[];
    maxStudentsPerSession: number;
    minSessionDuration: number;
    maxSessionDuration: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface BlogAuthor {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: BlogAuthor;
  featuredImage?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  comments: Array<{
    _id: string;
    user: BlogAuthor;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TutorStats {
  totalStudents: number;
  totalSessions: number;
  averageRating: number;
  totalEarnings: number;
  completedSessions: number;
  upcomingSessions: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  studentRetentionRate: number;
  popularSubjects: Array<{
    subject: Subject;
    sessionCount: number;
  }>;
}

interface TutorContextType {
  tutor: Tutor | null;
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  isProfileLoaded: boolean;
  // Tutor Profile Methods
  fetchTutorProfile: () => Promise<void>;
  fetchTutorById: (id: string) => Promise<Tutor>;
  fetchAllTutors: (filters?: {
    subject?: string;
    rating?: number;
    price?: number;
    search?: string;
    location?: string;
    availability?: string;
    gender?: string;
  }) => Promise<Tutor[]>;
  updateTutorProfile: (data: Partial<Tutor>) => Promise<void>;
  updateAvailability: (availability: DayAvailability[]) => Promise<void>;
  updateSubjects: (subjects: Subject[]) => Promise<void>;
  updateLocations: (locations: Location[]) => Promise<void>;
  updateEducation: (education: Education[]) => Promise<void>;
  updateExperience: (experience: Experience[]) => Promise<void>;
  updateHourlyRate: (rate: number) => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  updatePreferences: (preferences: Tutor['preferences']) => Promise<void>;
  deleteTutorProfile: () => Promise<void>;
  // Blog Methods
  fetchTutorBlogs: () => Promise<void>;
  createBlog: (blogData: {
    title: string;
    content: string;
    featuredImage?: string;
    tags: string[];
    status?: 'draft' | 'published';
  }) => Promise<void>;
  updateBlog: (blogId: string, blogData: Partial<{
    title: string;
    content: string;
    featuredImage: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
  }>) => Promise<void>;
  deleteBlog: (blogId: string) => Promise<void>;
  // Document Methods
  uploadDocument: (file: File) => Promise<string>;
  deleteDocument: (documentUrl: string) => Promise<void>;
  // Stats Methods
  getTutorStats: () => Promise<TutorStats>;
  clearError: () => void;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Clear error state
  const clearError = () => setError(null);

  // Fetch all tutors with optional filters
  const fetchAllTutors = async (filters?: {
    subject?: string;
    rating?: number;
    price?: number;
    search?: string;
    location?: string;
    availability?: string;
    gender?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.price) params.append('price', filters.price.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.availability) params.append('availability', filters.availability);
      if (filters?.gender) params.append('gender', filters.gender);
      
      const response = await axios.get(`/api/tutors?${params.toString()}`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tutors');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch tutor by ID
  const fetchTutorById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/tutors/${id}`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tutor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete tutor profile
  const deleteTutorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete('/api/tutors/profile');
      setTutor(null);
      setIsProfileLoaded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tutor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Tutor Profile Methods
  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id) {
        throw new Error('User ID is missing');
      }

      // Get the tutor profile using the authenticated user
      let response;
      try {
        response = await axios.get('/api/tutors/profile');
      } catch (err) {
        // If tutor profile doesn't exist, create one
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          response = await axios.post('/api/tutors/profile', {
            gender: 'Other',
            mobileNumber: '',
            bio: '',
            hourlyRate: 0,
            subjects: [],
            locations: [],
            education: [],
            experience: [],
            availability: []
          });
        } else {
          throw err;
        }
      }
      setTutor(response.data);
      setIsProfileLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tutor profile');
      setIsProfileLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const updateTutorProfile = async (data: Partial<Tutor>) => {
    try {
      setLoading(true);
      setError(null);

      // If profile doesn't exist, create it first
      if (!tutor?._id) {
        const createResponse = await axios.post('/api/tutors/profile', {
          gender: 'Other',
          mobileNumber: '',
          bio: '',
          hourlyRate: 0,
          subjects: [],
          locations: [],
          education: [],
          experience: [],
          availability: [],
          ...data
        });
        setTutor(createResponse.data);
        setIsProfileLoaded(true);
        return;
      }

      // Update existing profile
      const response = await axios.put('/api/tutors/profile', data);
      setTutor(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tutor profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (availability: DayAvailability[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/availability', availability);
      setTutor(prev => prev ? { ...prev, availability: response.data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubjects = async (subjects: Subject[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/subjects', { subjects });
      setTutor(prev => prev ? { ...prev, subjects: response.data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subjects');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocations = async (locations: Location[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/locations', { locations });
      setTutor(prev => prev ? { ...prev, locations: response.data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update locations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (education: Education[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/education', { education });
      setTutor(prev => prev ? { ...prev, education: response.data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update education');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (experience: Experience[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/experience', { experience });
      setTutor(prev => prev ? { ...prev, experience: response.data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update experience');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHourlyRate = async (rate: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/hourly-rate', { hourlyRate: rate });
      setTutor(prev => prev ? { ...prev, hourlyRate: response.data.hourlyRate } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hourly rate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBio = async (bio: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/bio', { bio });
      setTutor(prev => prev ? { ...prev, bio: response.data.bio } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences: Tutor['preferences']) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/preferences', { preferences });
      setTutor(prev => prev ? { ...prev, preferences: response.data.preferences } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Blog Methods
  const fetchTutorBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/tutors/blogs');
      setBlogs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async (blogData: {
    title: string;
    content: string;
    featuredImage?: string;
    tags: string[];
    status?: 'draft' | 'published';
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/tutors/blogs', blogData);
      setBlogs(prev => [...prev, response.data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (blogId: string, blogData: Partial<{
    title: string;
    content: string;
    featuredImage: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
  }>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/tutors/blogs/${blogId}`, blogData);
      setBlogs(prev => prev.map(blog => blog._id === blogId ? response.data : blog));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/tutors/blogs/${blogId}`);
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // New Methods
  const uploadDocument = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('document', file);
      const response = await axios.post('/api/tutors/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTutor(prev => prev ? { ...prev, documents: [...prev.documents, response.data.url] } : null);
      return response.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentUrl: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/tutors/documents/${encodeURIComponent(documentUrl)}`);
      setTutor(prev => prev ? { ...prev, documents: prev.documents.filter(doc => doc !== documentUrl) } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTutorStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/tutors/stats');
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tutor stats');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch tutor profile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'tutor') {
      fetchTutorProfile();
    }
  }, [isAuthenticated, user]);

  const value = {
    tutor,
    blogs,
    loading,
    error,
    isProfileLoaded,
    fetchTutorProfile,
    fetchTutorById,
    fetchAllTutors,
    updateTutorProfile,
    updateAvailability,
    updateSubjects,
    updateLocations,
    updateEducation,
    updateExperience,
    updateHourlyRate,
    updateBio,
    updatePreferences,
    deleteTutorProfile,
    fetchTutorBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    uploadDocument,
    deleteDocument,
    getTutorStats,
    clearError
  };

  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>;
};

export function useTutor() {
  const context = useContext(TutorContext);
  if (context === undefined) {
    throw new Error('useTutor must be used within a TutorProvider');
  }
  return context;
} 