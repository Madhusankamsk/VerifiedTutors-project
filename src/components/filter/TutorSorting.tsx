import React from 'react';
import { Star, DollarSign, Clock, TrendingUp, User } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export interface TutorSortingProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const TutorSorting: React.FC<TutorSortingProps> = ({ 
  sortBy, 
  sortOrder, 
  onSortChange 
}) => {
  const sortOptions: SortOption[] = [
    { 
      value: 'rating', 
      label: 'Rating', 
      icon: <Star className="h-3 w-3" />
    },
    { 
      value: 'price', 
      label: 'Price', 
      icon: <DollarSign className="h-3 w-3" />
    },
    { 
      value: 'experience', 
      label: 'Experience', 
      icon: <TrendingUp className="h-3 w-3" />
    },
    { 
      value: 'name', 
      label: 'Name', 
      icon: <User className="h-3 w-3" />
    },
    { 
      value: 'createdAt', 
      label: 'Newest', 
      icon: <Clock className="h-3 w-3" />
    }
  ];

  const handleSortChange = (newSortBy: string) => {
    console.log('Sort change requested:', { current: sortBy, new: newSortBy, currentOrder: sortOrder });
    
    // If clicking the same sort option, toggle order
    if (newSortBy === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      console.log('Toggling sort order to:', newOrder);
      onSortChange(newSortBy, newOrder);
    } else {
      // Default to descending for most sorts, ascending for name
      const defaultOrder = newSortBy === 'name' ? 'asc' : 'desc';
      console.log('Changing sort to:', newSortBy, 'with default order:', defaultOrder);
      onSortChange(newSortBy, defaultOrder);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Sort By</span>
        </div>
        <div className="text-xs text-gray-500">
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
              sortBy === option.value
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {option.icon}
            <span>{option.label}</span>
            {sortBy === option.value && (
              <span className="text-xs">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TutorSorting; 