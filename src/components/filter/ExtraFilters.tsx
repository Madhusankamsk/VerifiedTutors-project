import React from 'react';

interface ExtraFiltersProps {
  filters: {
    minRating: number;
    priceRange: [number, number];
    femaleOnly: boolean;
  };
  onChange: (filters: ExtraFiltersProps['filters']) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const ExtraFilters: React.FC<ExtraFiltersProps> = ({ filters, onChange, onSortChange }) => {
  const handleGenderChange = (femaleOnly: boolean) => {
    onChange({
      ...filters,
      femaleOnly,
    });
  };

  const handleSortOptionClick = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    if (onSortChange) {
      onSortChange(sortBy, sortOrder);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <h3 className="font-medium text-gray-700 text-xs">Filter Options</h3>
        <button
          onClick={() => handleGenderChange(!filters.femaleOnly)}
          className={`w-full px-2 py-1 rounded-md text-xs transition-all ${
            filters.femaleOnly
              ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
        >
          Female Tutors Only
        </button>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-medium text-gray-700 text-xs">Sort By</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleSortOptionClick('rating', 'desc')}
            className="w-full px-2 py-1 rounded-md text-xs transition-all hover:bg-gray-50 border border-transparent"
          >
            Top Rated
          </button>
          <button
            onClick={() => handleSortOptionClick('price', 'asc')}
            className="w-full px-2 py-1 rounded-md text-xs transition-all hover:bg-gray-50 border border-transparent"
          >
            Price: Low to High
          </button>
          <button
            onClick={() => handleSortOptionClick('price', 'desc')}
            className="w-full px-2 py-1 rounded-md text-xs transition-all hover:bg-gray-50 border border-transparent"
          >
            Price: High to Low
          </button>
          <button
            onClick={() => handleSortOptionClick('experience', 'desc')}
            className="w-full px-2 py-1 rounded-md text-xs transition-all hover:bg-gray-50 border border-transparent"
          >
            Most Experienced
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtraFilters; 