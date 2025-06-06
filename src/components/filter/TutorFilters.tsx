import React, { useState } from 'react';
import EducationLevelFilter from './EducationLevelFilter';
import SubjectFilter from './SubjectFilter';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import ExtraFilters from './ExtraFilters';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';

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
      setVisibleSections([4, 5]); // Skip location for online mode
    } else {
      setVisibleSections([4, 5]); // Show location and extra filters
    }
  };

  const handleLocationSelect = (location: FilterState['location']) => {
    setFilters(prev => ({ ...prev, location }));
    setActiveLayer(5);
    onFilterChange({ ...filters, location });
    setVisibleSections([5]); // Show only extra filters
  };

  const handleExtraFiltersChange = (extraFilters: FilterState['extraFilters']) => {
    setFilters(prev => ({ ...prev, extraFilters }));
    onFilterChange({ ...filters, extraFilters });
  };

  const renderSectionHeader = (layer: number, title: string, icon?: React.ReactNode) => (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
    </div>
  );

  const renderFilterContent = () => (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Filter Tutors</h2>
        <button
          onClick={() => {
            setFilters(initialFilterState);
            setActiveLayer(1);
            setVisibleSections([1, 2]);
          }}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear All
        </button>
      </div>
      
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
      {visibleSections.includes(5) && activeLayer >= 5 && filters.teachingMode && (
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

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
      >
        <Filter className="h-5 w-5" />
        Filters
      </button>

      {/* Mobile Filter Overlay */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filter Tutors</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {renderFilterContent()}
          </div>
        </div>
      )}

      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block">
        {renderFilterContent()}
      </div>
    </>
  );
};

export default TutorFilters; 