import React, { useMemo } from 'react';
import { Phone, Mail, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileSidebarProps {
  profile: TutorProfile;
}

const TutorProfileSidebar: React.FC<TutorProfileSidebarProps> = ({ profile }) => {
  // Memoize availability data from the tutor's subjects
  const availableDays = useMemo(() => {
    if (!profile.subjects || profile.subjects.length === 0) return [];
    
    const subject = profile.subjects[0]; // Get first subject's availability
    if (!subject.availability || subject.availability.length === 0) return [];
    
    // Filter out days with no slots (not available)
    return subject.availability.filter(dayAvail => 
      dayAvail.slots && dayAvail.slots.length > 0
    );
  }, [profile.subjects]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Information Card */}
      <div className="bg-white/95 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
        <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/60 shadow-sm">
            <Phone className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-gray-600 text-sm truncate">{profile.phone}</span>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/60 shadow-sm">
            <Mail className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-gray-600 text-sm truncate">{profile.user.email}</span>
          </div>
        </div>
      </div>

      {/* Availability Card */}
      {availableDays.length > 0 && (
        <div className="bg-white/95 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
          <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Availability
          </h2>
          <div className="space-y-3">
            {availableDays.map((dayAvail) => (
              <div key={dayAvail.day} className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{dayAvail.day}</span>
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-1">
                  {dayAvail.slots.map((slot, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-200/60 shadow-sm">
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

      {/* Verification Status Card */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
        <h2 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Verification Status</h2>
        <div className={`flex items-start p-4 rounded-2xl ${
          profile.isVerified 
            ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200/60 shadow-sm' 
            : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200/60 shadow-sm'
        }`}>
          {profile.isVerified ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-green-700 text-sm">Verified Tutor</p>
                <p className="text-sm text-green-600 mt-1">This tutor has been verified</p>
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