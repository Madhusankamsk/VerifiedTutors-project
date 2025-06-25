import React from 'react';

interface ExtraFiltersProps {
  filters: {
    minRating: number;
    priceRange: [number, number];
    femaleOnly: boolean;
  };
  onChange: (filters: ExtraFiltersProps['filters']) => void;
}

const ExtraFilters: React.FC<ExtraFiltersProps> = ({ filters, onChange }) => {
  const handleGenderChange = (femaleOnly: boolean) => {
    onChange({
      ...filters,
      femaleOnly,
    });
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
    </div>
  );
};

export default ExtraFilters; 