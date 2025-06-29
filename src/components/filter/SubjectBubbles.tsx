import React from 'react';
import { useSubjects } from '../../contexts/SubjectContext';
import { X } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  topics: string[];
  description: string;
  isActive: boolean;
}

interface SubjectBubblesProps {
  selectedSubject: string | null;
  onSubjectSelect: (subjectId: string | null) => void;
  showBubbles: boolean;
}

const SubjectBubbles: React.FC<SubjectBubblesProps> = ({ 
  selectedSubject, 
  onSubjectSelect,
  showBubbles 
}) => {
  const { subjects, loading, error } = useSubjects();

  const handleSubjectClick = (subjectId: string) => {
    if (selectedSubject === subjectId) {
      onSubjectSelect(null);
    } else {
      onSubjectSelect(subjectId);
    }
  };

  const selectedSubjectData = subjects.find(s => s._id === selectedSubject);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-7 bg-gray-200 rounded-full w-16 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm mb-4">
        {error}
      </div>
    );
  }

  // Show selected subject as filter tag
  if (selectedSubject && selectedSubjectData) {
    return (
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-200 shadow-sm hover:bg-primary-100 transition-colors">
          <span>{selectedSubjectData.name}</span>
          <button
            onClick={() => onSubjectSelect(null)}
            className="hover:bg-primary-200 rounded-full p-0.5 transition-colors -mr-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // Show subject bubbles when no subject is selected and showBubbles is true
  if (showBubbles && !selectedSubject) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2.5">Choose a subject:</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject._id)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SubjectBubbles; 