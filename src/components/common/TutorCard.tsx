import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, MapPin, Book } from 'lucide-react';

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
    <div className="card hover:shadow-md transition-all duration-300 animate-fade-in">
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {tutor.profileImage ? (
              <img
                src={tutor.profileImage}
                alt={tutor.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-xl">
                  {tutor.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {tutor.name}
              {tutor.verified && (
                <span className="verified-badge ml-2 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </span>
              )}
            </h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(tutor.rating)
                        ? 'text-accent-400 fill-accent-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-1">
                ({tutor.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            <span>{tutor.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Book className="h-4 w-4 text-gray-400 mr-1" />
            <span className="truncate">{tutor.subjects.join(', ')}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-gray-500">Online</p>
              <p className="font-semibold text-sm">Rs. {tutor.hourlyRate.online}/hr</p>
            </div>
            <div>
              <p className="text-gray-500">Home Visit</p>
              <p className="font-semibold text-sm">Rs. {tutor.hourlyRate.homeVisit}/hr</p>
            </div>
            <div>
              <p className="text-gray-500">Group</p>
              <p className="font-semibold text-sm">Rs. {tutor.hourlyRate.group}/hr</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link to={`/tutors/${tutor.id}`} className="btn btn-primary w-full">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;