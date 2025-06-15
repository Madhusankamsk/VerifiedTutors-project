import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

type UserRole = 'admin' | 'tutor' | 'student' | null;

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  profileImage?: string;
  socialProvider?: 'google' | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  clearError: () => void;
  socialLogin: (provider: 'google') => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('token', token);
        if (token) {
          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validate token and get user data
          const response = await axios.get(`${API_URL}/api/auth/me`);
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      
      // Save token and set auth header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to login. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Social login function
  const socialLogin = async (provider: 'google') => {
    try {
      setLoading(true);
      setError(null);
      
      // Redirect to social auth endpoint
      window.location.href = `${API_URL}/api/auth/${provider}`;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to login with ${provider}. Please try again.`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/api/auth/register`, { 
        name, 
        email, 
        password, 
        role 
      });
      
      const { token, user } = response.data;
      
      // Save token and set auth header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating profile with data:', data);
      const response = await axios.put(`${API_URL}/api/auth/me`, data);
      console.log('Profile update response:', response.data);
      
      // Update the user state with the new data
      setUser(prevUser => prevUser ? { ...prevUser, ...response.data.user } : null);
      
      return response.data.user;
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = '';
    setUser(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Add this new function
  const uploadProfilePhoto = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Uploading profile photo:', file);
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(`${API_URL}/api/upload/profile-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Photo upload response:', response.data);
      
      if (!response.data.data?.url) {
        throw new Error('No URL received from photo upload');
      }

      // Update user profile with new photo URL
      const updatedUser = await updateProfile({ profileImage: response.data.data.url });
      console.log('Profile image updated:', response.data.data.url);
      
      return response.data.data.url;
    } catch (err: any) {
      console.error('Photo upload error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to upload profile photo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    clearError,
    socialLogin,
    updateProfile,
    uploadProfilePhoto,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};