import React, { useState, useRef, useEffect } from 'react';
import { Star, DollarSign, Clock, TrendingUp, User, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setIsOpen(false);
  };

  const selectedOption = sortOptions.find(option => option.value === sortBy);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="text-sm font-medium text-gray-900">
            {selectedOption?.label || 'Sort By'}
          </span>
          {selectedOption && (
            <span className="text-xs text-gray-500">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {sortBy === option.value && (
                  <span className="text-xs text-blue-600">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorSorting; 