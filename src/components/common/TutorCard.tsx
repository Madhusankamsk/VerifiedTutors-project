import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, Book, Video, Home, Users, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudent } from '../../contexts/StudentContext';
import { toast } from 'react-toastify';

interface TutorCardProps {
  tutor: {
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
  };
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useStudent();
  const navigate = useNavigate();
  
  const isStudent = user?.role === 'student';
  const isTutorFavorite = isFavorite(tutor.id);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.info('Please login as a student to add tutors to favorites');
      navigate('/login', { state: { from: `/tutors` } });
      return;
    }
    
    if (!isStudent) {
      toast.info('Only students can add tutors to favorites');
      return;
    }
    
    if (isTutorFavorite) {
      removeFavorite(tutor.id);
    } else {
      addFavorite(tutor.id);
    }
  };

  const hasAnyRate = tutor.hourlyRate.online > 0 || tutor.hourlyRate.homeVisit > 0 || tutor.hourlyRate.group > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Profile Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
        {tutor.profileImage ? (
          <img
            src={tutor.profileImage}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-blue-200">
              {tutor.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Verified Badge */}
        {tutor.verified && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm">
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
          aria-label={isTutorFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`h-4 w-4 ${isTutorFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Name and Rating */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {tutor.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(tutor.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({tutor.reviewCount})
              </span>
            </div>
            {tutor.verified && (
              <span className="text-xs text-blue-600 font-medium">Verified</span>
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <div className="flex items-start text-gray-600">
            <Book className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm line-clamp-2 leading-relaxed">
              {tutor.subjects.join(', ')}
            </span>
          </div>
        </div>

        {/* Pricing Section - Only show if there are rates */}
        {hasAnyRate && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {tutor.hourlyRate.online > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Video className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Online</p>
                <p className="font-semibold text-sm text-gray-900">Rs. {tutor.hourlyRate.online}</p>
              </div>
            )}
            {tutor.hourlyRate.homeVisit > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Home className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Home</p>
                <p className="font-semibold text-sm text-gray-900">Rs. {tutor.hourlyRate.homeVisit}</p>
              </div>
            )}
            {tutor.hourlyRate.group > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Group</p>
                <p className="font-semibold text-sm text-gray-900">Rs. {tutor.hourlyRate.group}</p>
              </div>
            )}
          </div>
        )}

        {/* View Profile Button */}
        <Link
          to={`/tutors/${tutor.id}`}
          className="block w-full py-3 text-center bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;