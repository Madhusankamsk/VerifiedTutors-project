import React, { useState } from 'react';
import EducationLevelFilter from './EducationLevelFilter';
import SubjectFilter from './SubjectFilter';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import ExtraFilters from './ExtraFilters';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);

  const toggleSection = (layer: number) => {
    setExpandedSections(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    );
  };

  const handleEducationLevelSelect = (level: string) => {
    setFilters(prev => ({ ...prev, educationLevel: level }));
    setActiveLayer(2);
    onFilterChange({ ...filters, educationLevel: level });
    // Collapse education level section after selection
    setExpandedSections(prev => prev.filter(l => l !== 1));
  };

  const handleSubjectSelect = (subjects: string[]) => {
    setFilters(prev => ({ ...prev, subjects }));
    setActiveLayer(3);
    onFilterChange({ ...filters, subjects });
    // Collapse subject section after selection
    setExpandedSections(prev => prev.filter(l => l !== 2));
  };

  const handleTeachingModeSelect = (mode: string) => {
    setFilters(prev => ({ ...prev, teachingMode: mode }));
    if (mode === 'ONLINE') {
      setActiveLayer(5); // Skip location layer for online mode
    } else {
      setActiveLayer(4);
    }
    onFilterChange({ ...filters, teachingMode: mode });
    // Collapse teaching mode section after selection
    setExpandedSections(prev => prev.filter(l => l !== 3));
  };

  const handleLocationSelect = (location: FilterState['location']) => {
    setFilters(prev => ({ ...prev, location }));
    setActiveLayer(5);
    onFilterChange({ ...filters, location });
    // Collapse location section after selection
    setExpandedSections(prev => prev.filter(l => l !== 4));
  };

  const handleExtraFiltersChange = (extraFilters: FilterState['extraFilters']) => {
    setFilters(prev => ({ ...prev, extraFilters }));
    onFilterChange({ ...filters, extraFilters });
  };

  const renderSectionHeader = (layer: number, title: string) => (
    <div 
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => toggleSection(layer)}
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      {expandedSections.includes(layer) ? (
        <ChevronUp className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-500" />
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Filter Tutors</h2>
      
      {/* Education Level Section */}
      {activeLayer >= 1 && (
        <div className="border rounded-lg overflow-hidden">
          {renderSectionHeader(1, 'Education Level')}
          {expandedSections.includes(1) && (
            <div className="p-4">
              <EducationLevelFilter
                selectedLevel={filters.educationLevel}
                onSelect={handleEducationLevelSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Subject Section */}
      {activeLayer >= 2 && filters.educationLevel && (
        <div className="border rounded-lg overflow-hidden">
          {renderSectionHeader(2, 'Subjects')}
          {expandedSections.includes(2) && (
            <div className="p-4">
              <SubjectFilter
                selectedSubjects={filters.subjects}
                onSelect={handleSubjectSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Teaching Mode Section */}
      {activeLayer >= 3 && filters.subjects.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          {renderSectionHeader(3, 'Teaching Mode')}
          {expandedSections.includes(3) && (
            <div className="p-4">
              <TeachingModeFilter
                selectedMode={filters.teachingMode}
                onSelect={handleTeachingModeSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Location Section */}
      {activeLayer >= 4 && filters.teachingMode === 'OFFLINE' && (
        <div className="border rounded-lg overflow-hidden">
          {renderSectionHeader(4, 'Location')}
          {expandedSections.includes(4) && (
            <div className="p-4">
              <LocationFilter
                selectedLocation={filters.location}
                onSelect={handleLocationSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Extra Filters Section */}
      {activeLayer >= 5 && (
        <div className="border rounded-lg overflow-hidden">
          {renderSectionHeader(5, 'Additional Filters')}
          {expandedSections.includes(5) && (
            <div className="p-4">
              <ExtraFilters
                filters={filters.extraFilters}
                onChange={handleExtraFiltersChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TutorFilters; 