import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import TutorFilters, { FilterState } from '../components/filter/TutorFilters';
import { Search, X, Sparkles } from 'lucide-react';

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
      const response = await searchTutors({
        ...filters,
        search: searchQuery
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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
      fetchTutors(false);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.subject, filters.rating, filters.price, filters.location, 
      filters.educationLevel, filters.medium, filters.sortBy, filters.sortOrder, 
      filters.availability, filters.experience, searchQuery]);

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
    setFilters(prev => ({
      ...prev,
      educationLevel: newFilters.educationLevel || '',
      subject: newFilters.subjects[0] || '',
      location: newFilters.location.city || '',
      rating: newFilters.extraFilters.minRating,
      price: {
        min: newFilters.extraFilters.priceRange[0],
        max: newFilters.extraFilters.priceRange[1]
      },
      page: 1
    }));

    // Update active filters
    const newActiveFilters: string[] = [];
    if (newFilters.educationLevel) newActiveFilters.push('educationLevel');
    if (newFilters.subjects.length > 0) newActiveFilters.push('subject');
    if (newFilters.location.city) newActiveFilters.push('location');
    if (newFilters.extraFilters.minRating > 0) newActiveFilters.push('rating');
    if (newFilters.extraFilters.priceRange[0] > 0 || newFilters.extraFilters.priceRange[1] < 1000) {
      newActiveFilters.push('price');
    }
    setActiveFilters(newActiveFilters);
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
    });
    setSearchQuery('');
    setActiveFilters([]);
  };

  const getFilterLabel = (key: keyof Filters): string => {
    switch (key) {
      case 'subject':
        return `Subject: ${subjects.find(s => s._id === filters.subject)?.name || 'Subject'}`;
      case 'rating':
        return `Rating: ${filters.rating}+ Stars`;
      case 'price':
        return `Price: $${filters.price.min}-$${filters.price.max}/hr`;
      case 'location':
        return `Location: ${locations.find(l => l._id === filters.location)?.name || 'Location'}`;
      case 'educationLevel':
        return `Education: ${filters.educationLevel || 'Education Level'}`;
      case 'medium':
        return `Medium: ${filters.medium ? filters.medium.charAt(0).toUpperCase() + filters.medium.slice(1) : 'Medium'}`;
      case 'availability':
        return `Availability: ${filters.availability}`;
      case 'experience':
        return `Experience: ${filters.experience}+ years`;
      default:
        return `${key}: ${filters[key as keyof Filters]}`;
    }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 pt-16 sm:pt-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 py-8 sm:py-12 relative">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <TutorFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative max-w-3xl mx-auto mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tutors by name, subject, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 sm:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base shadow-sm transition-all duration-200 hover:shadow-md bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeFilters.map(filter => (
                  <div
                    key={filter}
                    className="flex items-center bg-primary-50/80 backdrop-blur-sm text-primary-700 px-4 sm:px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>{getFilterLabel(filter as keyof Filters)}</span>
                    <button
                      onClick={() => resetFilters()}
                      className="ml-2 hover:text-primary-900 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Tutor List */}
            <div className="mt-8">
              {loading && !loadingMore ? (
                <div className="flex justify-center py-12 sm:py-16">
                  <LoadingSpinner size="large" />
                </div>
              ) : tutors.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {tutors.map((tutor) => {
                      // Get the first subject with rates, or use default values
                      const firstSubject = tutor.subjects?.[0];
                      const rates = firstSubject?.rates || { online: 0, individual: 0, group: 0 };
                      
                      // Safely handle user data
                      const userName = tutor.user?.name || 'Unknown Tutor';
                      const userImage = tutor.user?.profileImage;
                      
                      return (
                        <TutorCard
                          key={tutor._id}
                          tutor={{
                            id: tutor._id,
                            name: userName,
                            profileImage: userImage,
                            subjects: tutor.subjects?.map(s => s.subject?.name).filter(Boolean) || [],
                            location: tutor.locations?.[0]?.name || 'Not specified',
                            rating: tutor.rating || 0,
                            reviewCount: tutor.totalReviews || 0,
                            verified: tutor.isVerified || false,
                            hourlyRate: {
                              online: rates.online || 0,
                              homeVisit: rates.individual || 0,
                              group: rates.group || 0
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Loading indicator for infinite scroll */}
                  {loadingMore && (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="medium" />
                    </div>
                  )}
                  
                  {/* Observer target for infinite scroll */}
                  <div ref={observerTarget} className="h-4" />
                </>
              ) : (
                <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No tutors found</h3>
                  <p className="text-base text-gray-500 mb-6">
                    Try adjusting your filters or search terms to find tutors
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorListingPage;