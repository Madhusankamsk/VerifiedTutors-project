import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSubjects } from '../services/api';
import { Subject, Topic } from './AdminContext';
import { API_URL } from '../config/constants';
import axios from 'axios';

interface SubjectContextType {
  subjects: Subject[];
  topics: Topic[];
  loading: boolean;
  error: string | null;
  fetchSubjects: (params?: any) => Promise<void>;
  fetchTopics: (subjectId?: string) => Promise<void>;
  getTopicsBySubject: (subjectId: string) => Topic[];
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
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

  const fetchTopics = async (subjectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = subjectId 
        ? `${API_URL}/api/topics/subject/${subjectId}`
        : `${API_URL}/api/topics`;
      const response = await axios.get(url);
      setTopics(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch topics');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicsBySubject = (subjectId: string): Topic[] => {
    return topics.filter(topic => 
      typeof topic.subject === 'string' 
        ? topic.subject === subjectId 
        : topic.subject._id === subjectId
    );
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectContext.Provider value={{
      subjects,
      topics,
      loading,
      error,
      fetchSubjects,
      fetchTopics,
      getTopicsBySubject
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