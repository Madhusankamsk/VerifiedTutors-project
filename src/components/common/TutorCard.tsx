import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, Book, Video, Home, Heart, MapPin } from 'lucide-react';
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
      selectedTopics?: Array<{
        _id: string;
        name: string;
        description?: string;
      }>;
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
        };
      }
    }
    // Fallback to legacy hourlyRate
    if (tutor.hourlyRate) {
      return {
        online: tutor.hourlyRate.online || 0,
        individual: tutor.hourlyRate.homeVisit || 0,
      };
    }
    return { online: 0, individual: 0 };
  };

  const rates = getRates();

  // Get subject names
  const getSubjectNames = () => {
    if (tutor.subjects && tutor.subjects.length > 0) {
      return tutor.subjects.map(s => s.subject.name);
    }
    return [];
  };

  // Get subject topics for display
  const getSubjectTopics = () => {
    if (tutor.subjects && tutor.subjects.length > 0) {
      const allTopics: string[] = [];
      tutor.subjects.forEach(subject => {
        if (subject.selectedTopics && subject.selectedTopics.length > 0) {
          // Handle both populated topic objects and string arrays (for backwards compatibility)
          subject.selectedTopics.forEach(topic => {
            if (typeof topic === 'string') {
              // Legacy case: topic is just a string
              allTopics.push(topic);
            } else if (topic && typeof topic === 'object' && topic.name) {
              // New case: topic is populated with name
              allTopics.push(topic.name);
            }
          });
        }
      });
      return allTopics;
    }
    return [];
  };

  const subjectNames = getSubjectNames();
  const subjectTopics = getSubjectTopics();

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
    <Link
      to={`/tutors/${tutor.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 w-full"
    >
      {/* Profile Image Section - Improved Mobile Layout */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        {tutor.profileImage ? (
          <img
            src={tutor.profileImage}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-bold text-white">
              {tutor.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Gradient Overlay for Content - Better Mobile Positioning */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent h-2/3"></div>
        
        {/* Verified Badge - Top Right */}
        {tutor.verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            Verified
          </div>
        )}
        
        {/* Content Overlay - Improved Mobile Layout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pb-16 sm:pb-12 md:pb-3 space-y-2">
          {/* Subjects */}
          <div className="flex items-center text-gray-200">
            <Book className="h-3 w-3 mr-1 text-gray-300 flex-shrink-0" />
            <span className="text-xs line-clamp-1">
              {subjectNames.join(', ')}
            </span>
          </div>
          
          {/* Topics - Better Mobile Layout */}
          {subjectTopics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {subjectTopics.slice(0, 2).map((topic, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded-md backdrop-blur-sm"
                  title={topic}
                >
                  {topic}
                </span>
              ))}
              {subjectTopics.length > 2 && (
                <span className="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded-md backdrop-blur-sm">
                  +{subjectTopics.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Pricing - Improved Mobile Layout */}
          {(rates.online > 0 || rates.individual > 0) && (
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              {rates.online > 0 && (
                <div className="flex items-center text-gray-200">
                  <Video className="h-3 w-3 text-blue-300 mr-1 flex-shrink-0" />
                  <span>Rs. {rates.online}</span>
                </div>
              )}
              {rates.individual > 0 && (
                <div className="flex items-center text-gray-200">
                  <Home className="h-3 w-3 text-green-300 mr-1 flex-shrink-0" />
                  <span>Rs. {rates.individual}</span>
                </div>
              )}
            </div>
          )}
        </div>
        

        {/* Favorite Button - Better Mobile Positioning */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-2 md:right-2 sm:bg-white/95 sm:backdrop-blur-sm rounded-full sm:p-1.5 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 sm:border sm:border-white/30 z-20"
          aria-label={isTutorFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`h-5 w-5 sm:h-4 sm:w-4 md:h-3.5 md:w-3.5 ${isTutorFavorite ? 'text-red-500 fill-red-500' : 'text-white hover:text-red-400 sm:text-gray-600'}`} 
          />
        </button>
      </div>

      {/* Tutor Info Section - Below Image */}
      <div className="p-3 sm:p-4">
        {/* Name */}
        <h3 className="text-gray-900 font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
          {tutor.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < Math.floor(tutor.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({tutor.reviewCount} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard;