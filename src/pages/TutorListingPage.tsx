import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import { Search, ChevronDown, ChevronUp, Star, DollarSign, X, SlidersHorizontal, Clock, Users, Sparkles } from 'lucide-react';

const TutorListingPage: React.FC = () => {
  const { searchTutors, loading, error } = useTutor();
  const { subjects } = useSubjects();
  const { locations } = useLocations();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    rating: 0,
    price: { min: 0, max: 1000 },
    location: '',
    educationLevel: '',
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc' as 'desc' | 'asc',
    availability: 'all',
    experience: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const fetchTutors = async () => {
    try {
      const result = await searchTutors(filters);
      setTutors(result.tutors);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
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
      page: 1,
      limit: 12,
      sortBy: 'rating',
      sortOrder: 'desc',
      availability: 'all',
      experience: 'all'
    });
    setSearchQuery('');
    setActiveFilters([]);
  };

  const getFilterLabel = (key: string, value: any): string => {
    switch (key) {
      case 'subject':
        return `Subject: ${subjects.find(s => s._id === value)?.name || value}`;
      case 'rating':
        return `Rating: ${value}+ Stars`;
      case 'price':
        return `Price: $${value.min}-$${value.max}/hr`;
      case 'location':
        return `Location: ${locations.find(l => l._id === value)?.name || value}`;
      case 'educationLevel':
        return `Education: ${value}`;
      case 'availability':
        return `Availability: ${value}`;
      case 'experience':
        return `Experience: ${value}+ years`;
      default:
        return `${key}: ${value}`;
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
                  <span>{getFilterLabel(filter, filters[filter as keyof typeof filters])}</span>
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
              onClick={() => handleFilterChange('availability', 'immediate')}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.availability === 'immediate'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Available Now
            </button>
            <button
              onClick={() => handleFilterChange('experience', '5')}
              className={`flex items-center px-5 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.experience === '5'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 shadow-sm hover:shadow-md'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              5+ Years Experience
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
        <div>
          {loading ? (
            <div className="flex justify-center py-12 sm:py-16">
              <LoadingSpinner size="large" />
            </div>
          ) : tutors.length > 0 ? (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 rounded-l-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange('page', page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                    filters.page === page
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="relative inline-flex items-center px-4 py-2 rounded-r-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorListingPage;