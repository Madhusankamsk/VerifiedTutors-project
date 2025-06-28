import React from 'react';
import { Star, MapPin, Users, Video, Home, CheckCircle } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileHeaderProps {
  profile: TutorProfile;
}

const TutorProfileHeader: React.FC<TutorProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              {profile.user.profileImage ? (
                <img
                  src={profile.user.profileImage}
                  alt={profile.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">
                    {profile.user.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1.5 shadow-md border-2 border-white">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left pt-4">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {profile.user.name}
              </h1>
              {profile.isVerified && (
                <span className="mt-2 md:mt-0 md:ml-3 px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-100 rounded-full shadow-sm">
                  Verified
                </span>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 my-4 text-gray-600">
              <div className="flex items-center text-base">
                <Star className="h-5 w-5 text-yellow-500 mr-1.5" />
                <span className="font-semibold text-gray-800">{profile.rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({profile.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center text-base">
                <Users className="h-5 w-5 text-gray-500 mr-1.5" />
                <span>{profile.totalStudents} students</span>
              </div>
              <div className="flex items-center text-base">
                <MapPin className="h-5 w-5 text-gray-500 mr-1.5" />
                <span>{profile.availableLocations || 'Not specified'}</span>
              </div>
            </div>
            
            {/* Teaching Modes */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              {profile.subjects.some(subject => subject.rates.online > 0) && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-100">
                  <Video className="h-4 w-4 mr-1.5" />
                  <span>Online</span>
                </div>
              )}
              {profile.subjects.some(subject => subject.rates.individual > 0) && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm border border-green-100">
                  <Home className="h-4 w-4 mr-1.5" />
                  <span>Home Visit</span>
                </div>
              )}
              {profile.subjects.some(subject => subject.rates.group > 0) && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm border border-purple-100">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>Group</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileHeader; 