import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, Book, Video, Home, Users, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudent } from '../../contexts/StudentContext';
import { toast } from 'react-toastify';
import { getRatesFromTeachingModes } from '../../utils/tutorUtils';

interface TutorCardProps {
  tutor: {
    id: string;
    name: string;
    profileImage?: string;
    subjects: Array<{
      subject: {
        name: string;
      };
      selectedTopics?: string[];
      teachingModes?: Array<{
        type: 'online' | 'home-visit' | 'group';
        rate: number;
        enabled: boolean;
      }>;
      // Legacy support
      rates?: {
        online: number;
        individual: number;
        group: number;
      };
    }>;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    // Legacy support
    hourlyRate?: {
      online: number;
      homeVisit: number;
      group: number;
    };
  };
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const { user } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useStudent();
  const navigate = useNavigate();

  // Get rates from new structure or fallback to legacy
  const getRates = () => {
    if (tutor.subjects && tutor.subjects.length > 0) {
      const subject = tutor.subjects[0];
      if (subject.teachingModes) {
        return getRatesFromTeachingModes(subject.teachingModes);
      } else if (subject.rates) {
        return {
          online: subject.rates.online || 0,
          individual: subject.rates.individual || 0,
          group: subject.rates.group || 0
        };
      }
    }
    // Fallback to legacy hourlyRate
    if (tutor.hourlyRate) {
      return {
        online: tutor.hourlyRate.online || 0,
        individual: tutor.hourlyRate.homeVisit || 0,
        group: tutor.hourlyRate.group || 0
      };
    }
    return { online: 0, individual: 0, group: 0 };
  };

  const rates = getRates();

  // Get subject names
  const getSubjectNames = () => {
    if (tutor.subjects && tutor.subjects.length > 0) {
      return tutor.subjects.map(s => s.subject.name);
    }
    return [];
  };

  const subjectNames = getSubjectNames();

  const isTutorFavorite = favorites.some(fav => fav.tutor._id === tutor.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (isTutorFavorite) {
        await removeFavorite(tutor.id);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(tutor.id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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
      <div className="p-4 flex flex-col h-48">
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
              {subjectNames.join(', ')}
            </span>
          </div>
        </div>

        {/* Horizontal Pricing Section */}
        {(rates.online > 0 || rates.individual > 0 || rates.group > 0) && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs">
              {rates.online > 0 && (
                <div className="flex items-center">
                  <Video className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-500">Rs. {rates.online}</span>
                </div>
              )}
              {rates.individual > 0 && (
                <div className="flex items-center">
                  <Home className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-500">Rs. {rates.individual}</span>
                </div>
              )}
              {rates.group > 0 && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-500">Rs. {rates.group}</span>
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