import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

// Sri Lankan Education System Categories
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

// Education Levels
export const EDUCATION_LEVELS = {
  PRIMARY: 'Primary (Grade 1-5)',
  JUNIOR_SECONDARY: 'Junior Secondary (Grade 6-9)',
  SENIOR_SECONDARY: 'Senior Secondary (Grade 10-11)',
  ADVANCED_LEVEL: 'Advanced Level (Grade 12-13)',
  HIGHER_EDUCATION: 'Higher Education'
};

// Medium Options
export const MEDIUM_OPTIONS = [
  'English',
  'Sinhala',
  'Tamil'
] as const;

interface Subject {
  _id: string;
  name: string;
  category: string;
  description: string;
  medium: typeof MEDIUM_OPTIONS[number];
  educationLevel: keyof typeof EDUCATION_LEVELS;
  isActive: boolean;
  createdAt: string;
}

interface AdminSubjectContextType {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
  createSubject: (subjectData: Omit<Subject, '_id' | 'createdAt'>) => Promise<void>;
  updateSubject: (id: string, subjectData: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  toggleSubjectStatus: (id: string) => Promise<void>;
}

const AdminSubjectContext = createContext<AdminSubjectContextType | undefined>(undefined);

export const useAdminSubject = () => {
  const context = useContext(AdminSubjectContext);
  if (!context) {
    throw new Error('useAdminSubject must be used within an AdminSubjectProvider');
  }
  return context;
};

export const AdminSubjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchSubjects();
  }, []);

  const value = {
    subjects,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    toggleSubjectStatus
  };

  return (
    <AdminSubjectContext.Provider value={value}>
      {children}
    </AdminSubjectContext.Provider>
  );
}; 