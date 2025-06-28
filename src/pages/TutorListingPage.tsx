import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import TutorFilters, { FilterState } from '../components/filter/TutorFilters';
import { Search, X, Sparkles, SlidersHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
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
      
      console.log(`fetchTutors called with isLoadMore=${isLoadMore}`);
      console.log('Current filters:', filters);
      console.log('Search parameter:', filters.search);
      
      const response = await searchTutors({
        ...filters
      });
      
      console.log(`Received ${response.tutors.length} tutors from API`);
      
      if (isLoadMore) {
        setTutors(prev => [...prev, ...response.tutors]);
      } else {
        setTutors(response.tutors);
      }
      
      setTotalPages(response.pagination.pages);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tutors');
      console.error('Error fetching tutors:', err);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters, searchTutors]);

  useEffect(() => {
    console.log('Non-search filters changed, fetching tutors with filters:', filters);
    fetchTutors(false);
  }, [filters.subject, filters.rating, filters.price, filters.location, 
      filters.educationLevel, filters.medium, filters.sortBy, filters.sortOrder, 
      filters.availability, filters.experience, filters.search]);

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
    console.log("Filter change with current filters:", filters);
    console.log("Current search query:", filters.search);
    
    // Check if this is a clear all operation (all filters are reset to initial state)
    const isClearAll = !newFilters.educationLevel && 
                      newFilters.subjects.length === 0 && 
                      !newFilters.teachingMode && 
                      !newFilters.location.city && 
                      !newFilters.location.town && 
                      !newFilters.location.hometown && 
                      newFilters.extraFilters.minRating === 0 && 
                      newFilters.extraFilters.priceRange[0] === 0 && 
                      newFilters.extraFilters.priceRange[1] === 1000 && 
                      !newFilters.extraFilters.femaleOnly;
    
    if (isClearAll) {
      // Reset everything including search
      const resetFilters = {
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
      } as Filters;
      
      console.log("Clearing all filters and search:", resetFilters);
      setFilters(resetFilters);
      setSearchQuery('');
      setActiveFilters([]);
    } else {
      // Normal filter update - preserve search
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
        sortBy: filters.sortBy || 'rating',
        sortOrder: filters.sortOrder || 'desc',
        availability: 'all',
        experience: 'all',
        search: filters.search
      };

      console.log("Updated filters with preserved search:", updatedFilters);
      setFilters(updatedFilters);

      const newActiveFilters: string[] = [];
      if (newFilters.educationLevel) newActiveFilters.push('educationLevel');
      if (newFilters.subjects.length > 0) newActiveFilters.push('subject');
      if (newFilters.location.city || newFilters.location.town || newFilters.location.hometown) {
        newActiveFilters.push('location');
      }
      if (newFilters.extraFilters.femaleOnly) newActiveFilters.push('gender');
      if (newFilters.teachingMode) newActiveFilters.push('teachingMode');
      setActiveFilters(newActiveFilters);
    }
  };

  const resetFilters = () => {
    const resetFilters = {
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
    } as Filters;
    
    setFilters(resetFilters);
    setSearchQuery('');
    setActiveFilters([]);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tutors</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchTutors(false)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
      
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-64 h-64 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/2 w-64 h-64 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Breadcrumb navigation */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Page Header with Search Bar */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Title and description */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Find Your Perfect Tutor
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Discover qualified tutors in your area or online
              </p>
            </div>
            
            {/* Right side - Search Bar */}
            <div className="lg:w-96">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search by tutor name, subject, location, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const searchParam = searchQuery.trim();
                        setFilters(prev => ({ ...prev, page: 1, search: searchParam }));
                      }
                    }}
                    className="w-full pl-9 pr-8 py-3 text-sm border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilters(prev => ({ ...prev, page: 1, search: '' }));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    const searchParam = searchQuery.trim();
                    setFilters(prev => ({ ...prev, page: 1, search: searchParam }));
                  }}
                  className="px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg transition-colors flex items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Now standalone without search bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <TutorFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Results Count and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {loading ? 'Loading...' : `${tutors.length} Tutors Found`}
            </h2>
            {activeFilters.length > 0 && (
              <span className="text-sm text-gray-500">
                ({activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied)
              </span>
            )}
          </div>
          
          {/* Sort By Dropdown */}
          {!loading && tutors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters(prev => ({
                      ...prev,
                      sortBy,
                      sortOrder: sortOrder as 'asc' | 'desc',
                      page: 1
                    }));
                  }}
                  className="appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer hover:border-gray-300"
                >
                  <option value="rating-desc">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="experience-desc">Most Experienced</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Tutor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
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