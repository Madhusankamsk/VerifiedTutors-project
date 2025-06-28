import React from 'react';
import { GraduationCap } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileEducationProps {
  profile: TutorProfile;
}

const TutorProfileEducation: React.FC<TutorProfileEducationProps> = ({ profile }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Education</h2>
      <div className="space-y-4">
        {profile.education.map((edu, index) => (
          <div 
            key={index} 
            className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
          >
            <GraduationCap className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">{edu.degree}</h3>
              <p className="text-gray-600">{edu.institution}</p>
              <p className="text-sm text-gray-500">{edu.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorProfileEducation; 