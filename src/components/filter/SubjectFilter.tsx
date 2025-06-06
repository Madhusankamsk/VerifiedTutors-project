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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredSubjects.map((subject) => (
          <button
            key={subject._id}
            onClick={() => handleSubjectSelect(subject._id)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              selectedSubjects.includes(subject._id)
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No subjects found
        </div>
      )}
    </div>
  );
};

export default SubjectFilter; 