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
        <h3 className="font-medium text-gray-700 text-sm mb-3">Filter Options</h3>
        <button
          onClick={() => handleGenderChange(!filters.femaleOnly)}
          className={`filter-btn ${
            filters.femaleOnly
              ? 'filter-btn-selected'
              : 'filter-btn-unselected'
          }`}
        >
          Female Tutors Only
        </button>
      </div>
    </div>
  );
};

export default ExtraFilters; 