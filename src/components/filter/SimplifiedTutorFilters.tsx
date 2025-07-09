import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSubjects } from '../../contexts/SubjectContext';
import TeachingModeFilter from './TeachingModeFilter';
import LocationFilter from './LocationFilter';
import { X, Filter, ChevronDown } from 'lucide-react';

export interface SimplifiedFilterState {
  teachingMode: string;
  location: string;
  selectedSubject: string;
  selectedTopic: string;
  extraFilters: {
    minRating: number;
    priceRange: [number, number];
    femaleOnly: boolean;
  };
}

interface SimplifiedTutorFiltersProps {
  onFilterChange: (filters: SimplifiedFilterState) => void;
  urlSubject?: string | null;
  urlTopic?: string | null;
}

const initialFilterState: SimplifiedFilterState = {
  teachingMode: '',
  location: '',
  selectedSubject: '',
  selectedTopic: '',
  extraFilters: {
    minRating: 0,
    priceRange: [0, 1000],
    femaleOnly: false
  }
};

const SimplifiedTutorFilters: React.FC<SimplifiedTutorFiltersProps> = ({ 
  onFilterChange, 
  urlSubject, 
  urlTopic 
}) => {
  const { subjects, topics, fetchTopics, getTopicsBySubject } = useSubjects();
  const [filters, setFilters] = useState<SimplifiedFilterState>(initialFilterState);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (filters.selectedSubject) {
      fetchTopics(filters.selectedSubject);
    } else {
      setAvailableTopics([]);
    }
  }, [filters.selectedSubject, fetchTopics]);

  // Update available topics when topics change
  useEffect(() => {
    if (filters.selectedSubject) {
      const subjectTopics = getTopicsBySubject(filters.selectedSubject);
      setAvailableTopics(subjectTopics);
    } else {
      setAvailableTopics([]);
    }
  }, [topics, filters.selectedSubject, getTopicsBySubject]);

  // Clear topic when subject changes
  useEffect(() => {
    if (filters.selectedSubject) {
      // Only clear topic if it's not compatible with the new subject
      const subjectTopics = getTopicsBySubject(filters.selectedSubject);
      const topicExists = subjectTopics.some(topic => topic._id === filters.selectedTopic);
      if (!topicExists && filters.selectedTopic) {
        const newFilters = { ...filters, selectedTopic: '' };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }
    } else {
      if (filters.selectedTopic) {
        const newFilters = { ...filters, selectedTopic: '' };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }
    }
  }, [filters.selectedSubject]);

  const handleSubjectSelect = (subjectId: string) => {
    const newFilters = { ...filters, selectedSubject: subjectId, selectedTopic: '' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTopicSelect = (topicId: string) => {
    const newFilters = { ...filters, selectedTopic: topicId };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTeachingModeSelect = (mode: string) => {
    const newMode = mode || '';
    const newFilters = { ...filters, teachingMode: newMode };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationSelect = (location: SimplifiedFilterState['location']) => {
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
    console.log("Clearing all filters in SimplifiedTutorFilters component");
    
    // Clear all local state
    setFilters(initialFilterState);
    setIsMobileFiltersOpen(false);
    
    // Notify parent component to clear all filters
    onFilterChange(initialFilterState);
  };

  const renderFilterTags = () => {
    const tags = [];

    if (filters.selectedSubject) {
      const subject = subjects.find(s => s._id === filters.selectedSubject);
      if (subject) {
        tags.push({
          key: 'subject',
          label: `Subject: ${subject.name}`,
          onRemove: () => handleSubjectSelect('')
        });
      }
    }

    if (filters.selectedTopic) {
      const topic = availableTopics.find(t => t._id === filters.selectedTopic);
      if (topic) {
        tags.push({
          key: 'topic',
          label: `Topic: ${topic.name}`,
          onRemove: () => handleTopicSelect('')
        });
      }
    }

    if (filters.extraFilters.femaleOnly) {
      tags.push({
        key: 'gender',
        label: 'Female Tutors Only',
        onRemove: () => handleFemaleOnlyChange(false)
      });
    }

    if (filters.location) {
      tags.push({
        key: 'location',
        label: filters.location,
        onRemove: () => handleLocationSelect('')
      });
    }

    if (filters.teachingMode) {
      tags.push({
        key: 'teachingMode',
        label: filters.teachingMode,
        onRemove: () => handleTeachingModeSelect('')
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
    filters.selectedSubject ||
    filters.selectedTopic ||
    filters.extraFilters.femaleOnly;

  const hasNoUrlFilters = !urlSubject && !urlTopic;

  const teachingModes = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'INDIVIDUAL', label: 'Home Visit' },
  ];

  return (
    <>
      {/* Desktop Filters - Compact Design */}
      <div className="hidden lg:block">
        {/* URL Parameters Display - Only show when URL parameters are present */}
        {(urlSubject || urlTopic) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-medium text-blue-700">Selected Subject & Topic</h3>
              <Link
                to="/tutors"
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors font-medium"
              >
                All Tutors
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {urlSubject && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  <span>Subject: {urlSubject}</span>
                </div>
              )}
              {urlTopic && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  <span>Topic: {urlTopic}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subject and Topic Dropdowns - Show when no URL filters or when active filters exist */}
        {(hasNoUrlFilters || hasActiveFilters) && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-medium text-gray-700">Select Subject & Topic</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Subject Dropdown */}
              <div className="relative">
                <select
                  value={filters.selectedSubject}
                  onChange={(e) => handleSubjectSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Topic Dropdown */}
              <div className="relative">
                <select
                  value={filters.selectedTopic}
                  onChange={(e) => handleTopicSelect(e.target.value)}
                  disabled={!filters.selectedSubject || availableTopics.length === 0}
                  className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    !filters.selectedSubject || availableTopics.length === 0
                      ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                      : 'cursor-pointer'
                  }`}
                >
                  <option value="">Select Topic</option>
                  {availableTopics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-medium text-gray-700">Active Filters</h3>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
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
              {/* URL Parameters Display - Only show when URL parameters are present */}
              {(urlSubject || urlTopic) && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-700">Selected Subject & Topic</h3>
                    <Link
                      to="/tutors"
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      All Tutors
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {urlSubject && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        <span>Subject: {urlSubject}</span>
                      </div>
                    )}
                    {urlTopic && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        <span>Topic: {urlTopic}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subject and Topic Dropdowns - Mobile */}
              {(hasNoUrlFilters || hasActiveFilters) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Select Subject & Topic</h3>
                  
                  {/* Subject Dropdown */}
                  <div className="relative">
                    <select
                      value={filters.selectedSubject}
                      onChange={(e) => handleSubjectSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Topic Dropdown */}
                  <div className="relative">
                    <select
                      value={filters.selectedTopic}
                      onChange={(e) => handleTopicSelect(e.target.value)}
                      disabled={!filters.selectedSubject || availableTopics.length === 0}
                      className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                        !filters.selectedSubject || availableTopics.length === 0
                          ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                          : 'cursor-pointer'
                      }`}
                    >
                      <option value="">Select Topic</option>
                      {availableTopics.map((topic) => (
                        <option key={topic._id} value={topic._id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Active Filter Tags */}
              {hasActiveFilters && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-medium text-gray-700">Active Filters</h3>
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
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

              {/* Teaching Mode Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Teaching Mode</h3>
                <div className="flex flex-wrap gap-2">
                  {teachingModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => handleTeachingModeSelect(mode.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                        filters.teachingMode === mode.value
                          ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Female Tutors Only */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Gender Preference</h3>
                <button
                  onClick={() => handleFemaleOnlyChange(!filters.extraFilters.femaleOnly)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                    filters.extraFilters.femaleOnly
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Female Tutors Only
                </button>
              </div>

              {/* Location - Show only when not online */}
              {filters.teachingMode && filters.teachingMode !== 'ONLINE' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
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

export default SimplifiedTutorFilters; 