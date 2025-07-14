import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, ArrowRight, Star, Sparkles, Search } from 'lucide-react';
import {
  TutorGrid,
  EmptyState,
  ErrorState
} from '../components/tutor-listing';
import HomePageFilters, { HomePageFilterState } from '../components/filter/HomePageFilters';
import TutorSorting from '../components/filter/TutorSorting';

const TutorListingPage: React.FC = () => {
  const { searchTutors } = useTutor();
  const { subjects } = useSubjects();
  const [searchParams] = useSearchParams();
  
  // Get subject and topic from URL parameters
  const urlSubject = searchParams.get('subject');
  const urlTopic = searchParams.get('topic');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<HomePageFilterState>({
    subject: '',
    topic: '',
    teachingMode: '',
    femaleOnly: false,
    verified: true
  });

  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTutors = useCallback(async (isLoadMore = false, targetPage?: number) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Build search parameters
      const searchParams: any = {
        page: targetPage || 1,
        limit: 24,
        sortBy: 'rating',
        sortOrder: 'desc'
      };

      // Apply subject and topic filters from URL parameters or filter state
      if (urlSubject) {
        searchParams.subject = urlSubject;
      } else if (filters.subject) {
        const subject = subjects.find(s => s._id === filters.subject);
        if (subject) {
          searchParams.subject = subject.name;
        }
      }

      if (urlTopic) {
        searchParams.topic = urlTopic;
      } else if (filters.topic) {
        searchParams.topic = filters.topic;
      }

      // Add search query if present
      if (searchQuery) {
        searchParams.search = searchQuery;
      }

      // Add sorting parameters
      searchParams.sortBy = sortBy;
      searchParams.sortOrder = sortOrder;
      console.log('Sending sorting parameters:', { sortBy, sortOrder });

      if (filters.teachingMode) {
        searchParams.teachingMode = filters.teachingMode;
        console.log('Sending teaching mode filter:', filters.teachingMode);
      }
      
      // Temporary debugging: log all search params
      console.log('All search params:', JSON.stringify(searchParams, null, 2));



      if (filters.femaleOnly) {
        searchParams.femaleOnly = 'true';
      }

      if (!filters.verified) {
        searchParams.verified = 'all';
      }

      // Call the search API
      console.log('Final search params being sent:', searchParams);
      const response = await searchTutors(searchParams);
      
      const newTutors = response.tutors || [];
      const pagination = response.pagination || {};
      console.log('Received tutors count:', newTutors.length);
      console.log('First tutor teaching modes:', newTutors[0]?.subjects?.[0]?.teachingModes);
      console.log('First tutor rates:', newTutors[0]?.subjects?.[0]?.rates);
      console.log('Tutors ratings:', newTutors.map(t => ({ name: t.user?.name, rating: t.rating })));
      
      // Log all tutors' teaching modes for debugging
      newTutors.forEach((tutor, index) => {
        console.log(`Tutor ${index + 1} (${tutor.user?.name}):`, {
          teachingModes: tutor.subjects?.[0]?.teachingModes,
          rates: tutor.subjects?.[0]?.rates
        });
      });
      
      if (isLoadMore) {
        setTutors(prev => [...prev, ...newTutors]);
      } else {
        setTutors(newTutors);
      }
      
      setTotalPages(pagination.pages || 1);
      setTotalTutors(pagination.total || 0);
      setHasMore(pagination.page < pagination.pages);
      
    } catch (err: any) {
      console.error('Error fetching tutors:', err);
      setError(err.message || 'Failed to fetch tutors');
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [urlSubject, urlTopic, searchQuery, filters, sortBy, sortOrder, subjects, searchTutors]);

  // Fetch tutors when component mounts, search changes, or filters change
  useEffect(() => {
    fetchTutors(false);
  }, [fetchTutors]);

  const handleFilterChange = (newFilters: HomePageFilterState) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = Math.ceil(tutors.length / 24) + 1;
          fetchTutors(true, nextPage);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchTutors, tutors.length]);

  const handleSearchSubmit = () => {
    fetchTutors(false);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    fetchTutors(false);
  };

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
        {/* Compact Header with Search */}
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
        </div>

        {/* Filters and Sorting Section */}
        <div className="mb-6 space-y-4">
          <HomePageFilters
            onFilterChange={handleFilterChange}
            urlSubject={urlSubject}
            urlTopic={urlTopic}
          />
          <TutorSorting
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </div>

        {!loading && tutors.length === 0 ? (
          <EmptyState onResetFilters={() => {
            setSearchQuery('');
            setFilters({
              subject: '',
              topic: '',
              teachingMode: '',
              femaleOnly: false,
              verified: true
            });
          }} />
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