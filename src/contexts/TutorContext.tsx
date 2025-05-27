import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/constants';
import { Subject } from './AdminContext';
import { Location } from './LocationContext';

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
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience: {
    position: string;
    institution: string;
    duration: string;
    description: string;
  }[];
  subjects: {
    subject: Subject;
    rates: {
      individual: number;
      group: number;
      online: number;
    };
    availability: {
      day: string;
      slots: {
        start: string;
        end: string;
      }[];
    }[];
  }[];
  locations: Location[];
  documents: {
    _id: string;
    type: 'qualification' | 'identity' | 'other';
    url: string;
    verified: boolean;
  }[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
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
  rates: {
    individual: number;
    group: number;
    online: number;
  };
  availability: TutorAvailability[];
}

export interface TutorReview {
  _id: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

interface TutorContextType {
  // Profile Management
  profile: TutorProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<TutorProfile>) => Promise<void>;
  
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
  
  // Location Management
  addLocation: (locationId: string) => Promise<void>;
  removeLocation: (locationId: string) => Promise<void>;
  
  // Reviews & Ratings
  reviews: TutorReview[];
  fetchReviews: () => Promise<void>;
  
  // Stats & Analytics
  stats: {
    totalStudents: number;
    totalSessions: number;
    averageRating: number;
    totalEarnings: number;
  };
  fetchStats: () => Promise<void>;
  
  // Search & Filter
  searchTutors: (params: {
    subject?: string;
    rating?: number;
    price?: { min: number; max: number };
    location?: string;
    educationLevel?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/tutors/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tutor profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<TutorProfile>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format the data to match backend expectations
      const formattedData = {
        phone: data.phone || '',
        bio: data.bio || '',
        gender: data.gender,
        education: data.education || [],
        experience: data.experience || [],
        subjects: data.subjects || [],
        locations: data.locations || [],
        documents: data.documents || []
      };

      // Validate required fields
      if (!formattedData.phone) {
        throw new Error('Phone number is required');
      }

      const response = await axios.put(`${API_URL}/api/tutors/profile`, formattedData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(response.data.tutor);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
      setProfile(prev => prev ? { ...prev, documents: [...prev.documents, response.data] } : null);
      return response.data;
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
        const updatedDocuments = prev.documents.filter(doc => doc._id !== documentId);
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

  // Location Management
  const addLocation = useCallback(async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_URL}/api/tutors/locations`,
        { locationId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProfile(prev => prev ? { ...prev, locations: [...prev.locations, response.data] } : null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add location';
      setError(errorMessage);
      console.error('Add location error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeLocation = useCallback(async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/tutors/locations/${locationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(prev => {
        if (!prev) return null;
        const updatedLocations = prev.locations.filter(loc => loc._id !== locationId);
        return { ...prev, locations: updatedLocations };
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove location';
      setError(errorMessage);
      console.error('Remove location error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reviews & Ratings
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!profile?._id) return;
      
      const response = await axios.get(`${API_URL}/api/tutors/${profile._id}/reviews`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReviews(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reviews';
      setError(errorMessage);
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?._id]);

  // Stats & Analytics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!profile?._id) return;
      
      const response = await axios.get(`${API_URL}/api/tutors/${profile._id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?._id]);

  // Search & Filter
  const searchTutors = useCallback(async (params: {
    subject?: string;
    rating?: number;
    price?: { min: number; max: number };
    location?: string;
    educationLevel?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.subject) queryParams.append('subject', params.subject);
      if (params.rating) queryParams.append('rating', params.rating.toString());
      if (params.price) {
        queryParams.append('price', `${params.price.min}-${params.price.max}`);
      }
      if (params.location) queryParams.append('location', params.location);
      if (params.educationLevel) queryParams.append('educationLevel', params.educationLevel);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axios.get(`${API_URL}/api/tutors?${queryParams.toString()}`);
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

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchProfile().then(() => {
        fetchReviews();
        fetchStats();
      });
    }
  }, [user, fetchProfile, fetchReviews, fetchStats]);

  const value = {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    addSubject,
    updateSubject,
    removeSubject,
    updateAvailability,
    getAvailabilityForDateRange,
    uploadDocument,
    deleteDocument,
    addLocation,
    removeLocation,
    reviews,
    fetchReviews,
    stats,
    fetchStats,
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
