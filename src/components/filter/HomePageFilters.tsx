import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Filter, Star, DollarSign, MapPin, Users, Sparkles } from 'lucide-react';
import { useSubjects } from '../../contexts/SubjectContext';

export interface HomePageFilterState {
  subject: string;
  topic: string;
  teachingMode: string;
  location: string;
  femaleOnly: boolean;
  verified: boolean;
}

interface HomePageFiltersProps {
  onFilterChange: (filters: HomePageFilterState) => void;
  urlSubject?: string | null;
  urlTopic?: string | null;
}

const initialFilterState: HomePageFilterState = {
  subject: '',
  topic: '',
  teachingMode: '',
  location: '',
  femaleOnly: false,
  verified: true
};

const HomePageFilters: React.FC<HomePageFiltersProps> = ({ 
  onFilterChange, 
  urlSubject, 
  urlTopic 
}) => {
  const { subjects, topics, fetchTopics, getTopicsBySubject } = useSubjects();
  const [filters, setFilters] = useState<HomePageFilterState>(initialFilterState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (urlSubject) {
      const subject = subjects.find(s => s.name === urlSubject);
      if (subject) {
        setFilters(prev => ({ ...prev, subject: subject._id }));
      }
    }
    if (urlTopic) {
      setFilters(prev => ({ ...prev, topic: urlTopic }));
    }
  }, [urlSubject, urlTopic, subjects]);

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
    setFilters(updatedFilters);
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

  const handleLocationChange = useCallback((location: string) => {
    handleFilterChange({ location });
  }, [handleFilterChange]);

  const handleFemaleOnlyChange = useCallback((femaleOnly: boolean) => {
    handleFilterChange({ femaleOnly });
  }, [handleFilterChange]);

  const handleVerifiedChange = useCallback((verified: boolean) => {
    handleFilterChange({ verified });
  }, [handleFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilterState);
    onFilterChange(initialFilterState);
  }, [onFilterChange]);

  const hasActiveFilters = 
    filters.subject || 
    filters.topic || 
    filters.teachingMode ||
    filters.location ||
    filters.femaleOnly ||
    !filters.verified;



  const teachingModes = [
    { value: '', label: 'Any Mode' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'INDIVIDUAL', label: 'Home Visit' }
  ];

  const locations = [
    { value: '', label: 'Any Location' },
    { value: 'Colombo', label: 'Colombo' },
    { value: 'Kandy', label: 'Kandy' },
    { value: 'Galle', label: 'Galle' },
    { value: 'Jaffna', label: 'Jaffna' },
    { value: 'Anuradhapura', label: 'Anuradhapura' }
  ];



  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors px-2 py-1 rounded hover:bg-gray-50"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>

        </div>
      </div>

      {/* Subject and Topic Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Subject Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Topic
          </label>
          <select
            value={filters.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4">


          {/* Teaching Mode Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Users className="h-3 w-3 inline mr-1" />
              Teaching Mode
            </label>
            <div className="flex flex-wrap gap-2">
              {teachingModes.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTeachingModeChange(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    filters.teachingMode === option.value
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <MapPin className="h-3 w-3 inline mr-1" />
              Location
            </label>
            <div className="flex flex-wrap gap-2">
              {locations.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLocationChange(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    filters.location === option.value
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Female Only */}
            <button
              onClick={() => handleFemaleOnlyChange(!filters.femaleOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border transition-all ${
                filters.femaleOnly
                  ? 'bg-pink-100 text-pink-700 border-pink-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Female Tutors Only
            </button>

            {/* Verified Only */}
            <button
              onClick={() => handleVerifiedChange(!filters.verified)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border transition-all ${
                filters.verified
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Verified Only
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedSubject && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <span>Subject: {selectedSubject.name}</span>
                <button
                  onClick={() => handleSubjectChange('')}
                  className="ml-1 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedTopic && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <span>Topic: {selectedTopic.name}</span>
                <button
                  onClick={() => handleTopicChange('')}
                  className="ml-1 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {filters.teachingMode && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                <span>Mode: {filters.teachingMode}</span>
                <button
                  onClick={() => handleTeachingModeChange('')}
                  className="ml-1 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.location && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                <span>Location: {filters.location}</span>
                <button
                  onClick={() => handleLocationChange('')}
                  className="ml-1 hover:text-indigo-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.femaleOnly && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                <span>Female Only</span>
                <button
                  onClick={() => handleFemaleOnlyChange(false)}
                  className="ml-1 hover:text-pink-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {!filters.verified && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                <span>All Tutors</span>
                <button
                  onClick={() => handleVerifiedChange(true)}
                  className="ml-1 hover:text-orange-800"
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