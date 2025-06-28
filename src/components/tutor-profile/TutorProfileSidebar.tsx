import React from 'react';
import { Phone, Mail, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileSidebarProps {
  profile: TutorProfile;
}

const TutorProfileSidebar: React.FC<TutorProfileSidebarProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium mb-4 text-gray-900">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 rounded-lg bg-gray-50">
            <Phone className="h-4 w-4 text-gray-500 mr-3" />
            <span className="text-gray-600 text-sm">{profile.phone}</span>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-gray-50">
            <Mail className="h-4 w-4 text-gray-500 mr-3" />
            <span className="text-gray-600 text-sm">{profile.user.email}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium mb-4 text-gray-900">Quick Stats</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="text-gray-600 text-sm">Teaching Experience</span>
            <span className="font-medium text-gray-900">
              {profile.experience.length > 0 ? `${profile.experience.length} years` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="text-gray-600 text-sm">Students Taught</span>
            <span className="font-medium text-gray-900">{profile.totalStudents}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="text-gray-600 text-sm">Average Rating</span>
            <div className="flex items-center">
              <span className="font-medium text-gray-900 mr-1">{profile.rating.toFixed(1)}</span>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="text-gray-600 text-sm">Subjects</span>
            <span className="font-medium text-gray-900">{profile.subjects.length}</span>
          </div>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium mb-4 text-gray-900">Verification Status</h2>
        <div className={`flex items-center p-4 rounded-xl ${
          profile.isVerified 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          {profile.isVerified ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-green-700">Verified Tutor</p>
                <p className="text-sm text-green-600">This tutor has been verified by our team</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <p className="font-medium text-yellow-700">Verification Pending</p>
                <p className="text-sm text-yellow-600">This tutor is in the process of being verified</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorProfileSidebar; 