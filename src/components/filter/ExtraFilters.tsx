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
  const handleRatingChange = (rating: number) => {
    onChange({
      ...filters,
      minRating: rating,
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onChange({
      ...filters,
      priceRange: [min, max],
    });
  };

  const handleGenderChange = (femaleOnly: boolean) => {
    onChange({
      ...filters,
      femaleOnly,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-medium text-gray-700 text-sm">Rating</h3>
          <span className="text-xs text-gray-400">(Minimum)</span>
        </div>
        <div className="flex gap-1.5">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`flex-1 px-2 py-2 rounded-md text-xs transition-all ${
                filters.minRating === rating
                  ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              {rating}+ Stars
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-medium text-gray-700 text-sm">Price Range</h3>
          <span className="text-xs text-gray-400">(per hour)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) =>
                handlePriceRangeChange(Number(e.target.value), filters.priceRange[1])
              }
              className="w-full pl-6 pr-2.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
              min="0"
              placeholder="Min"
            />
          </div>
          <span className="text-xs text-gray-400">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) =>
                handlePriceRangeChange(filters.priceRange[0], Number(e.target.value))
              }
              className="w-full pl-6 pr-2.5 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
              min="0"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-medium text-gray-700 text-sm">Gender</h3>
          <span className="text-xs text-gray-400">(Optional)</span>
        </div>
        <button
          onClick={() => handleGenderChange(!filters.femaleOnly)}
          className={`w-full px-3 py-2 rounded-md text-sm transition-all ${
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