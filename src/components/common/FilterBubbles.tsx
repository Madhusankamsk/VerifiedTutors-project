import React from 'react';
import { Video, Home, Users } from 'lucide-react';

interface FilterBubblesProps {
  onFilterClick?: (filterType: string, value: string) => void;
  selectedFilters: {
    teachingMode?: string;
    femaleOnly?: boolean;
  };
  className?: string;
}

const FilterBubbles: React.FC<FilterBubblesProps> = ({
  onFilterClick,
  selectedFilters,
  className = ''
}) => {
  const handleFilterClick = (filterType: string, value: string) => {
    if (onFilterClick) {
      onFilterClick(filterType, value);
    }
  };

  const filters = [
    {
      type: 'teachingMode',
      value: 'online',
      label: 'Online',
      icon: Video,
      description: 'Virtual Classes'
    },
    {
      type: 'teachingMode',
      value: 'individual',
      label: 'Home Visit',
      icon: Home,
      description: 'In-Person Classes'
    },
    {
      type: 'femaleOnly',
      value: 'true',
      label: 'Female Only',
      icon: Users,
      description: 'Female Tutors'
    }
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = filter.type === 'teachingMode' 
          ? selectedFilters.teachingMode === filter.value
          : filter.type === 'femaleOnly' 
            ? selectedFilters.femaleOnly === true
            : false;

        return (
          <button
            key={`${filter.type}-${filter.value}`}
            onClick={() => handleFilterClick(filter.type, filter.value)}
            className={`group relative px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 transform ${
              isSelected
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 text-purple-100 shadow-lg shadow-purple-500/25'
                : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30'
            }`}
          >
            {/* Glow effect for selected state */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm -z-10"></div>
            )}
            
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${isSelected ? 'text-purple-300' : 'text-white/70'}`} />
              <div className="text-left">
                <div className={`font-medium text-sm ${isSelected ? 'text-purple-100' : 'text-white/90'}`}>
                  {filter.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-purple-200/80' : 'text-white/60'}`}>
                  {filter.description}
                </div>
              </div>
              {isSelected && (
                <div className="ml-2 w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FilterBubbles; 