import React, { useState } from 'react';
import { useSubjects, Subject } from '../../contexts/SubjectContext';
import { Check, X } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique education levels from subjects
  const educationLevels = React.useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    return [...new Set(subjects.map(subject => subject.educationLevel))];
  }, [subjects]);

  // Get categories for selected education level
  const categories = React.useMemo(() => {
    if (!Array.isArray(subjects) || !selectedEducationLevel) return [];
    return [...new Set(subjects
      .filter(subject => subject.educationLevel === selectedEducationLevel)
      .map(subject => subject.category))];
  }, [subjects, selectedEducationLevel]);

  // Filter subjects based on selected education level, category, and search query
  const filteredSubjects = React.useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    
    return subjects.filter(subject => {
      const matchesEducationLevel = !selectedEducationLevel || subject.educationLevel === selectedEducationLevel;
      const matchesCategory = !selectedCategory || subject.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesEducationLevel && matchesCategory && matchesSearch;
    });
  }, [subjects, selectedEducationLevel, selectedCategory, searchQuery]);

  const handleSubjectSelect = (subject: Subject) => {
    const tutorSubject: TutorSubject = {
      _id: subject._id,
      name: subject.name,
      category: subject.category
    };

    const exists = selectedSubjects.some(sub => sub._id === subject._id);
    if (exists) {
      onSubjectsChange(selectedSubjects.filter(sub => sub._id !== subject._id));
    } else {
      onSubjectsChange([...selectedSubjects, tutorSubject]);
    }
  };

  const isSubjectSelected = (subjectId: string) => {
    return selectedSubjects.some(subject => subject._id === subjectId);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
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
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education Level
          </label>
          <select
            value={selectedEducationLevel}
            onChange={(e) => {
              setSelectedEducationLevel(e.target.value);
              setSelectedCategory('');
            }}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={!selectedEducationLevel}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Selected Subjects */}
      {selectedSubjects.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map((subject) => (
              <div
                key={subject._id}
                className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                <span>{subject.name}</span>
                <button
                  onClick={() => handleSubjectSelect(subject as Subject)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject List */}
      <div className="border rounded-lg divide-y">
        {filteredSubjects.map((subject) => (
          <div
            key={subject._id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleSubjectSelect(subject)}
          >
            <div>
              <h4 className="font-medium text-gray-900">{subject.name}</h4>
              <p className="text-sm text-gray-500">{subject.category}</p>
            </div>
            {isSubjectSelected(subject._id) ? (
              <Check className="h-5 w-5 text-primary-600" />
            ) : (
              <div className="h-5 w-5 border-2 border-gray-300 rounded" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector; 