import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/constants';
import { Subject } from './AdminContext';

// Types
export interface TutorProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  bio: string;
  socialMedia: {
    instagram: string;
    youtube: string;
    facebook: string;
    linkedin: string;
  };
  teachingMediums: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  subjects: {
    subject: Subject;
    selectedTopics: (string | { _id: string; name: string; description?: string })[];
    teachingModes: {
      type: 'online' | 'home-visit' | 'group';
      rate: number;
      enabled: boolean;
    }[];
    availability: {
      day: string;
      slots: {
        start: string;
        end: string;
      }[];
    }[];
    // Legacy fields for backward compatibility
    bestTopics?: string[];
    rates?: {
      individual: number;
      online: number;
    };
  }[]; // Note: Array with max length 1
  availableLocations: string;
  documents: {
    id?: string;
    url: string;
  }[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationChecks: {
    documents: boolean;
    education: boolean;
    experience: boolean;
    background: boolean;
    interview: boolean;
  };
  rejectionReason?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  totalEarnings: number;
  totalStudents: number;
  totalSessions: number;
}

export interface TutorAvailability {
  day: string;
  slots: {
    start: string;
    end: string;
  }[];
}

export interface TutorSubject {
  subject: Subject;
  selectedTopics: (string | { _id: string; name: string; description?: string })[];
  teachingModes: {
    type: 'online' | 'home-visit' | 'group';
    rate: number;
    enabled: boolean;
  }[];
  availability: TutorAvailability[];
  // Legacy fields for backward compatibility
  bestTopics?: string[];
  rates?: {
    individual: number;
    group: number;
    online: number;
  };
}

export interface TutorReview {
  _id: string;
  student: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  subject: {
    _id: string;
    name: string;
    category: string;
  };
  topics: {
    _id: string;
    name: string;
    description?: string;
  }[];
  rating: number;
  review: string;
  isVerified: boolean;
  createdAt: string;
}

export interface TutorBlog {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  featuredImage: string;
  status: 'draft' | 'published';
}

export interface Favorite {
  _id: string;
  tutor: TutorProfile;
  student: string;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  featuredImage?: string;
  tags?: string[];
  status: 'draft' | 'published';
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface TutorContextType {
  // Profile Management
  profile: TutorProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  fetchTutorById: (id: string) => Promise<TutorProfile>;
  updateProfile: (data: Partial<TutorProfile>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  
  // Subject Management
  addSubject: (subjectData: TutorSubject) => Promise<void>;
  updateSubject: (subjectId: string, data: Partial<TutorSubject>) => Promise<void>;
  removeSubject: (subjectId: string) => Promise<void>;
  
  // Availability Management
  updateAvailability: (subjectId: string, availability: TutorAvailability[]) => Promise<void>;
  getAvailabilityForDateRange: (startDate: Date, endDate: Date) => Promise<any>;
  
  // Document Management
  uploadDocument: (file: File, type: 'qualification' | 'identity' | 'other') => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  
  // Reviews & Ratings
  reviews: TutorReview[];
  fetchReviews: (tutorId?: string) => Promise<void>;
  addReview: (tutorId: string, rating: number, review: string) => Promise<void>;
  
  // Blog Management
  blogs: Blog[];
  fetchBlogs: () => Promise<void>;
  getBlogById: (id: string) => Promise<Blog | null>;
  createBlog: (blogData: Partial<Blog>) => Promise<void>;
  updateBlog: (id: string, blogData: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  
  // Favorites Management (for students)
  favorites: Favorite[];
  fetchFavorites: () => Promise<void>;
  addFavorite: (tutorId: string) => Promise<void>;
  removeFavorite: (tutorId: string) => Promise<void>;
  
  // Stats & Analytics
  stats: {
    totalStudents: number;
    totalSessions: number;
    averageRating: number;
    totalEarnings: number;
  };
  fetchStats: () => Promise<void>;
  
  // Booking Management
  createBooking: (bookingData: {
    tutorId: string;
    subjectId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
    learningMethod: 'online' | 'individual' | 'group';
    contactNumber: string;
    selectedTopics?: string[];
    duration?: number;
  }) => Promise<any>;
  
  // Search & Filter
  searchTutors: (params: {
    subject?: string;
    topic?: string;
    rating?: number;
    price?: { min: number; max: number };
    location?: string;
    teachingMode?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    femaleOnly?: boolean;
  }) => Promise<{
    tutors: TutorProfile[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }>;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<TutorReview[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TutorContextType['stats']>({
    totalStudents: 0,
    totalSessions: 0,
    averageRating: 0,
    totalEarnings: 0
  });

  // Profile Management
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/tutors/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setProfile(response.data);
        console.log("response.data", response.data);
      } else {
        setError('No profile data received');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setProfile(null);
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 404) {
        setProfile(null);
        setError(null);
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to fetch tutor profile';
        setError(errorMessage);
        console.error('Profile fetch error:', err);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);
  console.log("profile", profile);
  const fetchTutorById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/tutors/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tutor profile';
      setError(errorMessage);
      console.error('Tutor fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<TutorProfile>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${API_URL}/api/tutors/profile`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('response.data', response.data);
      if (response.data) {
        setProfile(response.data.tutor);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProfile = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`${API_URL}/api/tutors/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setProfile(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Blog Management
  const fetchBlogs = useCallback(async () => {
    if (!user) {
      setBlogs([]);
      return;
    }

    // try {
    //   setLoading(true);
    //   setError(null);
    //   const response = await axios.get(`${API_URL}/api/tutors/blogs`, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem('token')}`
    //     }
    //   });
      
    //   if (response.data.success) {
    //     console.log('response.data.data', response.data.data);
    //     setBlogs(response.data.data);
    //   } else {
    //     throw new Error(response.data.message || 'Failed to fetch blogs');
    //   }
    // } catch (err: any) {
    //   const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch blogs';
    //   setError(errorMessage);
    //   setBlogs([]);
    // } finally {
    //   setLoading(false);
    // }
  }, [user]);

  const getBlogById = useCallback(async (id: string): Promise<Blog | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/tutors/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        console.log('response.data.data', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch blog');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch blog';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBlog = useCallback(async (blogData: Partial<Blog>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_URL}/api/tutors/blogs`,
        blogData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBlogs(prev => [...prev, response.data.data]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateBlog = useCallback(async (id: string, blogData: Partial<Blog>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `${API_URL}/api/tutors/blogs/${id}`,
        blogData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBlogs(prev => prev.map(blog => 
        blog._id === id ? response.data.data : blog
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteBlog = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      await axios.delete(
        `${API_URL}/api/tutors/blogs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBlogs(prev => prev.filter(blog => blog._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Favorites Management
  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/students/favorites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavorites(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch favorites';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addFavorite = useCallback(async (tutorId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/api/students/favorites/${tutorId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavorites(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add favorite';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFavorite = useCallback(async (tutorId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/students/favorites/${tutorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavorites(prev => prev.filter(fav => fav.tutor._id !== tutorId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove favorite';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subject Management
  const addSubject = useCallback(async (subjectData: TutorSubject) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/api/tutors/subjects`, subjectData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(prev => prev ? { ...prev, subjects: [...prev.subjects, response.data] } : null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add subject';
      setError(errorMessage);
      console.error('Add subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubject = useCallback(async (subjectId: string, data: Partial<TutorSubject>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(`${API_URL}/api/tutors/subjects/${subjectId}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(prev => {
        if (!prev) return null;
        const updatedSubjects = prev.subjects.map(subject =>
          subject.subject._id === subjectId ? { ...subject, ...response.data } : subject
        );
        return { ...prev, subjects: updatedSubjects };
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update subject';
      setError(errorMessage);
      console.error('Update subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSubject = useCallback(async (subjectId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/tutors/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(prev => {
        if (!prev) return null;
        const updatedSubjects = prev.subjects.filter(subject => subject.subject._id !== subjectId);
        return { ...prev, subjects: updatedSubjects };
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove subject';
      setError(errorMessage);
      console.error('Remove subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Availability Management
  const updateAvailability = useCallback(async (subjectId: string, availability: TutorAvailability[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(
        `${API_URL}/api/tutors/subjects/${subjectId}/availability`,
        { availability },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProfile(prev => {
        if (!prev) return null;
        const updatedSubjects = prev.subjects.map(subject =>
          subject.subject._id === subjectId ? { ...subject, availability: response.data.availability } : subject
        );
        return { ...prev, subjects: updatedSubjects };
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update availability';
      setError(errorMessage);
      console.error('Update availability error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailabilityForDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/api/tutors/${profile?._id}/availability`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch availability';
      setError(errorMessage);
      console.error('Fetch availability error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile?._id]);

  // Document Management
  const uploadDocument = useCallback(async (file: File, type: 'qualification' | 'identity' | 'other') => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);

      const response = await axios.post(`${API_URL}/api/tutors/documents`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Handle the new response format
      const documentData = response.data.data || response.data;
      setProfile(prev => prev ? { ...prev, documents: [...prev.documents, documentData] } : null);
      return documentData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload document';
      setError(errorMessage);
      console.error('Document upload error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/tutors/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(prev => {
        if (!prev) return null;
        const updatedDocuments = prev.documents.filter(doc => doc.id !== documentId);
        return { ...prev, documents: updatedDocuments };
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete document';
      setError(errorMessage);
      console.error('Document delete error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reviews & Ratings
  const fetchReviews = useCallback(async (tutorId?: string) => {
    const targetTutorId = tutorId || profile?._id;
    if (!targetTutorId) {
      setReviews([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/tutors/${targetTutorId}/reviews`);
      if (response.data && Array.isArray(response.data)) {
        setReviews(response.data);
      } else {
        setReviews([]);
        console.error('Invalid reviews data format:', response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reviews';
      setError(errorMessage);
      console.error('Reviews fetch error:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [profile?._id]);

  const addReview = useCallback(async (bookingId: string, rating: number, review: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/ratings`,
        { bookingId, rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }, []);

  // Stats & Analytics
  const fetchStats = useCallback(async () => {
    if (!profile?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/tutors/${profile._id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch stats';
        setError(errorMessage);
        console.error('Stats fetch error:', err);
      }
      setStats({
        totalStudents: 0,
        totalSessions: 0,
        averageRating: 0,
        totalEarnings: 0
      });
    } finally {
      setLoading(false);
    }
  }, [profile?._id]);

  // Booking Management
  const createBooking = useCallback(async (bookingData: {
    tutorId: string;
    subjectId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
    learningMethod: 'online' | 'individual' | 'group';
    contactNumber: string;
    selectedTopics?: string[];
    duration?: number;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare the booking payload with all required fields
      const bookingPayload = {
        tutorId: bookingData.tutorId,
        subjectId: bookingData.subjectId,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        notes: bookingData.notes || '',
        learningMethod: bookingData.learningMethod,
        contactNumber: bookingData.contactNumber,
        selectedTopics: bookingData.selectedTopics || [],
        duration: bookingData.duration || ((bookingData.endTime.getTime() - bookingData.startTime.getTime()) / (1000 * 60 * 60))
      };

      console.log('Creating booking with payload:', bookingPayload);

      const response = await axios.post(
        `${API_URL}/api/students/bookings`,
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log("Booking responce",response.data)
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      setError(errorMessage);
      console.error('Booking creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Search & Filter
  const searchTutors = useCallback(async (params: {
    subject?: string;
    topic?: string;
    rating?: number;
    price?: { min: number; max: number };
    location?: string;
    teachingMode?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    femaleOnly?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      console.log("TutorContext searchTutors called with params:", params);
      
      // Add filters only if they have values
      if (params.subject) queryParams.append('subject', params.subject);
      if (params.topic) queryParams.append('topic', params.topic);

      if (params.location && params.location.trim() !== '') {
        queryParams.append('location', params.location.trim());
      }
      if (params.teachingMode && params.teachingMode.trim() !== '') {
        // Map teaching mode values to backend expectations
        let teachingModeValue = params.teachingMode.toUpperCase();
        if (teachingModeValue === 'INDIVIDUAL') {
          teachingModeValue = 'INDIVIDUAL'; // Keep as INDIVIDUAL for backend
        }
        queryParams.append('teachingMode', teachingModeValue);
      }
      // Ensure search parameter is properly handled
      console.log('Search param:', params.search);
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search.trim());
        console.log('Adding search param to query:', params.search.trim());
      } else {
        console.log('No search param provided or empty search');
      }
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.femaleOnly) queryParams.append('femaleOnly', 'true');

      const queryString = queryParams.toString();
      console.log(`Making API request to: ${API_URL}/api/tutors?${queryString}`);
      
      const response = await axios.get(`${API_URL}/api/tutors?${queryString}`);
      console.log('Search response received:', response.data.tutors.length, 'tutors found');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to search tutors';
      setError(errorMessage);
      console.error('Search tutors error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      try {
        await fetchProfile();
        
        if (profile?._id && isMounted) {
          await Promise.all([
            fetchReviews(),
            fetchStats(),
            fetchBlogs()
          ]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [user, profile?._id]);

  const value = {
    profile,
    loading,
    error,
    fetchProfile,
    fetchTutorById,
    updateProfile,
    deleteProfile,
    blogs,
    fetchBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    favorites,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    addSubject,
    updateSubject,
    removeSubject,
    updateAvailability,
    getAvailabilityForDateRange,
    uploadDocument,
    deleteDocument,
    reviews,
    fetchReviews,
    addReview,
    stats,
    fetchStats,
    createBooking,
    searchTutors
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
