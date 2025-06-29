import React, { useState } from 'react';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import { X, Filter, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  teachingMode: string;
  location: string;
  extraFilters: {
    minRating: number;
    priceRange: [number, number];
    femaleOnly: boolean;
  };
}

interface TutorFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

const initialFilterState: FilterState = {
  teachingMode: '',
  location: '',
  extraFilters: {
    minRating: 0,
    priceRange: [0, 1000],
    femaleOnly: false
  }
};

const TutorFilters: React.FC<TutorFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleTeachingModeSelect = (mode: string) => {
    const newMode = mode || '';
    const newFilters = { ...filters, teachingMode: newMode };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationSelect = (location: FilterState['location']) => {
    const newFilters = { ...filters, location };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFemaleOnlyChange = (femaleOnly: boolean) => {
    const newFilters = { 
      ...filters, 
      extraFilters: { ...filters.extraFilters, femaleOnly } 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    setFilters(initialFilterState);
    setIsMobileFiltersOpen(false);
    onFilterChange(initialFilterState);
  };

  const renderFilterTags = () => {
    const tags = [];
    
    if (filters.extraFilters.femaleOnly) {
      tags.push({
        key: 'gender',
        label: 'Female Tutors Only',
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            extraFilters: { ...filters.extraFilters, femaleOnly: false }
          };
          setFilters(updatedFilters);
          onFilterChange(updatedFilters);
        }
      });
    }

    if (filters.location) {
      tags.push({
        key: 'location',
        label: filters.location,
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            location: ''
          };
          setFilters(updatedFilters);
          onFilterChange(updatedFilters);
        }
      });
    }

    if (filters.teachingMode) {
      tags.push({
        key: 'teachingMode',
        label: filters.teachingMode,
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            teachingMode: ''
          };
          setFilters(updatedFilters);
          onFilterChange(updatedFilters);
        }
      });
    }

    return tags.map((tag, index) => ({
      ...tag,
      canRemove: true
    }));
  };

  const hasActiveFilters = 
    filters.teachingMode || 
    filters.location || 
    filters.extraFilters.femaleOnly;

  const teachingModes = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'INDIVIDUAL', label: 'Home Visit' },
    { value: 'GROUP', label: 'Group' },
  ];

  return (
    <>
      {/* Desktop Filters - Compact Design */}
      <div className="hidden lg:block">
        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-medium text-gray-700">Active Filters</h3>
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {renderFilterTags().map((tag) => (
                <div
                  key={tag.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-700 rounded-full text-xs font-medium border border-gray-200 shadow-sm"
                >
                  <span>{tag.label}</span>
                  {tag.canRemove && (
                    <button
                      onClick={tag.onRemove}
                      className="hover:bg-gray-100 rounded-full p-0.5 transition-colors -mr-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Filter Options - Left Side */}
        <div className="flex flex-wrap gap-2 mb-5">
          {/* Teaching Mode Options */}
          {teachingModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleTeachingModeSelect(mode.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                filters.teachingMode === mode.value
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {mode.label}
            </button>
          ))}

          {/* Female Tutors Only */}
          <button
            onClick={() => handleFemaleOnlyChange(!filters.extraFilters.femaleOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
              filters.extraFilters.femaleOnly
                ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Female Tutors
          </button>
        </div>

        {/* Location - Show only when not online */}
        {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
          <div className="mb-5">
            <h3 className="text-xs font-medium text-gray-700 mb-2.5">Location</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <LocationFilter
                selectedLocation={filters.location}
                onSelect={handleLocationSelect}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-700 transition-colors text-sm font-medium"
      >
        <Filter className="h-4 w-4" />
        Filters
        {renderFilterTags().length > 0 && (
          <span className="bg-white text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {renderFilterTags().length}
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-5">
              {/* Active Filter Tags */}
              {hasActiveFilters && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-medium text-gray-700">Active Filters</h3>
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {renderFilterTags().map((tag) => (
                      <div
                        key={tag.key}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-700 rounded-full text-xs font-medium border border-gray-200 shadow-sm"
                      >
                        <span>{tag.label}</span>
                        {tag.canRemove && (
                          <button
                            onClick={tag.onRemove}
                            className="hover:bg-gray-100 rounded-full p-0.5 transition-colors -mr-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Filter Options */}
              <div>
                <h3 className="text-xs font-medium text-gray-700 mb-2.5">Quick Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Teaching Mode Options */}
                  {teachingModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => handleTeachingModeSelect(mode.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                        filters.teachingMode === mode.value
                          ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}

                  {/* Female Tutors Only */}
                  <button
                    onClick={() => handleFemaleOnlyChange(!filters.extraFilters.femaleOnly)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                      filters.extraFilters.femaleOnly
                        ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Female Tutors
                  </button>
                </div>
              </div>

              {/* Location */}
              {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-2.5">Location</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <LocationFilter
                      selectedLocation={filters.location}
                      onSelect={handleLocationSelect}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorFilters; 