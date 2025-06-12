import React, { useState } from 'react';
import { useSubjects, Subject } from '../../contexts/SubjectContext';

interface TutorSubject {
  _id: string;
  name: string;
  category: string;
}

interface SubjectSelectorProps {
  selectedSubjects: TutorSubject[];
  onSubjectsChange: (subjects: TutorSubject[]) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubjects, onSubjectsChange }) => {
  const { subjects, loading, error } = useSubjects();
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');

  // Get unique education levels from subjects
  const educationLevels = React.useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    return [...new Set(subjects.map(subject => subject.educationLevel))];
  }, [subjects]);

  // Filter subjects based on selected education level
  const filteredSubjects = React.useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    
    return subjects.filter(subject => {
      const matchesEducationLevel = !selectedEducationLevel || subject.educationLevel === selectedEducationLevel;
      return matchesEducationLevel;
    });
  }, [subjects, selectedEducationLevel]);

  const handleSubjectSelect = (subject: Subject) => {
    const tutorSubject: TutorSubject = {
      _id: subject._id,
      name: subject.name,
      category: subject.category
    };
    onSubjectsChange([tutorSubject]); // Only allow one subject
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Error loading subjects: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Education Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Education Level
        </label>
        <select
          value={selectedEducationLevel}
          onChange={(e) => setSelectedEducationLevel(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Levels</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Subject
        </label>
        <select
          value={selectedSubjects[0]?._id || ''}
          onChange={(e) => {
            const selectedSubject = filteredSubjects.find(subject => subject._id === e.target.value);
            if (selectedSubject) {
              handleSubjectSelect(selectedSubject);
            }
          }}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Select a subject</option>
          {filteredSubjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Subject Display */}
      {selectedSubjects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Subject</h3>
          <div className="flex items-center gap-1 px-3 py-2 bg-primary-100 text-primary-800 rounded-md text-sm">
            <span>{selectedSubjects[0].name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector; 