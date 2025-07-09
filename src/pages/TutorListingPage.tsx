import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import SimplifiedTutorFilters, { SimplifiedFilterState } from '../components/filter/SimplifiedTutorFilters';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, Star, Sparkles, Search, Filter } from 'lucide-react';
import {
  BreadcrumbNav,
  PageHeader,
  ResultsHeader,
  TutorGrid,
  EmptyState,
  ErrorState,
  BackgroundDecorations
} from '../components/tutor-listing';

interface Filters {
  selectedSubject: string | null;
  selectedTopic: string | null;
  rating: number;
  price: { min: number; max: number };
  location: string;
  teachingMode: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  availability: string;
  experience: string;
  search: string;
  femaleOnly: boolean;
}

const TutorListingPage: React.FC = () => {
  const { searchTutors } = useTutor();
  const { subjects } = useSubjects();
  const [searchParams] = useSearchParams();
  
  // Get subject and topic from URL parameters
  const urlSubject = searchParams.get('subject');
  const urlTopic = searchParams.get('topic');
  
  // State for subject tutor counts
  const [subjectTutorCounts, setSubjectTutorCounts] = useState<{[key: string]: number}>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  
  // Subject icons mapping for visual variety
  const getSubjectIcon = (subjectName: string) => {
    const icons = {
      'Mathematics': '🔢',
      'Physics': '⚡',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'English': '📚',
      'Sinhala': '🇱🇰',
      'History': '📜',
      'Geography': '🌍',
      'Computer Science': '💻',
      'Economics': '💰',
      'Business Studies': '🏢',
      'Accounting': '📊',
      'Literature': '📖',
      'Art': '🎨',
      'Music': '🎵',
      'Physical Education': '⚽',
      'Religious Studies': '🙏',
      'Agriculture': '🌾',
      'Technology': '🔧',
      'Psychology': '🧠'
    };
    
    return icons[subjectName as keyof typeof icons] || '📚';
  };
  
  const [filters, setFilters] = useState<Filters>({
    selectedSubject: null,
    selectedTopic: null,
    rating: 0,
    price: { min: 0, max: 10000 },
    location: '',
    teachingMode: '',
    page: 1,
    limit: 24,
    sortBy: 'rating',
    sortOrder: 'desc',
    availability: 'all',
    experience: 'all',
    search: '',
    femaleOnly: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [topicName, setTopicName] = useState<string>('');

  // Set subject and topic from URL parameters on component mount
  useEffect(() => {
    if (urlSubject) {
      const subject = subjects.find(s => s.name === urlSubject);
      if (subject) {
        setFilters(prev => ({ ...prev, selectedSubject: subject._id }));
      }
    }
  }, [urlSubject, subjects]);

  // Set topic from URL parameters
  useEffect(() => {
    if (urlTopic && filters.selectedSubject) {
      // Fetch topics for the subject and find the matching topic
      const fetchTopicId = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/subject/${filters.selectedSubject}`);
          if (response.ok) {
            const topics = await response.json();
            const topic = topics.find((t: any) => t.name === urlTopic);
            if (topic) {
              setFilters(prev => ({ ...prev, selectedTopic: topic._id }));
              setTopicName(topic.name);
            }
          }
        } catch (error) {
          console.error('Error fetching topic:', error);
        }
      };
      fetchTopicId();
    }
  }, [urlTopic, filters.selectedSubject]);

  // Fetch tutor counts for all subjects
  useEffect(() => {
    const fetchTutorCounts = async () => {
      if (subjects && subjects.length > 0) {
        try {
          setLoadingCounts(true);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects/tutor-counts`);
          if (response.ok) {
            const counts = await response.json();
            const countsMap: {[key: string]: number} = {};
            counts.forEach((item: any) => {
              countsMap[item.subjectId] = item.tutorCount;
            });
            setSubjectTutorCounts(countsMap);
          }
        } catch (error) {
          console.error('Error fetching tutor counts:', error);
        } finally {
          setLoadingCounts(false);
        }
      }
    };

    fetchTutorCounts();
  }, [subjects]);

  // Scroll to top when filters change (but not for load more)
  useScrollToTop([filters.selectedSubject, filters.selectedTopic, filters.rating, filters.price, filters.location, 
                  filters.teachingMode, filters.sortBy, filters.sortOrder, 
                  filters.availability, filters.experience, filters.search]);

  const fetchTutors = useCallback(async (isLoadMore = false, targetPage?: number) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log(`fetchTutors called with isLoadMore=${isLoadMore}, targetPage=${targetPage}`);
      console.log('Current filters:', filters);
      console.log('Search parameter:', filters.search);
      
      // Build search parameters for the new filtering system
      const searchParams: any = {
        ...filters
      };

      // Use target page if provided, otherwise use current page
      if (targetPage !== undefined) {
        searchParams.page = targetPage;
      }

      // Apply subject and topic filters from URL parameters or dropdown filters
      if (urlSubject) {
        searchParams.subject = urlSubject;
      } else if (filters.selectedSubject) {
        // Convert subject ID to subject name for the API
        const subject = subjects.find(s => s._id === filters.selectedSubject);
        if (subject) {
          searchParams.subject = subject.name;
        }
      }

      if (urlTopic) {
        searchParams.topic = urlTopic;
      } else if (filters.selectedTopic) {
        // Convert topic ID to topic name for the API
        const fetchTopicName = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/subject/${filters.selectedSubject}`);
            if (response.ok) {
              const topics = await response.json();
              const topic = topics.find((t: any) => t._id === filters.selectedTopic);
              if (topic) {
                searchParams.topic = topic.name;
              }
            }
          } catch (error) {
            console.error('Error fetching topic name:', error);
          }
        };
        
        if (filters.selectedSubject) {
          await fetchTopicName();
        }
      }

      // Call the search API
      const response = await searchTutors(searchParams);
      
      console.log('Search tutors response:', response);
      
      const newTutors = response.tutors || [];
      const pagination = response.pagination || {};
      
      console.log('New tutors count:', newTutors.length);
      console.log('Pagination info:', pagination);
      
      if (isLoadMore) {
        setTutors(prev => [...prev, ...newTutors]);
      } else {
        setTutors(newTutors);
      }
      
      setTotalPages(pagination.pages || 1);
      setTotalTutors(pagination.total || 0);
      setHasMore(pagination.page < pagination.pages);
      
      // Update active filters for display
      const activeFiltersArray = [];
      if (filters.selectedSubject) activeFiltersArray.push('subject');
      if (filters.selectedTopic) activeFiltersArray.push('topic');
      if (filters.rating > 0) activeFiltersArray.push('rating');
      if (filters.price.min > 0 || filters.price.max < 10000) activeFiltersArray.push('price');
      if (filters.location) activeFiltersArray.push('location');
      if (filters.teachingMode) activeFiltersArray.push('teachingMode');
      if (filters.availability !== 'all') activeFiltersArray.push('availability');
      if (filters.experience !== 'all') activeFiltersArray.push('experience');
      if (filters.search) activeFiltersArray.push('search');
      if (filters.femaleOnly) activeFiltersArray.push('femaleOnly');
      
      setActiveFilters(activeFiltersArray);
    } catch (err: any) {
      console.error('Error in fetchTutors:', err);
      setError(err.message || 'An error occurred while fetching tutors');
      setTutors([]);
      setTotalTutors(0);
      setHasMore(false);
    } finally {
      setLoading(false);
        setLoadingMore(false);
    }
  }, [filters, searchTutors, urlSubject, urlTopic, subjects]);

  // Fetch tutors when component mounts or filters change
  useEffect(() => {
    fetchTutors(false);
  }, [fetchTutors]);

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          console.log('Loading more tutors...');
          setFilters(prev => ({ ...prev, page: prev.page + 1 }));
          fetchTutors(true, filters.page + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchTutors, filters.page]);

  const handleFilterChange = (newFilters: SimplifiedFilterState) => {
    console.log('Filter change received:', newFilters);
    
    setFilters(prev => {
      const updated = {
        ...prev,
        selectedSubject: newFilters.selectedSubject || null,
        selectedTopic: newFilters.selectedTopic || null,
        rating: newFilters.extraFilters.minRating,
        price: {
          min: newFilters.extraFilters.priceRange[0],
          max: newFilters.extraFilters.priceRange[1]
        },
        location: newFilters.location,
        teachingMode: newFilters.teachingMode,
        femaleOnly: newFilters.extraFilters.femaleOnly,
        page: 1 // Reset to first page when filters change
      };
      
      console.log('Updated filters:', updated);
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters(prev => ({
      ...prev,
      selectedSubject: null,
      selectedTopic: null,
      rating: 0,
      price: { min: 0, max: 10000 },
      location: '',
      teachingMode: '',
      availability: 'all',
      experience: 'all',
      search: '',
      femaleOnly: false,
      page: 1
    }));
    setSearchQuery('');
  };

  const handleSearchSubmit = () => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      page: 1
    }));
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setFilters(prev => ({
      ...prev,
      search: '',
      page: 1
    }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1
    }));
  };

  // Fetch topic name when topic filter changes
  useEffect(() => {
      const fetchTopicName = async () => {
      if (filters.selectedTopic && filters.selectedSubject) {
      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/subject/${filters.selectedSubject}`);
        if (response.ok) {
            const topics = await response.json();
            const topic = topics.find((t: any) => t._id === filters.selectedTopic);
            if (topic) {
              setTopicName(topic.name);
            }
        }
      } catch (error) {
        console.error('Error fetching topic name:', error);
        }
      } else {
        setTopicName('');
      }
      };

      fetchTopicName();
  }, [filters.selectedTopic, filters.selectedSubject]);

  // Reset topic name when topic filter is cleared
  useEffect(() => {
    if (!filters.selectedTopic) {
      setTopicName('');
    }
  }, [filters.selectedTopic]);

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchTutors(false)} />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-8000"></div>

      {/* Main Content - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        {/* Compact Header with Search and Filters */}
        <div className="mb-4 sm:mb-6">
          {/* Header with Integrated Search - Mobile First */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {urlSubject && urlTopic ? `${urlSubject} - ${urlTopic}` : 
                 urlSubject ? `${urlSubject}` : 
                 "All Tutors"}
              </h1>
              {urlSubject && urlTopic && (
                <p className="text-sm text-gray-600 mt-1">
                  Tutors specializing in {urlTopic}
                </p>
              )}
            </div>
            
            {/* Search Bar - Responsive Design */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-sky-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                  <div className="pl-4 pr-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tutors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="flex-1 py-2.5 px-2 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm min-w-0 w-full lg:w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleSearchClear}
                      className="px-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={handleSearchSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2.5 rounded-full transition-colors duration-200 font-medium text-sm ml-1 mr-1"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <Search className="h-4 w-4 sm:hidden" />
                  </button>
                </div>
              </div>
            </div>
          </div>

           {/* Filters Section - Mobile Responsive */}
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100">
             <div className="flex items-center gap-2 mb-3 sm:mb-4">
               <Filter className="h-4 w-4 text-blue-600" />
               <span className="text-sm font-medium text-gray-900">Filters</span>
               {activeFilters.length > 0 && (
                 <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                   {activeFilters.length}
                 </span>
               )}
             </div>
          <SimplifiedTutorFilters 
            onFilterChange={handleFilterChange} 
            urlSubject={urlSubject}
            urlTopic={urlTopic}
          />
           </div>
        </div>

        <ResultsHeader
          loading={loading}
          tutorCount={tutors.length}
          activeFiltersCount={activeFilters.length}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
        />

        {!loading && tutors.length === 0 ? (
          <EmptyState onResetFilters={resetFilters} />
        ) : (
          <>
            <TutorGrid
              tutors={tutors}
              loading={loading}
            />
            
            {/* Infinite scroll observer target */}
            {hasMore && (
              <div 
                ref={observerTarget}
                className="h-16 flex items-center justify-center"
              >
                {loadingMore && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-gray-600 font-medium">Loading more tutors...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Other Subjects Section - Mobile Responsive */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-50/80 backdrop-blur-sm rounded-full text-blue-600 text-sm font-medium mb-4 border border-blue-100">
              <BookOpen className="h-4 w-4 mr-2" />
              Explore More
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Explore Other Subjects
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Find tutors for different subjects and topics across our platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {subjects.slice(0, 12).map((subject, index) => {
              const colors = [
                'from-blue-100/80 to-blue-200/80 border-blue-200/50',
                'from-sky-100/80 to-sky-200/80 border-sky-200/50',
                'from-indigo-100/80 to-indigo-200/80 border-indigo-200/50',
                'from-cyan-100/80 to-cyan-200/80 border-cyan-200/50',
                'from-blue-50/80 to-blue-100/80 border-blue-100/50',
                'from-slate-100/80 to-slate-200/80 border-slate-200/50'
              ];
              
              return (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                  className="group relative overflow-hidden"
                >
                  <div className={`
                    relative bg-gradient-to-br ${colors[index % colors.length]} 
                    backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[140px] sm:min-h-[180px] flex flex-col
                    border transition-all duration-500 ease-out
                    hover:shadow-xl hover:shadow-blue-500/10 
                    hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105
                    transform perspective-1000
                  `}>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                    
                    {/* Subject Icon */}
                    <div className="text-center mb-3 sm:mb-4 relative z-10">
                      <div className="text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                  {getSubjectIcon(subject.name)}
                </div>
                    </div>

                    {/* Subject Info */}
                    <div className="text-center relative z-10 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base mb-2 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
                  {subject.name}
                </h3>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1 sm:mb-2">
                          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-700 font-medium">
                              {subjectTutorCounts[subject._id] || 0}
                  </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                          tutors available
                        </p>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-sm">
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                    </div>
                </div>
              </Link>
              );
            })}
          </div>
          
          <div className="text-center px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg font-medium text-sm sm:text-base"
            >
              Browse All Subjects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Featured Tutors Section - Mobile Responsive */}
        {tutors.length > 0 && (
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-50/80 backdrop-blur-sm rounded-full text-blue-600 text-sm font-medium mb-4 border border-blue-100">
                <Star className="h-4 w-4 mr-2" />
                Top Rated
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Featured Tutors
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Discover top-rated tutors across all subjects
              </p>
          </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {tutors.slice(0, 6).map((tutor) => (
                <div key={tutor._id} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {tutor.user.profileImage ? (
                      <img 
                        src={tutor.user.profileImage} 
                        alt={tutor.user.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                      />
                    ) : (
                        <span className="text-blue-600 font-semibold text-lg sm:text-xl">
                        {tutor.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-blue-700 transition-colors duration-300">
                      {tutor.user.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-600">
                        {tutor.rating.toFixed(1)} ({tutor.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm text-blue-600 font-medium">
                        {tutor.totalStudents} students
                      </span>
                    </div>
                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div className="mt-2">
                          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {tutor.subjects[0].subject.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/tutors/${tutor._id}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 sm:p-2 hover:bg-blue-50 rounded-full flex-shrink-0"
                  >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
            <div className="text-center px-4">
            <Link
              to="/tutors"
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-6 sm:px-8 py-3 rounded-2xl hover:bg-white transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg font-medium border border-gray-200 text-sm sm:text-base"
            >
              View All Tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default TutorListingPage;