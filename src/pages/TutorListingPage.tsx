import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import { Search, ChevronDown, ChevronUp, Star, DollarSign, X, SlidersHorizontal, Clock, Users, Sparkles, Languages } from 'lucide-react';

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
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

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));

    // Update active filters
    if (value && value !== 'all' && value !== 0) {
      if (!activeFilters.includes(key)) {
        setActiveFilters(prev => [...prev, key]);
      }
    } else {
      setActiveFilters(prev => prev.filter(f => f !== key));
    }
  };

  const removeFilter = (key: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'price' ? { min: 0, max: 1000 } : key === 'rating' ? 0 : 'all',
      page: 1
    }));
    setActiveFilters(prev => prev.filter(f => f !== key));
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
        {/* Search and Filters */}
        <div className="mb-8 sm:mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto">
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
            <div className="flex flex-wrap gap-2 justify-center">
              {activeFilters.map(filter => (
                <div
                  key={filter}
                  className="flex items-center bg-primary-50/80 backdrop-blur-sm text-primary-700 px-4 sm:px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>{getFilterLabel(filter as keyof Filters)}</span>
                  <button
                    onClick={() => removeFilter(filter)}
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

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleFilterChange('rating', 4)}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.rating === 4
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <Star className="h-4 w-4 mr-2" />
              4+ Stars
            </button>
            <button
              onClick={() => handleFilterChange('price', { min: 0, max: 50 })}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.price.max === 50
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Under $50/hr
            </button>
            <button
              onClick={() => handleFilterChange('medium', 'english')}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.medium === 'english'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <Languages className="h-4 w-4 mr-2" />
              English Medium
            </button>
            <button
              onClick={() => handleFilterChange('medium', 'sinhala')}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.medium === 'sinhala'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <Languages className="h-4 w-4 mr-2" />
              Sinhala Medium
            </button>
            <button
              onClick={() => handleFilterChange('medium', 'tamil')}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.medium === 'tamil'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <Languages className="h-4 w-4 mr-2" />
              Tamil Medium
            </button>
          </div>

          {/* Advanced Filters Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 mt-6 border border-gray-100 transform transition-all duration-300 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medium Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Medium</label>
                  <select
                    value={filters.medium}
                    onChange={(e) => handleFilterChange('medium', e.target.value)}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">All Mediums</option>
                    <option value="english">English</option>
                    <option value="sinhala">Sinhala</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (per hour)</label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={filters.price.min}
                      onChange={(e) => handleFilterChange('price', { ...filters.price, min: Number(e.target.value) })}
                      placeholder="Min"
                      className="w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      value={filters.price.max}
                      onChange={(e) => handleFilterChange('price', { ...filters.price, max: Number(e.target.value) })}
                      placeholder="Max"
                      className="w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder as 'desc' | 'asc');
                    }}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  >
                    <option value="rating-desc">Highest Rated</option>
                    <option value="price-asc">Lowest Price</option>
                    <option value="price-desc">Highest Price</option>
                    <option value="createdAt-desc">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tutor List */}
        <div className="mt-8">
          {loading && !loadingMore ? (
            <div className="flex justify-center py-12 sm:py-16">
              <LoadingSpinner size="large" />
            </div>
          ) : tutors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor._id}
                    tutor={{
                      id: tutor._id,
                      name: tutor.user.name,
                      profileImage: tutor.user.profileImage,
                      subjects: tutor.subjects.map(s => s.subject.name),
                      location: tutor.locations[0]?.name || 'Not specified',
                      rating: tutor.rating,
                      reviewCount: tutor.totalReviews,
                      verified: tutor.isVerified,
                      hourlyRate: {
                        online: tutor.subjects[0]?.rates.online || 0,
                        homeVisit: tutor.subjects[0]?.rates.individual || 0,
                        group: tutor.subjects[0]?.rates.group || 0
                      }
                    }}
                  />
                ))}
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
  );
};

export default TutorListingPage;