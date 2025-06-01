import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  featuredImage: string;
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  } | string; // Can be either populated object or just the ID
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  readingTime?: number;
  likes: number;
  __v?: number;
  id?: string; // Some APIs return both _id and id
}

interface BlogContextType {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  getBlogById: (id: string) => Promise<BlogPost>;
  likeBlog: (id: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/blogs`);
      setPosts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getBlogById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/tutors/blogs/${id}`);
      return response.data.data; // Handle the nested data structure
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const likeBlog = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/api/blogs/${id}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Update the likes count in the local state
      setPosts(prev => prev.map(post => 
        post._id === id ? { ...post, likes: (post.likes || 0) + 1 } : post
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to like blog');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <BlogContext.Provider value={{ posts, loading, error, fetchBlogs, getBlogById, likeBlog }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}; 