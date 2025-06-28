import React, { useState } from 'react';
import EducationLevelFilter from './EducationLevelFilter';
import SubjectFilter from './SubjectFilter';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import ExtraFilters from './ExtraFilters';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { useSubjects } from '../../contexts/SubjectContext';
import { useLocations } from '../../contexts/LocationContext';
import TownsFilter from './TownsFilter';
import HometownsFilter from './HometownsFilter';

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
    setVisibleSections([2, 3]);
  };

  const handleSubjectSelect = (subjects: string[]) => {
    setFilters(prev => ({ ...prev, subjects }));
    setActiveLayer(3);
    onFilterChange({ ...filters, subjects });
    setVisibleSections([3, 4]);
  };

  const handleTeachingModeSelect = (mode: string) => {
    const newMode = mode || '';
    setFilters(prev => ({ ...prev, teachingMode: newMode }));
    setActiveLayer(4);
    onFilterChange({ ...filters, teachingMode: newMode });
    if (newMode === 'ONLINE') {
      setVisibleSections([5]);
    } else {
      setVisibleSections([4, 5]);
    }
  };

  const handleLocationSelect = (location: FilterState['location']) => {
    setFilters(prev => ({ ...prev, location }));
    onFilterChange({ ...filters, location });
  };

  const handleExtraFiltersChange = (extraFilters: FilterState['extraFilters']) => {
    setFilters(prev => ({ ...prev, extraFilters }));
    onFilterChange({ ...filters, extraFilters });
  };

  const handleClearAll = () => {
    setFilters(initialFilterState);
    setActiveLayer(1);
    setVisibleSections([1, 2]);
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

    if (filters.location.city || filters.location.town || filters.location.hometown) {
      let locationName = '';
      if (filters.location.hometown) {
        const city = locations.find(l => l._id === filters.location.city);
        const town = city?.children?.find(t => t._id === filters.location.town);
        const hometown = town?.children?.find(h => h._id === filters.location.hometown);
        locationName = hometown?.name || filters.location.hometown;
      } else if (filters.location.town) {
        const city = locations.find(l => l._id === filters.location.city);
        const town = city?.children?.find(t => t._id === filters.location.town);
        locationName = town?.name || filters.location.town;
      } else if (filters.location.city) {
        const city = locations.find(l => l._id === filters.location.city);
        locationName = city?.name || filters.location.city;
      }

      tags.push({
        key: 'location',
        label: locationName,
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            location: { city: '', town: '', hometown: '' }
          };
          setFilters(updatedFilters);
          setActiveLayer(3);
          setVisibleSections([3, 4]);
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
          setActiveLayer(2);
          setVisibleSections([2, 3]);
          onFilterChange(updatedFilters);
        }
      });
    }

    if (filters.subjects.length > 0) {
      const subjectName = subjects.find(s => s._id === filters.subjects[0])?.name || filters.subjects[0];
      tags.push({
        key: 'subject',
        label: subjectName,
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            subjects: []
          };
          setFilters(updatedFilters);
          setActiveLayer(1);
          setVisibleSections([1, 2]);
          onFilterChange(updatedFilters);
        }
      });
    }

    if (filters.educationLevel) {
      tags.push({
        key: 'educationLevel',
        label: filters.educationLevel,
        onRemove: () => {
          const updatedFilters = {
            ...filters,
            educationLevel: ''
          };
          setFilters(updatedFilters);
          setActiveLayer(1);
          setVisibleSections([1, 2]);
          onFilterChange(updatedFilters);
        }
      });
    }

    return tags.map((tag, index) => ({
      ...tag,
      canRemove: index === 0
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
        
        {/* Education Level Section */}
        {visibleSections.includes(1) && activeLayer >= 1 && (
          <div className="px-4">
            {renderSectionHeader('Education Level', !!filters.educationLevel)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <EducationLevelFilter
                selectedLevel={filters.educationLevel}
                onSelect={handleEducationLevelSelect}
              />
            </div>
          </div>
        )}

        {/* Subject Section */}
        {visibleSections.includes(2) && activeLayer >= 2 && filters.educationLevel && (
          <div className="px-4">
            {renderSectionHeader('Subjects', filters.subjects.length > 0)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
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
          <div className="px-4">
            {renderSectionHeader('Teaching Mode', !!filters.teachingMode)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <TeachingModeFilter
                selectedMode={filters.teachingMode}
                onSelect={handleTeachingModeSelect}
              />
            </div>
          </div>
        )}

        {/* Location Section - Show Cities only when no city is selected */}
        {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && !filters.location.city && (
          <div className="px-4">
            {renderSectionHeader('Location', !!filters.location.city)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <LocationFilter
                selectedLocation={filters.location}
                onSelect={handleLocationSelect}
              />
            </div>
          </div>
        )}

        {/* Towns Section - Show Towns only when city is selected but no town */}
        {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && filters.location.city && !filters.location.town && (
          <div className="px-4">
            {renderSectionHeader('Towns', !!filters.location.town)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <TownsFilter
                selectedTown={filters.location.town}
                selectedCity={filters.location.city}
                onSelect={(townId: string) => handleLocationSelect({
                  ...filters.location,
                  town: townId,
                  hometown: ''
                })}
              />
            </div>
          </div>
        )}

        {/* Hometowns Section - Show Hometowns only when town is selected but no hometown */}
        {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && filters.location.city && filters.location.town && !filters.location.hometown && (
          <div className="px-4">
            {renderSectionHeader('Hometowns', !!filters.location.hometown)}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <HometownsFilter
                selectedHometown={filters.location.hometown}
                selectedTown={filters.location.town}
                selectedCity={filters.location.city}
                onSelect={(hometownId: string) => handleLocationSelect({
                  ...filters.location,
                  hometown: hometownId
                })}
              />
            </div>
          </div>
        )}

        {/* Extra Filters Section */}
        {visibleSections.includes(5) && activeLayer >= 5 && (
          <div className="px-4">
            {renderSectionHeader('Additional Filters', 
              filters.extraFilters.minRating > 0 || 
              filters.extraFilters.priceRange[0] > 0 || 
              filters.extraFilters.priceRange[1] < 1000 || 
              filters.extraFilters.femaleOnly
            )}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
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
            {/* Education Level */}
            {visibleSections.includes(1) && activeLayer >= 1 && (
              <div>
                {renderSectionHeader('Education Level', !!filters.educationLevel)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <EducationLevelFilter
                    selectedLevel={filters.educationLevel}
                    onSelect={handleEducationLevelSelect}
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            {visibleSections.includes(2) && activeLayer >= 2 && filters.educationLevel && (
              <div>
                {renderSectionHeader('Subjects', filters.subjects.length > 0)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <SubjectFilter
                    selectedSubjects={filters.subjects}
                    educationLevel={filters.educationLevel}
                    onSelect={handleSubjectSelect}
                  />
                </div>
              </div>
            )}

            {/* Teaching Mode */}
            {visibleSections.includes(3) && activeLayer >= 3 && filters.subjects.length > 0 && (
              <div>
                {renderSectionHeader('Teaching Mode', !!filters.teachingMode)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <TeachingModeFilter
                    selectedMode={filters.teachingMode}
                    onSelect={handleTeachingModeSelect}
                  />
                </div>
              </div>
            )}

            {/* Location */}
            {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && !filters.location.city && (
              <div>
                {renderSectionHeader('Location', !!filters.location.city)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <LocationFilter
                    selectedLocation={filters.location}
                    onSelect={handleLocationSelect}
                  />
                </div>
              </div>
            )}

            {/* Towns */}
            {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && filters.location.city && !filters.location.town && (
              <div>
                {renderSectionHeader('Towns', !!filters.location.town)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <TownsFilter
                    selectedTown={filters.location.town}
                    selectedCity={filters.location.city}
                    onSelect={(townId: string) => handleLocationSelect({
                      ...filters.location,
                      town: townId,
                      hometown: ''
                    })}
                  />
                </div>
              </div>
            )}

            {/* Hometowns */}
            {visibleSections.includes(4) && activeLayer >= 4 && filters.teachingMode && filters.teachingMode !== 'ONLINE' && filters.location.city && filters.location.town && !filters.location.hometown && (
              <div>
                {renderSectionHeader('Hometowns', !!filters.location.hometown)}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <HometownsFilter
                    selectedHometown={filters.location.hometown}
                    selectedTown={filters.location.town}
                    selectedCity={filters.location.city}
                    onSelect={(hometownId: string) => handleLocationSelect({
                      ...filters.location,
                      hometown: hometownId
                    })}
                  />
                </div>
              </div>
            )}

            {/* Extra Filters */}
            {visibleSections.includes(5) && activeLayer >= 5 && (
              <div>
                {renderSectionHeader('Additional Filters', 
                  filters.extraFilters.minRating > 0 || 
                  filters.extraFilters.priceRange[0] > 0 || 
                  filters.extraFilters.priceRange[1] < 1000 || 
                  filters.extraFilters.femaleOnly
                )}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <ExtraFilters
                    filters={filters.extraFilters}
                    onChange={handleExtraFiltersChange}
                  />
                </div>
              </div>
            )}
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

      {/* Mobile Filter Overlay */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">Filter Tutors</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
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