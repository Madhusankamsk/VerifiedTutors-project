import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, Book, Video, Home, Users, Heart, MapPin } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 w-full h-88">
      {/* Profile Image Section */}
      <div className="relative h-36 bg-gradient-to-br from-blue-50 to-blue-100">
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

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name and Rating */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
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

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="text-sm line-clamp-1 font-medium">
              {tutor.location || 'Location not specified'}
            </span>
          </div>
        </div>

        {/* Subjects and Topics */}
        <div className="mb-4 flex-1">
          {/* Subject Names */}
          <div className="flex items-start text-gray-600 mb-2">
            <Book className="h-3 w-3 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm line-clamp-1 leading-relaxed font-medium">
              {subjectNames.join(', ')}
            </span>
          </div>
          
          {/* Subject Topics */}
          {subjectTopics.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {subjectTopics.slice(0, 3).map((topic, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-primary-50 text-primary-700 text-xs rounded border border-primary-200 truncate max-w-20 sm:max-w-24"
                    title={topic}
                  >
                    {topic}
                  </span>
                ))}
                {subjectTopics.length > 3 && (
                  <span 
                    className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200"
                    title={`${subjectTopics.length - 3} more topics: ${subjectTopics.slice(3).join(', ')}`}
                  >
                    +{subjectTopics.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Section */}
        {(rates.online > 0 || rates.individual > 0 || rates.group > 0) && (
          <div className="mb-4">
            <div className="flex items-center gap-4 text-xs">
              {rates.online > 0 && (
                <div className="flex items-center">
                  <Video className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-gray-600 font-medium">Rs. {rates.online}</span>
                </div>
              )}
              {rates.individual > 0 && (
                <div className="flex items-center">
                  <Home className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-gray-600 font-medium">Rs. {rates.individual}</span>
                </div>
              )}
              {rates.group > 0 && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 text-purple-600 mr-1" />
                  <span className="text-gray-600 font-medium">Rs. {rates.group}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <Link
          to={`/tutors/${tutor.id}`}
          className="block w-full py-3 text-center bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors mt-auto shadow-sm hover:shadow-md"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;