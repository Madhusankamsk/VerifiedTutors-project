import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import SimplifiedTutorFilters, { SimplifiedFilterState } from '../components/filter/SimplifiedTutorFilters';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, Star } from 'lucide-react';
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

      // Only apply subject and topic filters if URL parameters are present
      // If no URL parameters, show all tutors (no subject/topic filtering)
      if (urlSubject) {
        searchParams.subject = urlSubject;
      }

      if (urlTopic) {
        searchParams.topic = urlTopic;
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
  }, [filters.rating, filters.price, filters.location, 
      filters.teachingMode, filters.sortBy, filters.sortOrder, 
      filters.availability, filters.experience, filters.search, filters.femaleOnly, urlSubject, urlTopic]);

  // Update active filters whenever filters change
  useEffect(() => {
    const newActiveFilters: string[] = [];
    // Only add subject/topic to active filters if URL parameters are present
    if (urlSubject) newActiveFilters.push('subject');
    if (urlTopic) newActiveFilters.push('topic');
    if (filters.location) newActiveFilters.push('location');
    if (filters.rating > 0) newActiveFilters.push('rating');
    if (filters.price.min > 0 || filters.price.max < 10000) newActiveFilters.push('price');
    if (filters.teachingMode) newActiveFilters.push('teachingMode');
    if (filters.search) newActiveFilters.push('search');
    if (filters.femaleOnly) newActiveFilters.push('femaleOnly');
    setActiveFilters(newActiveFilters);
  }, [filters, urlSubject, urlTopic]);

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

  const handleFilterChange = (newFilters: SimplifiedFilterState) => {
    console.log("Filter change with current filters:", filters);
    console.log("Current search query:", filters.search);
    
    // Check if this is a clear all operation
    const isClearAll = !newFilters.teachingMode && 
                      !newFilters.location && 
                      newFilters.extraFilters.femaleOnly === false &&
                      newFilters.extraFilters.minRating === 0 &&
                      newFilters.extraFilters.priceRange[0] === 0 &&
                      newFilters.extraFilters.priceRange[1] === 1000;
    
    console.log("Filter change detected - isClearAll:", isClearAll, "newFilters:", newFilters);
    
    if (isClearAll) {
      // Use the existing resetFilters function for consistency
      resetFilters();
    } else {
      // Normal filter update - preserve search and URL subject/topic
      const updatedFilters = {
        selectedSubject: urlSubject ? (subjects.find(s => s.name === urlSubject)?._id || null) : null,
        selectedTopic: null, // Will be set by URL effect
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
    // Clear all related state except subject and topic from URL
    setTopicName(''); // Clear topic name
    setSearchQuery(''); // Clear search query
    setActiveFilters([]); // Clear active filters
    setTotalTutors(0); // Reset total count
    
    // Reset all filters to initial state, but preserve URL subject/topic
    const resetFilters = {
      selectedSubject: urlSubject ? (subjects.find(s => s.name === urlSubject)?._id || null) : null,
      selectedTopic: null, // Will be set by URL effect
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
    
    console.log("Filters cleared (preserving URL subject/topic):", resetFilters);
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
          title={urlSubject && urlTopic ? `Tutors for ${urlSubject} - ${urlTopic}` : 
                urlSubject ? `Tutors for ${urlSubject}` : 
                "All Verified Tutors"}
          description={urlSubject && urlTopic ? 
            `Find verified tutors specializing in ${urlTopic} under ${urlSubject}` :
            urlSubject ? 
            `Find verified tutors for ${urlSubject}` :
            "Browse all verified tutors across all subjects and topics"}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
        />

        {/* Verification Notice */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700 font-medium">
              All tutors shown are verified and active
            </span>
          </div>
        </div>

        {/* Integrated Filters Section */}
        <div className="mb-6">
          <SimplifiedTutorFilters 
            onFilterChange={handleFilterChange} 
            urlSubject={urlSubject}
            urlTopic={urlTopic}
          />
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

        {/* Other Subjects Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Other Subjects</h2>
            <p className="text-gray-600">Find tutors for different subjects and topics</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {subjects.slice(0, 12).map((subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:scale-105 transform text-center"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {getSubjectIcon(subject.name)}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-primary-700 transition-colors duration-300">
                  {subject.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-primary-600" />
                  <span className="text-xs text-primary-600 font-medium">
                    {subjectTutorCounts[subject._id] || 0} tutors
                  </span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Browse All Subjects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Featured Tutors Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Tutors</h2>
            <p className="text-gray-600">Discover top-rated tutors across all subjects</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.slice(0, 6).map((tutor) => (
              <div key={tutor._id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {tutor.user.profileImage ? (
                      <img 
                        src={tutor.user.profileImage} 
                        alt={tutor.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-600 font-semibold text-lg">
                        {tutor.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {tutor.user.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">
                        {tutor.rating.toFixed(1)} ({tutor.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3 text-primary-600" />
                      <span className="text-xs text-primary-600">
                        {tutor.totalStudents} students
                      </span>
                    </div>
                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {tutor.subjects[0].subject.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/tutors/${tutor._id}`}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Link
              to="/tutors"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View All Tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorListingPage;