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

      // Convert subject and topic filters to the format expected by the API
      if (filters.selectedSubject) {
        const subject = subjects.find(s => s._id === filters.selectedSubject);
        if (subject) {
          searchParams.subject = subject.name;
        }
      }

      if (filters.selectedTopic) {
        // Use the stored topic name if available, otherwise use the topic ID
        if (topicName) {
          searchParams.topic = topicName;
        } else {
          // Fallback to using the topic ID
          searchParams.topic = filters.selectedTopic;
        }
      }

      // Convert teaching mode to the format expected by the API
      if (filters.teachingMode) {
        searchParams.teachingMode = filters.teachingMode;
      }

      // Add femaleOnly filter
      if (filters.femaleOnly) {
        searchParams.femaleOnly = true;
      }
      
      const response = await searchTutors(searchParams);
      
      console.log(`Received ${response.tutors.length} tutors from API`);
      
      if (isLoadMore) {
        setTutors(prev => [...prev, ...response.tutors]);
      } else {
        setTutors(response.tutors);
      }
      
      setTotalPages(response.pagination.pages);
      setTotalTutors(response.pagination.total);
      setHasMore(response.pagination.page < response.pagination.pages);
      
      // Update current page in filters if using pagination mode
      if (targetPage !== undefined) {
        setFilters(prev => ({ ...prev, page: targetPage }));
      }
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
  }, [filters, searchTutors, subjects, topicName]);

  useEffect(() => {
    console.log('Non-search filters changed, fetching tutors with filters:', filters);
    fetchTutors(false);
  }, [filters.selectedSubject, filters.selectedTopic, filters.rating, filters.price, filters.location, 
      filters.teachingMode, filters.sortBy, filters.sortOrder, 
      filters.availability, filters.experience, filters.search, filters.femaleOnly]);

  // Update active filters whenever filters change
  useEffect(() => {
    const newActiveFilters: string[] = [];
    if (filters.selectedSubject) newActiveFilters.push('subject');
    if (filters.selectedTopic) newActiveFilters.push('topic');
    if (filters.location) newActiveFilters.push('location');
    if (filters.rating > 0) newActiveFilters.push('rating');
    if (filters.price.min > 0 || filters.price.max < 10000) newActiveFilters.push('price');
    if (filters.teachingMode) newActiveFilters.push('teachingMode');
    if (filters.search) newActiveFilters.push('search');
    if (filters.femaleOnly) newActiveFilters.push('femaleOnly');
    setActiveFilters(newActiveFilters);
  }, [filters]);

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
    
    // Check if this is a clear all operation - more comprehensive check
    const isClearAll = !newFilters.selectedSubject && 
                      !newFilters.selectedTopic && 
                      !newFilters.teachingMode && 
                      !newFilters.location && 
                      !newFilters.extraFilters.femaleOnly &&
                      newFilters.extraFilters.minRating === 0 &&
                      newFilters.extraFilters.priceRange[0] === 0 &&
                      newFilters.extraFilters.priceRange[1] === 1000;
    
    console.log("Filter change detected - isClearAll:", isClearAll, "newFilters:", newFilters);
    
    if (isClearAll) {
      // Use the existing resetFilters function for consistency
      resetFilters();
    } else {
      // Normal filter update - preserve search and subject selection
      const updatedFilters = {
        selectedSubject: newFilters.selectedSubject,
        selectedTopic: newFilters.selectedTopic,
        rating: newFilters.extraFilters.minRating,
        price: {
          min: newFilters.extraFilters.priceRange[0],
          max: newFilters.extraFilters.priceRange[1]
        },
        location: newFilters.location,
        teachingMode: newFilters.teachingMode || '',
        page: 1,
        limit: 24,
        sortBy: filters.sortBy || 'rating',
        sortOrder: filters.sortOrder || 'desc',
        availability: 'all',
        experience: 'all',
        search: filters.search,
        femaleOnly: newFilters.extraFilters.femaleOnly
      };

      console.log("Updated filters with preserved search:", updatedFilters);
      setFilters(updatedFilters);
      setTotalTutors(0);
    }
  };

  const resetFilters = () => {
    // Clear all related state
    setTopicName(''); // Clear topic name
    setSearchQuery(''); // Clear search query
    setActiveFilters([]); // Clear active filters
    setTotalTutors(0); // Reset total count
    
    // Reset all filters to initial state
    const resetFilters = {
      selectedSubject: null,
      selectedTopic: null,
      rating: 0,
      price: { min: 0, max: 1000 },
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
    } as Filters;
    
    setFilters(resetFilters);
    
    console.log("All filters and search cleared:", resetFilters);
  };

  const handleSearchSubmit = () => {
    const searchParam = searchQuery.trim();
    console.log('Search submitted with query:', searchParam);
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

  // Update topic name when topic changes
  useEffect(() => {
    if (filters.selectedTopic) {
      // Fetch topic name when a topic is selected
      const fetchTopicName = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/${filters.selectedTopic}`);
          if (response.ok) {
            const topicData = await response.json();
            setTopicName(topicData.name);
          } else {
            setTopicName('');
          }
        } catch (error) {
          console.error('Error fetching topic name:', error);
          setTopicName('');
        }
      };
      fetchTopicName();
    } else {
      setTopicName('');
    }
  }, [filters.selectedTopic]);

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchTutors(false)} />;
  }

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

        {/* Integrated Filters Section */}
        <div className="mb-6">
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
          <>
            <TutorGrid
              tutors={tutors}
              loading={loading}
            />
            
            {/* Infinite scroll observer target */}
            {hasMore && (
              <div 
                ref={observerTarget}
                className="h-10 flex items-center justify-center"
              >
                {loadingMore && (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TutorListingPage;