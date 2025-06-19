import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import TutorFilters, { FilterState } from '../components/filter/TutorFilters';
import { Search, X, Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Filters {
  subject: string;
  rating: number;
  price: { min: number; max: number };
  location: string;
  educationLevel: string;
  medium: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  availability: string;
  experience: string;
  search: string;
}

interface TransformedTutor {
  id: string;
  name: string;
  profileImage?: string;
  subjects: string[];
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  hourlyRate: {
    online: number;
    homeVisit: number;
    group: number;
  };
}

const TutorListingPage: React.FC = () => {
  const { searchTutors } = useTutor();
  const { locations } = useLocations();
  const { subjects } = useSubjects();
  const [filters, setFilters] = useState<Filters>({
    subject: '',
    rating: 0,
    price: { min: 0, max: 10000 },
    location: '',
    educationLevel: '',
    medium: '',
    page: 1,
    limit: 20,
    sortBy: 'rating',
    sortOrder: 'desc',
    availability: 'all',
    experience: 'all',
    search: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchTutors = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Always pass the search parameter from filters, which is already properly set
      console.log('Fetching tutors with filters:', filters);
      
      const response = await searchTutors({
        ...filters
      });
      
      if (isLoadMore) {
        setTutors(prev => [...prev, ...response.tutors]);
      } else {
        setTutors(response.tutors);
      }
      
      setTotalPages(response.pagination.pages);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tutors');
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters, searchQuery, searchTutors]);

  // Remove auto-search while typing - only update the searchQuery state
  // No useEffect for search query changes anymore
  
  // Effect for handling filter changes (except search)
  useEffect(() => {
    console.log('Non-search filters changed, fetching tutors');
    fetchTutors(false);
  }, [filters.subject, filters.rating, filters.price, filters.location, 
      filters.educationLevel, filters.medium, filters.sortBy, filters.sortOrder, 
      filters.availability, filters.experience]);
      
  // Note: We're not watching filters.search here, as we want search to be triggered
  // only by the search button or Enter key

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setFilters(prev => ({ ...prev, page: prev.page + 1 }));
          fetchTutors(true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, fetchTutors]);

  const handleFilterChange = (newFilters: FilterState) => {
    // Create a new filters object with updated values
    const updatedFilters = {
      subject: newFilters.subjects[0] || '',
      rating: newFilters.extraFilters.minRating,
      price: {
        min: newFilters.extraFilters.priceRange[0],
        max: newFilters.extraFilters.priceRange[1]
      },
      location: JSON.stringify({
        city: newFilters.location.city,
        town: newFilters.location.town,
        hometown: newFilters.location.hometown
      }),
      educationLevel: newFilters.educationLevel || '',
      medium: newFilters.teachingMode || '',
      page: 1,
      limit: 20,
      sortBy: newFilters.sortBy || 'rating',
      sortOrder: newFilters.sortOrder || 'desc',
      availability: 'all',
      experience: 'all',
      search: searchQuery.trim() // Ensure search query is trimmed
    };

    // Update filters with new values
    setFilters(updatedFilters);

    // Update active filters
    const newActiveFilters: string[] = [];
    if (newFilters.educationLevel) newActiveFilters.push('educationLevel');
    if (newFilters.subjects.length > 0) newActiveFilters.push('subject');
    if (newFilters.location.city || newFilters.location.town || newFilters.location.hometown) {
      newActiveFilters.push('location');
    }
    if (newFilters.extraFilters.femaleOnly) newActiveFilters.push('gender');
    if (newFilters.teachingMode) newActiveFilters.push('teachingMode');
    setActiveFilters(newActiveFilters);

    // Fetch tutors with updated filters
    fetchTutors(false);
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      rating: 0,
      price: { min: 0, max: 1000 },
      location: '',
      educationLevel: '',
      medium: '',
      page: 1,
      limit: 20,
      sortBy: 'rating',
      sortOrder: 'desc',
      availability: 'all',
      experience: 'all',
      search: ''
    } as Filters);
    setSearchQuery('');
    setActiveFilters([]);
  };

  const getSortLabel = (): string => {
    if (filters.sortBy === 'rating' && filters.sortOrder === 'desc') {
      return 'Top Rated';
    } else if (filters.sortBy === 'price' && filters.sortOrder === 'asc') {
      return 'Price: Low to High';
    } else if (filters.sortBy === 'price' && filters.sortOrder === 'desc') {
      return 'Price: High to Low';
    } else if (filters.sortBy === 'experience' && filters.sortOrder === 'desc') {
      return 'Most Experienced';
    }
    return 'Relevance';
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6 shadow-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Breadcrumb navigation */}
      <div className="container mx-auto px-4 py-2 relative">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Home
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-primary-600 md:ml-2">
                  Tutors
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
        {/* Combined Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          {/* Search Bar - Integrated with filters */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by tutor name, subject, location, or expertise..."
                  value={searchQuery}
                  onChange={(e) => {
                    // Only update the search query state, don't trigger search
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // When Enter is pressed, update filters with search query and trigger search
                      const searchParam = searchQuery.trim();
                      setFilters(prev => ({ ...prev, page: 1, search: searchParam }));
                      fetchTutors(false);
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      // Clear the search input field
                      setSearchQuery('');
                      // Clear search parameter to show all tutors and trigger search
                      setFilters(prev => ({ ...prev, page: 1, search: '' }));
                      fetchTutors(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  // Update filters with search query and fetch tutors
                  console.log("Search button clicked with query:", searchQuery);
                  const searchParam = searchQuery.trim();
                  setFilters(prev => ({ ...prev, page: 1, search: searchParam }));
                  fetchTutors(false);
                }}
                className="px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg transition-colors flex items-center justify-center"
              >
                <Search className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
          
          {/* Filters Section - Now integrated with search */}
          <TutorFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Results Count and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {loading ? 'Loading...' : `${tutors.length} Tutors Found`}
            </h2>
            {!loading && tutors.length > 0 && (
              <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm">
                {getSortLabel()}
              </span>
            )}
          </div>
        </div>

        {/* Tutor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 animate-pulse">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tutors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {tutors.map((tutor) => {
              const transformedTutor: TransformedTutor = {
                id: tutor._id,
                name: tutor.user?.name || 'Unknown Tutor',
                profileImage: tutor.user?.profileImage,
                subjects: tutor.subjects?.map(s => s.subject?.name).filter(Boolean) || [],
                location: tutor.locations?.[0]?.name || 'Not specified',
                rating: tutor.rating || 0,
                reviewCount: tutor.totalReviews || 0,
                verified: tutor.isVerified || false,
                hourlyRate: {
                  online: tutor.subjects?.[0]?.rates?.online || 0,
                  homeVisit: tutor.subjects?.[0]?.rates?.individual || 0,
                  group: tutor.subjects?.[0]?.rates?.group || 0
                }
              };
              return <TutorCard key={tutor._id} tutor={transformedTutor} />;
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
            <p className="text-sm sm:text-base text-gray-500">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              Loading more tutors...
            </div>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} className="h-4" />
      </div>
    </div>
  );
};

export default TutorListingPage;