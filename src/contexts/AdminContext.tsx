import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/constants';

interface DashboardStats {
  totalTutors: number;
  totalStudents: number;
  activeSubjects: number;
  pendingVerifications: number;
  totalBookings: number;
  totalRevenue: number;
}

interface AdminContextType {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
  verifyTutor: (tutorId: string) => Promise<void>;
  rejectTutor: (tutorId: string, reason: string) => Promise<void>;
  deleteTutor: (tutorId: string) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const verifyTutor = async (tutorId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/verify`);
      await fetchDashboardStats(); // Refresh stats after verification
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
      await fetchDashboardStats(); // Refresh stats after rejection
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
      await fetchDashboardStats(); // Refresh stats after deletion
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
      await fetchDashboardStats(); // Refresh stats after deletion
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete student';
      setError(errorMessage);
      console.error('Delete student error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/admin/subjects/${subjectId}`);
      await fetchDashboardStats(); // Refresh stats after deletion
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete subject';
      setError(errorMessage);
      console.error('Delete subject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/admin/locations/${locationId}`);
      await fetchDashboardStats(); // Refresh stats after deletion
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete location';
      setError(errorMessage);
      console.error('Delete location error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user]);

  const value = {
    stats,
    loading,
    error,
    fetchDashboardStats,
    verifyTutor,
    rejectTutor,
    deleteTutor,
    deleteStudent,
    deleteSubject,
    deleteLocation
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