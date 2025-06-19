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

interface EducationLevel {
  value: string;
  label: string;
}

interface EducationLevelFilterProps {
  selectedLevel: string;
  onSelect: (level: string) => void;
}

const EducationLevelFilter: React.FC<EducationLevelFilterProps> = ({
  selectedLevel,
  onSelect
}) => {
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducationLevels = async () => {
      try {
        setLoading(true);
        // Get unique education levels from subjects
        const response = await axios.get<Subject[]>(`${API_URL}/api/subjects`);
        const subjects = response.data;
        
        // Extract unique education levels and sort them
        const uniqueLevels = Array.from(new Set(subjects.map(subject => subject.educationLevel)))
          .filter((level): level is string => Boolean(level))
          .sort((a, b) => {
            const order: Record<string, number> = {
              'PRIMARY': 1,
              'JUNIOR_SECONDARY': 2,
              'SENIOR_SECONDARY': 3,
              'ADVANCED_LEVEL': 4,
              'HIGHER_EDUCATION': 5
            };
            return (order[a] || 0) - (order[b] || 0);
          });

        // Format education levels
        const formattedLevels: EducationLevel[] = uniqueLevels.map(level => ({
          value: level,
          label: level.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')
        }));

        setEducationLevels(formattedLevels);
        setError(null);
      } catch (err) {
        setError('Failed to fetch education levels');
        console.error('Error fetching education levels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEducationLevels();
  }, []);

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
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {educationLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onSelect(level.value)}
            className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
              selectedLevel === level.value
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {educationLevels.length === 0 && (
        <div className="text-center text-gray-500 py-2 text-xs">
          No education levels found
        </div>
      )}
    </div>
  );
};

export default EducationLevelFilter; 