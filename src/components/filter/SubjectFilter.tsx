import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface Subject {
  _id: string;
  name: string;
  category: string;
  educationLevel: string;
  medium: string;
  description: string;
  isActive: boolean;
}

interface SubjectFilterProps {
  selectedSubjects: string[];
  educationLevel: string;
  onSelect: (subjects: string[]) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({ 
  selectedSubjects, 
  educationLevel,
  onSelect 
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/subjects`, {
          params: {
            educationLevel,
            isActive: true
          }
        });
        setSubjects(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch subjects');
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    if (educationLevel) {
      fetchSubjects();
    }
  }, [educationLevel]);

  const handleSubjectSelect = (subjectId: string) => {
    const newSelectedSubjects = selectedSubjects.includes(subjectId)
      ? selectedSubjects.filter(id => id !== subjectId)
      : [...selectedSubjects, subjectId];
    onSelect(newSelectedSubjects);
  };

  if (loading) {
    return (
      <div className="p-2">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-red-500 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <h3 className="font-medium text-gray-700 text-xs">Subjects</h3>
        <span className="text-xs text-gray-400">(Select one)</span>
      </div>

      <div className="h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="flex flex-col gap-0.5 pr-1">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectSelect(subject._id)}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                selectedSubjects.includes(subject._id)
                  ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {subjects.length === 0 && (
        <div className="text-center text-gray-500 py-1.5 text-xs">
          No subjects found
        </div>
      )}
    </div>
  );
};

export default SubjectFilter; 