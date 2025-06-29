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
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {renderFilterTags().map((tag) => (
                <div
                  key={tag.key}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
                >
                  <span>{tag.label}</span>
                  {tag.canRemove && (
                    <button
                      onClick={tag.onRemove}
                      className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
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
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Teaching Mode Options */}
          {teachingModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleTeachingModeSelect(mode.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.teachingMode === mode.value
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300'
              }`}
            >
              {mode.label}
            </button>
          ))}

          {/* Female Tutors Only */}
          <button
            onClick={() => handleFemaleOnlyChange(!filters.extraFilters.femaleOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filters.extraFilters.femaleOnly
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-sm'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300'
            }`}
          >
            Female Tutors
          </button>
        </div>

        {/* Location - Show only when not online */}
        {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
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
            
            <div className="p-4 space-y-6">
              {/* Active Filter Tags */}
              {hasActiveFilters && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderFilterTags().map((tag) => (
                      <div
                        key={tag.key}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
                      >
                        <span>{tag.label}</span>
                        {tag.canRemove && (
                          <button
                            onClick={tag.onRemove}
                            className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
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
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Teaching Mode Options */}
                  {teachingModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => handleTeachingModeSelect(mode.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filters.teachingMode === mode.value
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-sm'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}

                  {/* Female Tutors Only */}
                  <button
                    onClick={() => handleFemaleOnlyChange(!filters.extraFilters.femaleOnly)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filters.extraFilters.femaleOnly
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-sm'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Female Tutors
                  </button>
                </div>
              </div>

              {/* Location */}
              {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
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