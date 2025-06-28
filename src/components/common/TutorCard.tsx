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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 w-full h-80">
      {/* Profile Image Section - Reduced height for more square shape */}
      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100">
        {tutor.profileImage ? (
          <img
            src={tutor.profileImage}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-200">
              {tutor.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Verified Badge */}
        {tutor.verified && (
          <div className="absolute top-2 right-2 bg-green-400 rounded-full p-0.5 shadow-sm">
            <CheckCircle className="h-2.5 w-2.5 text-white" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors"
          aria-label={isTutorFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`h-3 w-3 ${isTutorFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>

      {/* Content Section - More compact */}
      <div className="p-3 flex flex-col h-48">
        {/* Name and Rating - Compact */}
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {tutor.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(tutor.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({tutor.reviewCount})
              </span>
            </div>
            {tutor.verified && (
              <span className="text-xs bg-green-400 text-white px-1.5 py-0.5 rounded-full font-medium">Verified</span>
            )}
          </div>
        </div>

        {/* Subjects - Compact */}
        <div className="mb-3 flex-1">
          <div className="flex items-start text-gray-600">
            <Book className="h-3 w-3 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs line-clamp-2 leading-relaxed">
              {tutor.subjects.join(', ')}
            </span>
          </div>
        </div>

        {/* Horizontal Pricing Section */}
        {hasAnyRate && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs">
              {tutor.hourlyRate.online > 0 && (
                <div className="flex items-center">
                  <Video className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-500">Rs. {tutor.hourlyRate.online}</span>
                </div>
              )}
              {tutor.hourlyRate.homeVisit > 0 && (
                <div className="flex items-center">
                  <Home className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-500">Rs. {tutor.hourlyRate.homeVisit}</span>
                </div>
              )}
              {tutor.hourlyRate.group > 0 && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-500">Rs. {tutor.hourlyRate.group}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button - Compact */}
        <Link
          to={`/tutors/${tutor.id}`}
          className="block w-full py-2 text-center bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;