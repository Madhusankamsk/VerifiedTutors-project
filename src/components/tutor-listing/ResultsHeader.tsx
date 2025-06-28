import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ResultsHeaderProps {
  loading: boolean;
  tutorCount: number;
  activeFiltersCount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  loading,
  tutorCount,
  activeFiltersCount,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    onSortChange(newSortBy, newSortOrder as 'asc' | 'desc');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {loading ? 'Loading...' : `${tutorCount} Tutors Found`}
        </h2>
        {activeFiltersCount > 0 && (
          <span className="text-sm text-gray-500">
            ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied)
          </span>
        )}
      </div>
      
      {/* Sort By Dropdown */}
      {!loading && tutorCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="rating-desc">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="experience-desc">Most Experienced</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsHeader; 