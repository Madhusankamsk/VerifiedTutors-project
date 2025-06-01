import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import { Search, ChevronDown, ChevronUp, Star, DollarSign, X, SlidersHorizontal, Clock, Users } from 'lucide-react';

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tutors by name, subject, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {activeFilters.map(filter => (
                <div
                  key={filter}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{getFilterLabel(filter, filters[filter as keyof typeof filters])}</span>
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleFilterChange('rating', 4)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.rating === 4
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star className="h-4 w-4 mr-1" />
              4+ Stars
            </button>
            <button
              onClick={() => handleFilterChange('price', { min: 0, max: 50 })}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.price.max === 50
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Under $50/hr
            </button>
            <button
              onClick={() => handleFilterChange('availability', 'immediate')}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.availability === 'immediate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-4 w-4 mr-1" />
              Available Now
            </button>
            <button
              onClick={() => handleFilterChange('experience', '5')}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.experience === '5'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4 mr-1" />
              5+ Years Experience
            </button>
          </div>

          {/* Advanced Filters Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.price.min}
                      onChange={(e) => handleFilterChange('price', { ...filters.price, min: Number(e.target.value) })}
                      placeholder="Min"
                      className="w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={filters.price.max}
                      onChange={(e) => handleFilterChange('price', { ...filters.price, max: Number(e.target.value) })}
                      placeholder="Max"
                      className="w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : tutors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search terms to find tutors
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange('page', page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    filters.page === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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