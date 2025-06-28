import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSubjects } from '../services/api';

// Define the Subject interface based on the model
interface Subject {
  _id: string;
  name: string;
  topics: string[];
  description: string;
  isActive: boolean;
}

interface SubjectContextType {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: (params?: any) => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSubjects(params);
      setSubjects(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectContext.Provider value={{
      subjects,
      loading,
      error,
      fetchSubjects
    }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjects = () => {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
}; 