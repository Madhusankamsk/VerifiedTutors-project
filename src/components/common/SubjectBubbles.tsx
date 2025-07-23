import React from 'react';
import { useSubjects } from '../../contexts/SubjectContext';

interface SubjectBubblesProps {
  onSubjectClick?: (subjectName: string) => void;
  maxSubjects?: number;
  variant?: 'hero' | 'filter' | 'compact';
  showLoading?: boolean;
  className?: string;
  showPopular?: boolean;
  popularSubjects?: string[];
  selectedSubjectId?: string;
  selectedSubjectName?: string;
}

const SubjectBubbles: React.FC<SubjectBubblesProps> = ({
  onSubjectClick,
  maxSubjects = 6,
  variant = 'hero',
  showLoading = false,
  className = '',
  showPopular = false,
  popularSubjects = [],
  selectedSubjectId,
  selectedSubjectName
}) => {
  const { subjects, loading } = useSubjects();

  const handleSubjectClick = (subjectName: string) => {
    if (onSubjectClick) {
      onSubjectClick(subjectName);
    }
  };

  // Loading state
  if (loading || showLoading) {
    return (
      <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 ${className}`}>
        {Array.from({ length: maxSubjects === 0 ? 12 : maxSubjects }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Get base classes based on variant
  const getBaseClasses = () => {
    switch (variant) {
      case 'hero':
        return 'px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm hover:bg-white/20 transition-all duration-200 hover:scale-105 transform';
      case 'filter':
        return 'px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-sm hover:bg-gray-100 hover:border-gray-300 transition-all duration-200';
      case 'compact':
        return 'px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs hover:bg-gray-200 transition-all duration-200';
      default:
        return 'px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm hover:bg-white/20 transition-all duration-200';
    }
  };

  const baseClasses = getBaseClasses();

  // Sort subjects by popularity if enabled
  const sortedSubjects = showPopular && popularSubjects.length > 0
    ? subjects.sort((a, b) => {
        const aIndex = popularSubjects.indexOf(a.name);
        const bIndex = popularSubjects.indexOf(b.name);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return 0;
        return aIndex - bIndex;
      })
    : subjects;

  return (
    <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 ${className}`}>
      {(maxSubjects === 0 ? sortedSubjects : sortedSubjects.slice(0, maxSubjects)).map((subject) => {
        const isPopular = showPopular && popularSubjects.includes(subject.name);
        const isSelected = selectedSubjectId === subject._id || selectedSubjectName === subject.name;
        const popularClasses = isPopular ? 'ring-2 ring-yellow-400/50 shadow-lg' : '';
        const selectedClasses = isSelected ? 'ring-2 ring-blue-400 bg-blue-50/20 text-blue-100' : '';
        
        return (
          <button
            key={subject._id}
            onClick={() => handleSubjectClick(subject.name)}
            className={`${baseClasses} ${popularClasses} ${selectedClasses}`}
            title={isPopular ? 'Popular subject' : undefined}
          >
            {subject.name}
            {isPopular && (
              <span className="ml-1 text-yellow-400">⭐</span>
            )}
            {isSelected && (
              <span className="ml-1 text-blue-300">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SubjectBubbles; 