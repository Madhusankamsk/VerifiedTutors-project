import React from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { Star, MapPin, Book, Heart, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const FavoriteTutors = () => {
  const { favorites, loading, error, removeFavorite } = useStudent();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="relative">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          My Favorite Tutors
        </h1>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Favorite Tutors</h2>
            <p className="text-gray-500 mb-6">
              You haven't added any tutors to your favorites yet.
            </p>
            <Link 
              to="/tutors"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
            >
              Find Tutors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div 
                key={favorite._id} 
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                        {favorite.tutor.user.profileImage ? (
                          <img 
                            src={favorite.tutor.user.profileImage} 
                            alt={favorite.tutor.user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {favorite.tutor.user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {favorite.tutor.user.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-gray-600 ml-1">
                            {favorite.tutor.rating.toFixed(1)} ({favorite.tutor.totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(favorite.tutor._id)}
                      className="text-red-500 hover:text-red-700 transition"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 fill-red-500" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {favorite.tutor.bio || 'No bio available'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Link 
                      to={`/tutors/${favorite.tutor._id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      to={`/tutors/${favorite.tutor._id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteTutors; 