import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, ArrowRight, Star, Sparkles, Search, ArrowUp, Filter } from 'lucide-react';
import HeroImage from '../assets/HeroImage.png';
import {
  TutorGrid,
  EmptyState,
  ErrorState
} from '../components/tutor-listing';
import HomePageFilters, { HomePageFilterState } from '../components/filter/HomePageFilters';
import TutorSorting from '../components/filter/TutorSorting';
import LoadingBar from '../components/common/LoadingBar';

const TutorListingPage: React.FC = () => {
  const { searchTutors } = useTutor();
  const { subjects, getTopicsBySubject } = useSubjects();
  const [searchParams] = useSearchParams();
  
  // Get subject and topic from URL parameters
  const urlSubject = searchParams.get('subject');
  const urlTopic = searchParams.get('topic');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        setInitialLoading(false);
      }
    }
  }, [urlSubject, urlTopic, searchQuery, filters, sortBy, sortOrder, subjects, searchTutors]);

  // Fetch tutors when component mounts or filters/sorting change (but not when searchQuery changes)
  useEffect(() => {
    fetchTutors(false);
  }, [urlSubject, urlTopic, filters, sortBy, sortOrder, subjects, searchTutors]);

  const handleFilterChange = (newFilters: HomePageFilterState) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleSearchSubmit = () => {
    fetchTutors(false);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    // Reset all filters when clearing search
    setFilters({
      subject: '',
      topic: '',
      teachingMode: '',
      femaleOnly: false,
      verified: true
    });
    // Reset sorting to default
    setSortBy('rating');
    setSortOrder('desc');
    fetchTutors(false);
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

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchTutors(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <div className="relative w-full h-[40vh] max-h-[400px] overflow-hidden">
        {/* Loading Bar at Hero Section Bottom */}
        <LoadingBar isLoading={initialLoading || loading} variant="hero" />
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={HeroImage} 
            alt="Tutor Search Hero" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-purple-900/80"></div>
        </div>
        
                 {/* Content Overlay */}
         <div className="relative z-10 h-full flex items-center justify-center pt-8">
           <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 w-full">
             <div className="max-w-4xl mx-auto text-center">
               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-5 leading-tight">
                 Find Your Perfect Tutor
               </h1>
               <p className="text-sm sm:text-base lg:text-lg text-blue-100 mb-4 sm:mb-6 leading-relaxed">
                 Connect with verified, experienced tutors who can help you excel in any subject
               </p>
               
                               {/* Hero Search Bar - Completely Curved */}
                <div className="mb-4 sm:mb-5">
                  <div className="relative max-w-2xl mx-auto">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Main Search Bar */}
                    <div className="relative bg-white/90 backdrop-blur-sm border border-white/30 rounded-full shadow-xl shadow-black/10 overflow-hidden">
                      <div className="flex items-center p-2 sm:p-2.5 lg:p-3">
                        {/* Search Icon */}
                        <div className="pl-4 sm:pl-5 lg:pl-6 pr-2 sm:pr-3">
                          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        
                        {/* Search Input */}
                        <input
                          type="text"
                          placeholder="Search for tutors, subjects, or topics..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                          className="flex-1 py-3 sm:py-3.5 lg:py-4 px-2 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-base font-medium min-w-0"
                        />
                        
                        {/* Clear Button */}
                        {searchQuery && (
                          <button
                            onClick={handleSearchClear}
                            className="px-2 sm:px-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Search Button */}
                        <button
                          onClick={handleSearchSubmit}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 sm:px-6 lg:px-7 py-3 sm:py-3.5 lg:py-4 rounded-full transition-all duration-200 font-semibold text-xs sm:text-sm ml-2 sm:ml-3 mr-2 sm:mr-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats - More Compact & Visible */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                  <div className="flex items-center text-white/95 text-xs sm:text-sm font-medium">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                    <span>1000+ Tutors</span>
                  </div>
                  <div className="flex items-center text-white/95 text-xs sm:text-sm font-medium">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 fill-current flex-shrink-0" />
                    <span>4.8+ Rating</span>
                  </div>
                  <div className="flex items-center text-white/95 text-xs sm:text-sm font-medium">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                    <span>50+ Subjects</span>
                  </div>
                </div>
             </div>
           </div>
         </div>
      </div>

      {/* Main Content Area with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-8">
        {/* Page Info - Show when coming from subject/topic links */}
        {urlSubject && urlTopic && (
          <div className="mb-6 text-center">
            <p className="text-base text-gray-600">
              Tutors specializing in {urlTopic}
            </p>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              {/* Filter Header */}
              {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Refine your search to find the perfect tutor
                </p>
              </div> */}

              {/* Filters Component */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <HomePageFilters
                  onFilterChange={handleFilterChange}
                  filters={filters}
                  urlSubject={urlSubject}
                  urlTopic={urlTopic}
                />
              </div>
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {loading ? 'Searching...' : `${totalTutors} Tutors Found`}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {searchQuery && `Results for "${searchQuery}"`}
                  </p>
                </div>
                
                {/* Sorting */}
                <div className="w-48">
                  <TutorSorting
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {/* Results Content */}
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
                // Reset sorting to default
                setSortBy('rating');
                setSortOrder('desc');
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
                    className="h-16 flex items-center justify-center mt-8"
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
          </div>
        </div>

        {/* Featured Tutors Section */}
        {tutors.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4 border border-blue-100">
                <Star className="h-4 w-4 mr-2" />
                Top Rated
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Tutors
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover top-rated tutors across all subjects
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tutors.slice(0, 6).map((tutor) => (
                <div key={tutor._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {tutor.user?.profileImage ? (
                        <img 
                          src={tutor.user.profileImage} 
                          alt={tutor.user.name || 'Tutor'}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-xl">
                          {tutor.user?.name?.charAt(0).toUpperCase() || 'T'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-700 transition-colors duration-300">
                        {tutor.user?.name || 'Unknown Tutor'}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {tutor.rating.toFixed(1)} ({tutor.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">
                          {tutor.totalStudents} students
                        </span>
                      </div>
                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {tutor.subjects[0].subject.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/tutors/${tutor._id}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-full flex-shrink-0"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
          
          </div>
        )}
      </div>

      {/* Floating Go to Top Button */}
      {showScrollToTop && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={scrollToTop}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            aria-label="Go to top of page"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorListingPage;