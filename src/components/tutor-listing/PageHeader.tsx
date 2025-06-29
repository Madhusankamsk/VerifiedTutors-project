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
    <div className="mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Title and description */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
            {title}
          </h1>
          <p className="text-gray-600 text-sm">
            {description}
          </p>
        </div>
        
        {/* Right side - Search Bar */}
        <div className="lg:w-80">
          <div className="relative flex shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={onSearchClear}
                  className="search-clear-button"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <button
              onClick={onSearchSubmit}
              className="search-button"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="ml-1.5 hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 