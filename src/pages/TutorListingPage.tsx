import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import TutorFilters, { FilterState } from '../components/filter/TutorFilters';
import { useScrollToTop } from '../hooks/useScrollToTop';
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

  // Scroll to top when filters change (but not for load more)
  useScrollToTop([filters.subject, filters.rating, filters.price, filters.location, 
                  filters.educationLevel, filters.medium, filters.sortBy, filters.sortOrder, 
                  filters.availability, filters.experience, filters.search]);

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
                      !newFilters.location && 
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
        location: newFilters.location,
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
      if (newFilters.location) {
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

  const handleSearchSubmit = () => {
    const searchParam = searchQuery.trim();
    setFilters(prev => ({ ...prev, page: 1, search: searchParam }));
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setFilters(prev => ({ ...prev, page: 1, search: '' }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1
    }));
  };

  const transformTutors = (tutors: TutorProfile[]): TransformedTutor[] => {
    return tutors.map((tutor) => ({
      id: tutor._id,
      name: tutor.user?.name || 'Unknown Tutor',
      profileImage: tutor.user?.profileImage,
      subjects: tutor.subjects?.map(s => s.subject?.name).filter(Boolean) || [],
      location: tutor.availableLocations || 'Not specified',
      rating: tutor.rating || 0,
      reviewCount: tutor.totalReviews || 0,
      verified: tutor.isVerified || false,
      hourlyRate: {
        online: tutor.subjects?.[0]?.rates?.online || 0,
        homeVisit: tutor.subjects?.[0]?.rates?.individual || 0,
        group: tutor.subjects?.[0]?.rates?.group || 0
      }
    }));
  };

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchTutors(false)} />;
  }

  const transformedTutors = transformTutors(tutors);

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <BackgroundDecorations />
      
      <BreadcrumbNav currentPage="Tutors" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PageHeader
          title="Find Your Perfect Tutor"
          description="Discover qualified tutors in your area or online"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
        />

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <TutorFilters onFilterChange={handleFilterChange} />
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
          <TutorGrid
            tutors={transformedTutors}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            observerTarget={observerTarget}
          />
        )}
      </div>
    </div>
  );
};

export default TutorListingPage;