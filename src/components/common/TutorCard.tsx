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
    e.preventDefault(); // Prevent navigating to tutor profile
    
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

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Profile Image Section */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100">
        {tutor.profileImage ? (
          <img
            src={tutor.profileImage}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-blue-200">
              {tutor.name.charAt(0)}
            </span>
          </div>
        )}
        {tutor.verified && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{tutor.name}</h3>
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(tutor.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1.5">
              ({tutor.reviewCount})
            </span>
          </div>
        </div>

        {/* Subjects only (removed location) */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center text-gray-600">
            <Book className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-xs line-clamp-1">{tutor.subjects.join(', ')}</span>
          </div>
        </div>

        {/* Pricing Section - Only show teaching types with non-zero hourly rates */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {tutor.hourlyRate.online > 0 && (
            <div className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="flex items-center justify-center mb-0.5">
                <Video className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-[10px] text-gray-500">Online</p>
              <p className="font-medium text-xs text-gray-900">Rs. {tutor.hourlyRate.online}/hr</p>
            </div>
          )}
          {tutor.hourlyRate.homeVisit > 0 && (
            <div className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="flex items-center justify-center mb-0.5">
                <Home className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-[10px] text-gray-500">Home</p>
              <p className="font-medium text-xs text-gray-900">Rs. {tutor.hourlyRate.homeVisit}/hr</p>
            </div>
          )}
          {tutor.hourlyRate.group > 0 && (
            <div className="bg-gray-50 rounded-lg p-1.5 text-center">
              <div className="flex items-center justify-center mb-0.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-[10px] text-gray-500">Group</p>
              <p className="font-medium text-xs text-gray-900">Rs. {tutor.hourlyRate.group}/hr</p>
            </div>
          )}
        </div>

        {/* View Profile Button */}
        <Link
          to={`/tutors/${tutor.id}`}
          className="block w-full py-2 text-center bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;