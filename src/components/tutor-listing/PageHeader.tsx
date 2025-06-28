import React from 'react';
import { Search, X } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  placeholder?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  placeholder = "Search by tutor name, subject, location, or expertise..."
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Title and description */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {description}
          </p>
        </div>
        
        {/* Right side - Search Bar */}
        <div className="lg:w-96">
          <div className="relative flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-8 py-3 text-sm border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={onSearchClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={onSearchSubmit}
              className="px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg transition-colors flex items-center justify-center"
            >
              <Search className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 