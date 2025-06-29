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
    <div className="space-y-3">
      {/* Rating Filter */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">Minimum Rating</h4>
        <div className="flex items-center gap-1.5">
          {[0, 3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                filters.minRating === rating
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {rating === 0 ? 'Any' : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceChange([Number(e.target.value), filters.priceRange[1]])}
            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-300"
          />
          <span className="text-xs text-gray-500">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange([filters.priceRange[0], Number(e.target.value)])}
            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-300"
          />
          <span className="text-xs text-gray-500">USD</span>
        </div>
      </div>
    </div>
  );
};

export default ExtraFilters; 