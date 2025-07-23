import React from 'react';
import { BookOpen } from 'lucide-react';

interface CourseFilterBubblesProps {
  onFilterClick?: (filterType: string, value: string) => void;
  selectedLevel: string;
  className?: string;
}

const CourseFilterBubbles: React.FC<CourseFilterBubblesProps> = ({
  onFilterClick,
  selectedLevel,
  className = ''
}) => {
  const handleFilterClick = (filterType: string, value: string) => {
    if (onFilterClick) {
      onFilterClick(filterType, value);
    }
  };

  const filters = [
    {
      type: 'level',
      value: 'Beginner',
      label: 'Beginner',
      icon: BookOpen,
      description: 'New to the subject'
    }
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedLevel === filter.value;

        return (
          <button
            key={`${filter.type}-${filter.value}`}
            onClick={() => handleFilterClick(filter.type, filter.value)}
            className={`group relative px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 transform ${
              isSelected
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 text-green-100 shadow-lg shadow-green-500/25'
                : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30'
            }`}
          >
            {/* Glow effect for selected state */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-sm -z-10"></div>
            )}
            
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${isSelected ? 'text-green-300' : 'text-white/70'}`} />
              <div className="text-left">
                <div className={`font-medium text-sm ${isSelected ? 'text-green-100' : 'text-white/90'}`}>
                  {filter.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-green-200/80' : 'text-white/60'}`}>
                  {filter.description}
                </div>
              </div>
              {isSelected && (
                <div className="ml-2 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CourseFilterBubbles; 