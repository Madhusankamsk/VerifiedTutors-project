import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, MapPin, Book, Video, Home, Users } from 'lucide-react';

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

        {/* Location and Subjects */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-xs line-clamp-1">{tutor.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Book className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-xs line-clamp-1">{tutor.subjects.join(', ')}</span>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="bg-gray-50 rounded-lg p-1.5 text-center">
            <div className="flex items-center justify-center mb-0.5">
              <Video className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-[10px] text-gray-500">Online</p>
            <p className="font-medium text-xs text-gray-900">Rs. {tutor.hourlyRate.online}/hr</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5 text-center">
            <div className="flex items-center justify-center mb-0.5">
              <Home className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-[10px] text-gray-500">Home</p>
            <p className="font-medium text-xs text-gray-900">Rs. {tutor.hourlyRate.homeVisit}/hr</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-1.5 text-center">
            <div className="flex items-center justify-center mb-0.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-[10px] text-gray-500">Group</p>
            <p className="font-medium text-xs text-gray-900">Rs. {tutor.hourlyRate.group}/hr</p>
          </div>
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