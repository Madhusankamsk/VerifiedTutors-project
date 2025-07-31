import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Filter, Star, DollarSign, Users, Sparkles } from 'lucide-react';
import { useSubjects } from '../../contexts/SubjectContext';

export interface HomePageFilterState {
  subject: string; // Subject ID
  topic: string; // Topic name (not ID)
  teachingMode: string;
  femaleOnly: boolean;
  verified: boolean;
}

interface HomePageFiltersProps {
  onFilterChange: (filters: HomePageFilterState) => void;
  filters: HomePageFilterState;
  urlSubject?: string | null;
  urlTopic?: string | null;
}

const initialFilterState: HomePageFilterState = {
  subject: '',
  topic: '',
  teachingMode: '',
  femaleOnly: false,
  verified: true
};

const HomePageFilters: React.FC<HomePageFiltersProps> = ({ 
  onFilterChange, 
  filters,
  urlSubject, 
  urlTopic 
}) => {
  const { subjects, topics, fetchTopics, getTopicsBySubject } = useSubjects();
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);

  // Initialize filters from URL parameters - this is now handled by the parent component
  useEffect(() => {
    if (urlSubject) {
      const subject = subjects.find(s => s.name === urlSubject);
      if (subject && !filters.subject) {
        onFilterChange({ ...filters, subject: subject._id });
      }
    }
    if (urlTopic && !filters.topic) {
      onFilterChange({ ...filters, topic: urlTopic });
    }
  }, [urlSubject, urlTopic, subjects, filters, onFilterChange]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (filters.subject) {
      fetchTopics(filters.subject);
    } else {
      setAvailableTopics([]);
    }
  }, [filters.subject, fetchTopics]);

  // Update available topics when topics change
  useEffect(() => {
    if (filters.subject) {
      const subjectTopics = getTopicsBySubject(filters.subject);
      setAvailableTopics(subjectTopics);
    } else {
      setAvailableTopics([]);
    }
  }, [topics, filters.subject, getTopicsBySubject]);

  // Memoize selected subject and topic to prevent unnecessary re-renders
  const selectedSubject = useMemo(() => 
    subjects.find(s => s._id === filters.subject), 
    [subjects, filters.subject]
  );
  
  const selectedTopic = useMemo(() => 
    availableTopics.find(t => t.name === filters.topic), 
    [availableTopics, filters.topic]
  );

  const handleFilterChange = useCallback((newFilters: Partial<HomePageFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    onFilterChange(updatedFilters);
  }, [filters, onFilterChange]);

  const handleSubjectChange = useCallback((subjectId: string) => {
    const subject = subjects.find(s => s._id === subjectId);
    handleFilterChange({ 
      subject: subjectId, 
      topic: '' // Clear topic when subject changes
    });
  }, [subjects, handleFilterChange]);

  const handleTopicChange = useCallback((topicName: string) => {
    handleFilterChange({ topic: topicName });
  }, [handleFilterChange]);

  const handleTeachingModeChange = useCallback((mode: string) => {
    handleFilterChange({ teachingMode: mode });
  }, [handleFilterChange]);

  const handleFemaleOnlyChange = useCallback((femaleOnly: boolean) => {
    handleFilterChange({ femaleOnly });
  }, [handleFilterChange]);

  const handleVerifiedChange = useCallback((verified: boolean) => {
    handleFilterChange({ verified });
  }, [handleFilterChange]);

  const clearFilters = useCallback(() => {
    onFilterChange(initialFilterState);
  }, [onFilterChange]);

  const hasActiveFilters = 
    filters.subject || 
    filters.topic || 
    filters.teachingMode ||
    filters.femaleOnly ||
    !filters.verified;

  const teachingModes = [
    { value: '', label: 'Any Mode' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'INDIVIDUAL', label: 'Home Visit' }
  ];


  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-md border border-gray-200/60">
      {/* Header - Improved Mobile Spacing */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {/* Subject and Topic Dropdowns - Single Row on Desktop, 2 Rows on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* Subject Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Select a Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Topic
          </label>
          <select
            value={filters.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            disabled={!filters.subject}
          >
            <option value="">All Topics</option>
            {availableTopics.map((topic) => (
              <option key={topic._id} value={topic.name}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Bubbles - Expandable */}
      {isExpanded && (
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
        {/* Teaching Mode Bubbles */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            <Users className="h-3 w-3 inline mr-1" />
            Teaching Mode
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {teachingModes.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTeachingModeChange(option.value)}
                className={`px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 font-medium ${
                  filters.teachingMode === option.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700 hover:border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Filter Bubbles */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {/* Female Only */}
          <button
            onClick={() => handleFemaleOnlyChange(!filters.femaleOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full border transition-all ${
              filters.femaleOnly
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500 shadow-md shadow-pink-200 transform scale-105'
                : 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border-pink-200 hover:from-pink-100 hover:to-pink-200 hover:border-pink-300 hover:shadow-md hover:shadow-pink-100 hover:scale-105'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Female Only
          </button>

          {/* Verified Only */}
          {/* <button
            onClick={() => handleVerifiedChange(!filters.verified)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full border transition-all ${
              filters.verified
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-md shadow-green-200 transform scale-105'
                : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-md hover:shadow-green-100 hover:scale-105'
            }`}
          >
            <Star className="h-3 w-3" />
            Verified Only
          </button> */}
        </div>
      </div>
      )}

      {/* Active Filters Display - Improved Mobile Layout */}
      {hasActiveFilters && (
        <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-1.5">
            {selectedSubject && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span className="truncate max-w-24 sm:max-w-32">{selectedSubject.name}</span>
                <button
                  onClick={() => handleSubjectChange('')}
                  className="ml-1 hover:text-blue-800 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedTopic && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span className="truncate max-w-24 sm:max-w-32">{selectedTopic.name}</span>
                <button
                  onClick={() => handleTopicChange('')}
                  className="ml-1 hover:text-blue-800 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.teachingMode && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span className="truncate max-w-20 sm:max-w-24">{filters.teachingMode}</span>
                <button
                  onClick={() => handleTeachingModeChange('')}
                  className="ml-1 hover:text-blue-800 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.femaleOnly && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-md text-xs">
                <span>Female Only</span>
                <button
                  onClick={() => handleFemaleOnlyChange(false)}
                  className="ml-1 hover:text-pink-800 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {!filters.verified && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs">
                <span>All Tutors</span>
                <button
                  onClick={() => handleVerifiedChange(true)}
                  className="ml-1 hover:text-orange-800 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageFilters; 