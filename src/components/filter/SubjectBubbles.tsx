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
          <div key={i} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium border border-primary-300 shadow-sm">
          <span>{selectedSubjectData.name}</span>
          <button
            onClick={() => onSubjectSelect(null)}
            className="hover:bg-primary-200 rounded-full p-1 transition-colors"
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
      <div className="flex flex-wrap gap-2 mb-4">
        {subjects.map((subject) => (
          <button
            key={subject._id}
            onClick={() => handleSubjectClick(subject._id)}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300 hover:shadow-sm"
          >
            {subject.name}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

export default SubjectBubbles; 