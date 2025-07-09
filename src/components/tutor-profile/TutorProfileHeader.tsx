import React from 'react';
import { Star, MapPin, Users, Video, Home, CheckCircle, Calendar } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';
import { getRatesFromTeachingModes } from '../../utils/tutorUtils';

interface TutorProfileHeaderProps {
  profile: TutorProfile;
  onBookSession?: () => void;
}

const TutorProfileHeader: React.FC<TutorProfileHeaderProps> = ({ profile, onBookSession }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-4 sm:mb-6 overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              {profile.user.profileImage ? (
                <img
                  src={profile.user.profileImage}
                  alt={profile.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold">
                    {profile.user.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 bg-blue-500 rounded-full p-1 sm:p-1.5 shadow-md border-2 border-white">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left pt-2 sm:pt-4">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {profile.user.name}
              </h1>
              {profile.isVerified && (
                <span className="mt-2 lg:mt-0 lg:ml-3 px-3 py-1 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-100 rounded-full shadow-sm">
                  Verified
                </span>
              )}
            </div>
            
            {/* Stats - Mobile Responsive */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 my-3 sm:my-4 text-gray-600">
              <div className="flex items-center text-sm sm:text-base">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-1.5" />
                <span className="font-semibold text-gray-800">
                  {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-gray-500 ml-1">({profile.totalReviews || 0} reviews)</span>
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1.5" />
                <span>{profile.totalStudents || 0} students</span>
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1.5" />
                <span className="truncate max-w-[150px] sm:max-w-none">{profile.availableLocations || 'Not specified'}</span>
              </div>
            </div>
            
            {/* Teaching Modes - Mobile Responsive */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
              {profile.subjects.some(subject => {
                const rates = getRatesFromTeachingModes(subject.teachingModes);
                return rates.online > 0;
              }) && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm border border-blue-100">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span>Online</span>
                </div>
              )}
              {profile.subjects.some(subject => {
                const rates = getRatesFromTeachingModes(subject.teachingModes);
                return rates.individual > 0;
              }) && (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs sm:text-sm border border-green-100">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span>Home Visit</span>
                </div>
              )}
            </div>

            {/* Book Session Button - Mobile Responsive */}
            {onBookSession && (
              <div className="flex justify-center lg:justify-start mt-4 sm:mt-6">
                <button 
                  onClick={onBookSession}
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Book Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileHeader; 