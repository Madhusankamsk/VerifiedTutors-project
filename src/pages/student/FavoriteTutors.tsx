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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10"></div>
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          My Favorite Tutors
        </h1>
        <p className="text-gray-600">
          Your saved tutors for quick access and booking
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Favorite Tutors</h2>
          <p className="text-gray-500 mb-6">
            You haven't added any tutors to your favorites yet.
          </p>
          <Link 
            to="/tutors"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
          >
            Find Tutors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite._id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    {favorite.tutor.user?.profileImage ? (
                      <img 
                        src={favorite.tutor.user.profileImage} 
                        alt={favorite.tutor.user?.name || 'Tutor'}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {favorite.tutor.user?.name?.charAt(0) || 'T'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{favorite.tutor.user?.name || 'Unknown Tutor'}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{favorite.tutor.rating.toFixed(1)}</span>
                      <span>({favorite.tutor.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFavorite(favorite.tutor._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {favorite.tutor.bio || "Professional tutor with expertise in various subjects"}
              </p>
              
              {favorite.tutor.isVerified && (
                <div className="flex items-center space-x-1 text-sm text-green-600 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Verified Tutor</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Link
                  to={`/tutors/${favorite.tutor._id}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                
                <div className="text-xs text-gray-500">
                  Added {new Date(favorite.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteTutors; 