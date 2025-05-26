import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Subject {
  _id: string;
  name: string;
  category: string;
}

interface SubjectContextType {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/subjects');
      setSubjects(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectContext.Provider value={{ subjects, loading, error, fetchSubjects }}>
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