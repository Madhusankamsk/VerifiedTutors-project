import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
}

interface Tutor {
  _id: string;
  user: User;
  gender: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  locations: Array<{
    _id: string;
    name: string;
    province: string;
  }>;
  bio: string;
  subjects: Array<{
    _id: string;
    name: string;
    category: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  hourlyRate: number;
  availability: Array<{
    day: string;
    slots: Array<{
      start: string;
      end: string;
    }>;
  }>;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  documents: string[];
  createdAt: string;
}

interface BlogAuthor {
  _id: string;
  name: string;
  profileImage?: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: BlogAuthor;
  featuredImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface TutorContextType {
  tutor: Tutor | null;
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  // Tutor Profile Methods
  fetchTutorProfile: () => Promise<void>;
  updateTutorProfile: (data: Partial<Tutor>) => Promise<void>;
  updateAvailability: (availability: Tutor['availability']) => Promise<void>;
  updateSubjects: (subjects: Array<{ _id: string; name: string; category: string }>) => Promise<void>;
  updateLocations: (locations: Array<{ _id: string; name: string; province: string }>) => Promise<void>;
  updateEducation: (education: Tutor['education']) => Promise<void>;
  updateExperience: (experience: Tutor['experience']) => Promise<void>;
  updateHourlyRate: (rate: number) => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
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
    status: 'draft' | 'published';
  }>) => Promise<void>;
  deleteBlog: (blogId: string) => Promise<void>;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

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
      if (!isProfileLoaded || !tutor?._id) {
        throw new Error('Tutor profile not loaded. Please try refreshing the page.');
      }

      setLoading(true);
      setError(null);
      const response = await axios.put('/api/tutors/profile', data);
      setTutor(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tutor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (availability: Tutor['availability']) => {
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

  const updateSubjects = async (subjects: Array<{ _id: string; name: string; category: string }>) => {
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

  const updateLocations = async (locations: Array<{ _id: string; name: string; province: string }>) => {
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

  const updateEducation = async (education: Tutor['education']) => {
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

  const updateExperience = async (experience: Tutor['experience']) => {
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

  // Blog Methods
  const fetchTutorBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/blogs', {
        params: { author: tutor?._id }
      });
      setBlogs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
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
      const response = await axios.post('/api/blogs', {
        ...blogData,
        status: blogData.status || 'draft'
      });
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
    status: 'draft' | 'published';
  }>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/blogs/${blogId}`, blogData);
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
      await axios.delete(`/api/blogs/${blogId}`);
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'tutor') {
      fetchTutorProfile();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (tutor?._id) {
      fetchTutorBlogs();
    }
  }, [tutor?._id]);

  const value = {
    tutor,
    blogs,
    loading,
    error,
    fetchTutorProfile,
    updateTutorProfile,
    updateAvailability,
    updateSubjects,
    updateLocations,
    updateEducation,
    updateExperience,
    updateHourlyRate,
    updateBio,
    fetchTutorBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
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