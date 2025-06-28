import React from 'react';
import { Video, Home, Users } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileSubjectsProps {
  profile: TutorProfile;
}

const TutorProfileSubjects: React.FC<TutorProfileSubjectsProps> = ({ profile }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Subjects & Rates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {profile.subjects.map((subject, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-white"
          >
            <h3 className="font-medium text-lg mb-3 text-gray-900">{subject.subject.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Video className="h-4 w-4 text-primary-500 mr-2" />
                  <span className="text-sm text-gray-600">Online</span>
                </div>
                <span className="font-medium text-primary-600">${subject.rates.online}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home className="h-4 w-4 text-primary-500 mr-2" />
                  <span className="text-sm text-gray-600">Home Visit</span>
                </div>
                <span className="font-medium text-primary-600">${subject.rates.individual}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-primary-500 mr-2" />
                  <span className="text-sm text-gray-600">Group</span>
                </div>
                <span className="font-medium text-primary-600">${subject.rates.group}/hr</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorProfileSubjects; 