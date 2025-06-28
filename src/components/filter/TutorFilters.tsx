import React, { useState } from 'react';
import SubjectFilter from './SubjectFilter';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import ExtraFilters from './ExtraFilters';
import { X, Filter, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  selectedSubject: string | null;
  selectedTopic: string | null;
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
  selectedSubject: null,
  selectedTopic: null,
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

  const handleSubjectSelect = (subjectId: string | null) => {
    const newFilters = { ...filters, selectedSubject: subjectId, selectedTopic: null };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTopicSelect = (topic: string | null) => {
    const newFilters = { ...filters, selectedTopic: topic };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

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

  const handleExtraFiltersChange = (extraFilters: FilterState['extraFilters']) => {
    const newFilters = { ...filters, extraFilters };
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

    if (filters.selectedTopic) {
      tags.push({
        key: 'topic',
        label: filters.selectedTopic,
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            selectedTopic: null
          };
          setFilters(updatedFilters);
          onFilterChange(updatedFilters);
        }
      });
    }

    if (filters.selectedSubject) {
      tags.push({
        key: 'subject',
        label: 'Subject Selected',
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            selectedSubject: null,
            selectedTopic: null
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

  const renderSectionHeader = (title: string, isSelected: boolean = false) => (
    <div className={`p-3 rounded-lg border ${
      isSelected 
        ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm' 
        : 'bg-white border-gray-200 text-gray-700'
    }`}>
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-sm text-gray-900">{title}</h3>
        {isSelected && (
          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-medium">
            Selected
          </span>
        )}
      </div>
    </div>
  );

  const renderFilterContent = () => {
    const hasActiveFilters = 
      filters.selectedSubject || 
      filters.selectedTopic || 
      filters.teachingMode || 
      filters.location || 
      filters.extraFilters.minRating > 0 || 
      filters.extraFilters.priceRange[0] > 0 || 
      filters.extraFilters.priceRange[1] < 1000;

    return (
      <div className="w-full bg-white rounded-lg space-y-2">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Filter Tutors</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {renderFilterTags().length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {renderFilterTags().map((tag) => (
                <div
                  key={tag.key}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100 ${
                    !tag.canRemove ? 'opacity-75' : ''
                  }`}
                >
                  <span>{tag.label}</span>
                  {tag.canRemove && (
                    <button
                      onClick={tag.onRemove}
                      className="hover:bg-primary-100 rounded-full p-0.5 -mr-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Subject & Topic Section */}
        <div className="px-4">
          {renderSectionHeader('Subject & Topic', !!(filters.selectedSubject || filters.selectedTopic))}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <SubjectFilter
              selectedSubject={filters.selectedSubject}
              selectedTopic={filters.selectedTopic}
              onSubjectSelect={handleSubjectSelect}
              onTopicSelect={handleTopicSelect}
            />
          </div>
        </div>

        {/* Teaching Mode Section */}
        <div className="px-4">
          {renderSectionHeader('Teaching Mode', !!filters.teachingMode)}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <TeachingModeFilter
              selectedMode={filters.teachingMode}
              onSelect={handleTeachingModeSelect}
            />
          </div>
        </div>

        {/* Location Section - Show only when not online */}
        {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
          <div className="px-4">
            {renderSectionHeader('Location', !!filters.location)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <LocationFilter
                selectedLocation={filters.location}
                onSelect={handleLocationSelect}
              />
            </div>
          </div>
        )}

        {/* Extra Filters Section */}
        <div className="px-4">
          {renderSectionHeader('Additional Filters')}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <ExtraFilters
              filters={filters.extraFilters}
              onChange={handleExtraFiltersChange}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Horizontal Filters */}
      <div className="hidden lg:block">
        <div className="bg-white border-t border-gray-100">
          {/* Header Section */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary-600" />
              <h2 className="text-sm font-medium text-gray-900">Filters</h2>
            </div>
            {renderFilterTags().length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            )}
          </div>

          {/* Active Filter Tags */}
          {renderFilterTags().length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap gap-2">
                {renderFilterTags().map((tag) => (
                  <div
                    key={tag.key}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-primary-100 text-primary-700 rounded-full text-sm font-medium shadow-sm ${
                      !tag.canRemove ? 'opacity-75' : ''
                    }`}
                  >
                    <span>{tag.label}</span>
                    {tag.canRemove && (
                      <button
                        onClick={tag.onRemove}
                        className="hover:bg-primary-50 rounded-full p-0.5 -mr-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Always Visible Filter Sections */}
          <div className="p-4 space-y-2">
            {/* Subject & Topic */}
            <div>
              {renderSectionHeader('Subject & Topic', !!(filters.selectedSubject || filters.selectedTopic))}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <SubjectFilter
                  selectedSubject={filters.selectedSubject}
                  selectedTopic={filters.selectedTopic}
                  onSubjectSelect={handleSubjectSelect}
                  onTopicSelect={handleTopicSelect}
                />
              </div>
            </div>

            {/* Teaching Mode */}
            <div>
              {renderSectionHeader('Teaching Mode', !!filters.teachingMode)}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <TeachingModeFilter
                  selectedMode={filters.teachingMode}
                  onSelect={handleTeachingModeSelect}
                />
              </div>
            </div>

            {/* Location */}
            {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
              <div>
                {renderSectionHeader('Location', !!filters.location)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <LocationFilter
                    selectedLocation={filters.location}
                    onSelect={handleLocationSelect}
                  />
                </div>
              </div>
            )}

            {/* Extra Filters */}
            <div>
              {renderSectionHeader('Additional Filters')}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <ExtraFilters
                  filters={filters.extraFilters}
                  onChange={handleExtraFiltersChange}
                />
              </div>
            </div>
          </div>
        </div>
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
            <div className="p-4">
              {renderFilterContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorFilters; 