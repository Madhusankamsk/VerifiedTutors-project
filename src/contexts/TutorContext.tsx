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

  // Tutor Profile Methods
  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/tutors/${user?.id}`);
      setTutor(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tutor profile');
    } finally {
      setLoading(false);
    }
  };

  const updateTutorProfile = async (data: Partial<Tutor>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/tutors/${tutor?._id}`, data);
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
      const response = await axios.put(`/api/tutors/${tutor?._id}/availability`, availability);
      setTutor(prev => prev ? { ...prev, availability: response.data } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubjects = async (subjects: Array<{ _id: string; name: string; category: string }>) => {
    return updateTutorProfile({ subjects });
  };

  const updateEducation = async (education: Tutor['education']) => {
    return updateTutorProfile({ education });
  };

  const updateExperience = async (experience: Tutor['experience']) => {
    return updateTutorProfile({ experience });
  };

  const updateHourlyRate = async (rate: number) => {
    return updateTutorProfile({ hourlyRate: rate });
  };

  const updateBio = async (bio: string) => {
    return updateTutorProfile({ bio });
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