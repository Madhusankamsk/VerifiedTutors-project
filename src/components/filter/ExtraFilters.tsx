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
        <h3 className="font-medium text-gray-700">Rating</h3>
        <div className="flex gap-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filters.minRating === rating
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {rating}+ Stars
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Price Range (per hour)</h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) =>
              handlePriceRangeChange(Number(e.target.value), filters.priceRange[1])
            }
            className="w-24 px-3 py-2 border rounded-md"
            min="0"
          />
          <span>to</span>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) =>
              handlePriceRangeChange(filters.priceRange[0], Number(e.target.value))
            }
            className="w-24 px-3 py-2 border rounded-md"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Gender</h3>
        <button
          onClick={() => handleGenderChange(!filters.femaleOnly)}
          className={`w-full px-4 py-2 rounded-md text-sm transition-colors ${
            filters.femaleOnly
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
        >
          Female Tutors Only
        </button>
      </div>
    </div>
  );
};

export default ExtraFilters; 