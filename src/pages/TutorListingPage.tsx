import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useSubjects } from '../contexts/SubjectContext';
import { useLocations } from '../contexts/LocationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/common/TutorCard';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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
    sortOrder: 'desc' as 'desc' | 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

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
      page: 1 // Reset to first page when filters change
    }));
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
      sortOrder: 'desc' as 'desc' | 'asc'
    });
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Find a Tutor</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search tutors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="0">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (per hour)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.price.min}
                  onChange={(e) => handleFilterChange('price', { ...filters.price, min: Number(e.target.value) })}
                  placeholder="Min"
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={filters.price.max}
                  onChange={(e) => handleFilterChange('price', { ...filters.price, max: Number(e.target.value) })}
                  placeholder="Max"
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder as 'desc' | 'asc');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
                <option value="createdAt-desc">Newest</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Tutor List */}
      <div>
        {loading ? (
          <LoadingSpinner size="large" />
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
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms to find tutors
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 btn btn-primary"
            >
              Clear Filters
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
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TutorListingPage;