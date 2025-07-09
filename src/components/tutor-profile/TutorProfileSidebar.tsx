import React from 'react';
import { Phone, Mail, Star, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileSidebarProps {
  profile: TutorProfile;
}

const TutorProfileSidebar: React.FC<TutorProfileSidebarProps> = ({ profile }) => {
  // Get availability data from the tutor's subjects
  const getAvailabilityData = () => {
    if (!profile.subjects || profile.subjects.length === 0) return [];
    
    const subject = profile.subjects[0]; // Get first subject's availability
    if (!subject.availability || subject.availability.length === 0) return [];
    
    // Filter out days with no slots (not available)
    return subject.availability.filter(dayAvail => 
      dayAvail.slots && dayAvail.slots.length > 0
    );
  };

  const availableDays = getAvailabilityData();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Information Card */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            <Phone className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-gray-600 text-sm truncate">{profile.phone}</span>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            <Mail className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-gray-600 text-sm truncate">{profile.user.email}</span>
          </div>
        </div>
      </div>

      {/* Availability Card */}
      {availableDays.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Availability
          </h2>
          <div className="space-y-3">
            {availableDays.map((dayAvail) => (
              <div key={dayAvail.day} className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{dayAvail.day}</span>
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-1">
                  {dayAvail.slots.map((slot, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Card */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Quick Stats</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            <span className="text-gray-600 text-sm">Teaching Experience</span>
            <span className="font-medium text-gray-900 text-sm">
              {profile.experience.length > 0 ? `${profile.experience.length} years` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            <span className="text-gray-600 text-sm">Students Taught</span>
            <span className="font-medium text-gray-900 text-sm">{profile.totalStudents || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            <span className="text-gray-600 text-sm">Average Rating</span>
            <div className="flex items-center">
              <span className="font-medium text-gray-900 mr-1 text-sm">
                {profile.rating ? profile.rating.toFixed(1) : '0.0'}
              </span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
            <span className="text-gray-600 text-sm">Subjects</span>
            <span className="font-medium text-gray-900 text-sm">{profile.subjects.length}</span>
          </div>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Verification Status</h2>
        <div className={`flex items-start p-4 rounded-xl ${
          profile.isVerified 
            ? 'bg-green-50/80 backdrop-blur-sm border border-green-200' 
            : 'bg-yellow-50/80 backdrop-blur-sm border border-yellow-200'
        }`}>
          {profile.isVerified ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-green-700 text-sm">Verified Tutor</p>
                <p className="text-sm text-green-600 mt-1">This tutor has been verified by our team</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-yellow-700 text-sm">Verification Pending</p>
                <p className="text-sm text-yellow-600 mt-1">This tutor is in the process of being verified</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorProfileSidebar; 