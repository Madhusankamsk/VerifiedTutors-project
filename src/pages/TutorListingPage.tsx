import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, ChevronDown, X } from 'lucide-react';
import TutorCard from '../components/common/TutorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SUBJECT_AREAS, LOCATIONS } from '../config/constants';

// Mock data for demonstration
const MOCK_TUTORS = Array(16).fill(null).map((_, i) => ({
  id: `tutor-${i + 1}`,
  name: `Tutor ${i + 1}`,
  profileImage: i % 3 === 0 ? `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 1}.jpg` : undefined,
  subjects: [
    SUBJECT_AREAS[Math.floor(Math.random() * SUBJECT_AREAS.length)],
    SUBJECT_AREAS[Math.floor(Math.random() * SUBJECT_AREAS.length)]
  ],
  location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
  rating: 3 + Math.random() * 2,
  reviewCount: Math.floor(Math.random() * 50) + 1,
  verified: Math.random() > 0.3,
  hourlyRate: {
    online: Math.floor(Math.random() * 1000) + 500,
    homeVisit: Math.floor(Math.random() * 1500) + 1000,
    group: Math.floor(Math.random() * 800) + 300,
  }
}));

const TutorListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState(MOCK_TUTORS);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize filters from URL params
  useEffect(() => {
    const subject = searchParams.get('subject');
    const location = searchParams.get('location');
    const verified = searchParams.get('verified');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    
    if (subject) setSelectedSubjects([subject]);
    if (location) setSelectedLocations([location]);
    if (verified === 'true') setVerifiedOnly(true);
    if (rating) setRatingFilter(parseInt(rating));
    if (search) setSearchTerm(search);
    
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Apply filters to mock data
      let filtered = [...MOCK_TUTORS];
      
      if (subject) {
        filtered = filtered.filter(tutor => 
          tutor.subjects.some(s => s.toLowerCase() === subject.toLowerCase())
        );
      }
      
      if (location) {
        filtered = filtered.filter(tutor => 
          tutor.location.toLowerCase() === location.toLowerCase()
        );
      }
      
      if (verified === 'true') {
        filtered = filtered.filter(tutor => tutor.verified);
      }
      
      if (rating) {
        const ratingNum = parseInt(rating);
        filtered = filtered.filter(tutor => Math.floor(tutor.rating) >= ratingNum);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(tutor => 
          tutor.name.toLowerCase().includes(searchLower) || 
          tutor.subjects.some(s => s.toLowerCase().includes(searchLower))
        );
      }
      
      setTutors(filtered);
      setLoading(false);
    }, 800);
  }, [searchParams]);

  // Apply filters and update URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedSubjects.length === 1) {
      params.set('subject', selectedSubjects[0]);
    }
    
    if (selectedLocations.length === 1) {
      params.set('location', selectedLocations[0]);
    }
    
    if (verifiedOnly) {
      params.set('verified', 'true');
    }
    
    if (ratingFilter) {
      params.set('rating', ratingFilter.toString());
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    setSearchParams(params);
    setShowFilters(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedSubjects([]);
    setSelectedLocations([]);
    setPriceRange([0, 5000]);
    setRatingFilter(null);
    setVerifiedOnly(false);
    setSearchTerm('');
    setSearchParams({});
  };

  // Toggle subject selection
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  // Toggle location selection
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Find Your Perfect Tutor</h1>
          
          {/* Search bar */}
          <div className="relative">
            <div className="flex">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-10 pr-4 text-gray-800 bg-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button
                className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-r-md flex items-center"
                onClick={applyFilters}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {loading ? 'Finding tutors...' : `${tutors.length} tutors found`}
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Active filters display */}
        {(selectedSubjects.length > 0 || selectedLocations.length > 0 || verifiedOnly || ratingFilter) && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {selectedSubjects.map(subject => (
                <span key={subject} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  {subject}
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className="ml-1 inline-flex text-primary-500 hover:text-primary-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              
              {selectedLocations.map(location => (
                <span key={location} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
                  {location}
                  <button
                    type="button"
                    onClick={() => toggleLocation(location)}
                    className="ml-1 inline-flex text-secondary-500 hover:text-secondary-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              
              {verifiedOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800">
                  Verified Only
                  <button
                    type="button"
                    onClick={() => setVerifiedOnly(false)}
                    className="ml-1 inline-flex text-accent-500 hover:text-accent-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {ratingFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  {ratingFilter}+ Stars
                  <button
                    type="button"
                    onClick={() => setRatingFilter(null)}
                    className="ml-1 inline-flex text-yellow-500 hover:text-yellow-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Subjects</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {SUBJECT_AREAS.map(subject => (
                    <div key={subject} className="flex items-center">
                      <input
                        id={`subject-${subject}`}
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`subject-${subject}`} className="ml-2 text-sm text-gray-700">
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {LOCATIONS.map(location => (
                    <div key={location} className="flex items-center">
                      <input
                        id={`location-${location}`}
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={() => toggleLocation(location)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-700">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range (Rs.)</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Rs. {priceRange[1]}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
                  <div className="flex space-x-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setRatingFilter(rating === ratingFilter ? null : rating)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          rating === ratingFilter
                            ? 'bg-accent-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <input
                      id="verified-only"
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="verified-only" className="ml-2 text-sm text-gray-700">
                      Verified Tutors Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Tutor grid */}
        {loading ? (
          <LoadingSpinner size="large" />
        ) : tutors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
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
    </div>
  );
};

export default TutorListingPage;