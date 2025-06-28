import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  showResetButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No tutors found",
  description = "Try adjusting your filters or search terms to find what you're looking for.",
  onResetFilters,
  showResetButton = true
}) => {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {description}
      </p>
      {showResetButton && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState; 