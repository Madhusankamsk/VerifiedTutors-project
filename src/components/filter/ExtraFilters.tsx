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
  const handleRatingChange = (minRating: number) => {
    onChange({
      ...filters,
      minRating,
    });
  };

  const handlePriceChange = (priceRange: [number, number]) => {
    onChange({
      ...filters,
      priceRange,
    });
  };

  return (
    <div className="space-y-4">
      {/* Rating Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h4>
        <div className="flex items-center gap-2">
          {[0, 3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                filters.minRating === rating
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {rating === 0 ? 'Any' : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceChange([Number(e.target.value), filters.priceRange[1]])}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange([filters.priceRange[0], Number(e.target.value)])}
            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">USD</span>
        </div>
      </div>
    </div>
  );
};

export default ExtraFilters; 