import React, { useState } from 'react';
import EducationLevelFilter from './EducationLevelFilter';
import SubjectFilter from './SubjectFilter';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import ExtraFilters from './ExtraFilters';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { useSubjects } from '../../contexts/SubjectContext';
import { useLocations } from '../../contexts/LocationContext';

export interface FilterState {
  educationLevel: string;
  subjects: string[];
  teachingMode: string;
  location: {
    city: string;
    town: string;
    hometown: string;
  };
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
  educationLevel: '',
  subjects: [],
  teachingMode: '',
  location: {
    city: '',
    town: '',
    hometown: ''
  },
  extraFilters: {
    minRating: 0,
    priceRange: [0, 1000],
    femaleOnly: false
  }
};

const TutorFilters: React.FC<TutorFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [visibleSections, setVisibleSections] = useState<number[]>([1, 2]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { subjects } = useSubjects();
  const { locations } = useLocations();

  const handleEducationLevelSelect = (level: string) => {
    setFilters(prev => ({ ...prev, educationLevel: level }));
    setActiveLayer(2);
    onFilterChange({ ...filters, educationLevel: level });
    setVisibleSections([2, 3]); // Show only subjects and teaching mode
  };

  const handleSubjectSelect = (subjects: string[]) => {
    setFilters(prev => ({ ...prev, subjects }));
    setActiveLayer(3);
    onFilterChange({ ...filters, subjects });
    setVisibleSections([3, 4]); // Show only teaching mode and location
  };

  const handleTeachingModeSelect = (mode: string) => {
    const newMode = mode || '';
    setFilters(prev => ({ ...prev, teachingMode: newMode }));
    setActiveLayer(4);
    onFilterChange({ ...filters, teachingMode: newMode });
    if (newMode === 'ONLINE') {
      setVisibleSections([5]); // Skip location for online mode, show extra filters
    } else {
      setVisibleSections([4]); // Show only location for offline mode
    }
  };

  const handleLocationSelect = (location: FilterState['location']) => {
    setFilters(prev => ({ ...prev, location }));
    setActiveLayer(5);
    onFilterChange({ ...filters, location });
    setVisibleSections([5]); // Show extra filters after location is selected
  };

  const handleExtraFiltersChange = (extraFilters: FilterState['extraFilters']) => {
    setFilters(prev => ({ ...prev, extraFilters }));
    onFilterChange({ ...filters, extraFilters });
  };

  const handleClearAll = () => {
    // Reset all filters to initial state
    setFilters(initialFilterState);
    // Reset active layer to first step
    setActiveLayer(1);
    // Show only first two sections
    setVisibleSections([1, 2]);
    // Close mobile filter if open
    setIsMobileFiltersOpen(false);
    // Trigger filter change to fetch tutors with reset filters
    onFilterChange(initialFilterState);
  };

  const renderFilterTags = () => {
    const tags = [];
    const filterOrder = ['educationLevel', 'subject', 'teachingMode', 'location', 'rating', 'price'];
    
    // Add tags in reverse order so the most recent one appears last
    if (filters.extraFilters.priceRange[0] > 0 || filters.extraFilters.priceRange[1] < 1000) {
      tags.push({
        key: 'price',
        label: `$${filters.extraFilters.priceRange[0]}-$${filters.extraFilters.priceRange[1]}/hr`,
        onRemove: () => {
          setFilters(prev => ({
            ...prev,
            extraFilters: { ...prev.extraFilters, priceRange: [0, 1000] }
          }));
          setActiveLayer(4);
          setVisibleSections([4, 5]);
        }
      });
    }

    if (filters.extraFilters.minRating > 0) {
      tags.push({
        key: 'rating',
        label: `${filters.extraFilters.minRating}+ Stars`,
        onRemove: () => {
          setFilters(prev => ({
            ...prev,
            extraFilters: { ...prev.extraFilters, minRating: 0 }
          }));
          setActiveLayer(4);
          setVisibleSections([4, 5]);
        }
      });
    }

    if (filters.location.city || filters.location.town || filters.location.hometown) {
      let locationName = '';
      if (filters.location.hometown) {
        const location = locations.find(l => l._id === filters.location.hometown);
        locationName = location?.name || filters.location.hometown;
      } else if (filters.location.town) {
        const location = locations.find(l => l._id === filters.location.town);
        locationName = location?.name || filters.location.town;
      } else if (filters.location.city) {
        const location = locations.find(l => l._id === filters.location.city);
        locationName = location?.name || filters.location.city;
      }

      tags.push({
        key: 'location',
        label: locationName,
        onRemove: () => {
          setFilters(prev => ({ ...prev, location: { city: '', town: '', hometown: '' } }));
          setActiveLayer(3);
          setVisibleSections([3, 4]);
        }
      });
    }

    if (filters.teachingMode) {
      tags.push({
        key: 'teachingMode',
        label: filters.teachingMode,
        onRemove: () => {
          setFilters(prev => ({ ...prev, teachingMode: '' }));
          setActiveLayer(2);
          setVisibleSections([2, 3]);
        }
      });
    }

    if (filters.subjects.length > 0) {
      const subjectName = subjects.find(s => s._id === filters.subjects[0])?.name || filters.subjects[0];
      tags.push({
        key: 'subject',
        label: subjectName,
        onRemove: () => {
          setFilters(prev => ({ ...prev, subjects: [] }));
          setActiveLayer(1);
          setVisibleSections([1, 2]);
        }
      });
    }

    if (filters.educationLevel) {
      tags.push({
        key: 'educationLevel',
        label: filters.educationLevel,
        onRemove: () => {
          setFilters(prev => ({ ...prev, educationLevel: '' }));
          setActiveLayer(1);
          setVisibleSections([1, 2]);
        }
      });
    }

    // Return all tags but only allow removing the most recent one
    return tags.map((tag, index) => ({
      ...tag,
      canRemove: index === 0 // Only the first tag (most recent) can be removed
    }));
  };

  const renderSectionHeader = (layer: number, title: string, icon?: React.ReactNode) => (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
    </div>
  );

  const renderFilterContent = () => {
    const hasActiveFilters = 
      filters.educationLevel || 
      filters.subjects.length > 0 || 
      filters.teachingMode || 
      filters.location.city || 
      filters.location.town || 
      filters.location.hometown || 
      filters.extraFilters.minRating > 0 || 
      filters.extraFilters.priceRange[0] > 0 || 
      filters.extraFilters.priceRange[1] < 1000;

    return (
      <div className="w-full bg-white rounded-lg space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Filter Tutors</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {renderFilterTags().length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {renderFilterTags().map((tag) => (
              <div
                key={tag.key}
                className={`inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium ${
                  !tag.canRemove ? 'opacity-75' : ''
                }`}
              >
                <span>{tag.label}</span>
                {tag.canRemove && (
                  <button
                    onClick={tag.onRemove}
                    className="hover:bg-primary-100 rounded-full p-0.5 -mr-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Education Level Section */}
        {visibleSections.includes(1) && activeLayer >= 1 && (
          <div className="border rounded-lg overflow-hidden bg-white">
            {renderSectionHeader(1, 'Education Level')}
            <div className="p-4 bg-gray-50">
              <EducationLevelFilter
                selectedLevel={filters.educationLevel}
                onSelect={handleEducationLevelSelect}
              />
            </div>
          </div>
        )}

        {/* Subject Section */}
        {visibleSections.includes(2) && activeLayer >= 2 && filters.educationLevel && (
          <div className="border rounded-lg overflow-hidden bg-white">
            {renderSectionHeader(2, 'Subjects')}
            <div className="p-4 bg-gray-50">
              <SubjectFilter
                selectedSubjects={filters.subjects}
                educationLevel={filters.educationLevel}
                onSelect={handleSubjectSelect}
              />
            </div>
          </div>
        )}

        {/* Teaching Mode Section */}
        {visibleSections.includes(3) && activeLayer >= 3 && filters.subjects.length > 0 && (
          <div className="border rounded-lg overflow-hidden bg-white">
            {renderSectionHeader(3, 'Teaching Mode')}
            <div className="p-4 bg-gray-50">
              <TeachingModeFilter
                selectedMode={filters.teachingMode}
                onSelect={handleTeachingModeSelect}
              />
            </div>
          </div>
        )}

        {/* Location Section */}
        {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
          <div className="border rounded-lg overflow-hidden bg-white">
            {renderSectionHeader(4, 'Location')}
            <div className="p-4 bg-gray-50">
              <LocationFilter
                selectedLocation={filters.location}
                onSelect={handleLocationSelect}
              />
            </div>
          </div>
        )}

        {/* Extra Filters Section */}
        {visibleSections.includes(5) && activeLayer >= 5 && (
          <div className="border rounded-lg overflow-hidden bg-white">
            {renderSectionHeader(5, 'Additional Filters')}
            <div className="p-4 bg-gray-50">
              <ExtraFilters
                filters={filters.extraFilters}
                onChange={handleExtraFiltersChange}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Horizontal Filters */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Header Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">Quick Filters</h2>
              </div>
              {renderFilterTags().length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Tags */}
          {renderFilterTags().length > 0 && (
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap gap-1.5">
                {renderFilterTags().map((tag) => (
                  <div
                    key={tag.key}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-primary-100 text-primary-700 rounded-full text-xs font-medium shadow-sm ${
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

          {/* Horizontal Filter Sections */}
          <div className="grid grid-cols-5 divide-x divide-gray-100">
            {/* Education Level */}
            <div className="p-4">
              <EducationLevelFilter
                selectedLevel={filters.educationLevel}
                onSelect={handleEducationLevelSelect}
              />
            </div>

            {/* Subject */}
            {filters.educationLevel && (
              <div className="p-4">
                <SubjectFilter
                  selectedSubjects={filters.subjects}
                  educationLevel={filters.educationLevel}
                  onSelect={handleSubjectSelect}
                />
              </div>
            )}

            {/* Teaching Mode */}
            {filters.subjects.length > 0 && (
              <div className="p-4">
                <TeachingModeFilter
                  selectedMode={filters.teachingMode}
                  onSelect={handleTeachingModeSelect}
                />
              </div>
            )}

            {/* Location */}
            {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
              <div className="p-4">
                <LocationFilter
                  selectedLocation={filters.location}
                  onSelect={handleLocationSelect}
                />
              </div>
            )}

            {/* Extra Filters */}
            {filters.teachingMode && (
              <div className="p-4">
                <ExtraFilters
                  filters={filters.extraFilters}
                  onChange={handleExtraFiltersChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary-600 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
      >
        <Filter className="h-5 w-5" />
        Filters
      </button>

      {/* Mobile Filter Overlay */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold">Filter Tutors</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
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