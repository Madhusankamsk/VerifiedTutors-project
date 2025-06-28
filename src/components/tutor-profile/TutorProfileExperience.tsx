import React from 'react';
import { Briefcase } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';

interface TutorProfileExperienceProps {
  profile: TutorProfile;
}

const TutorProfileExperience: React.FC<TutorProfileExperienceProps> = ({ profile }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Experience</h2>
      <div className="space-y-4">
        {profile.experience.map((exp, index) => (
          <div 
            key={index} 
            className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
          >
            <Briefcase className="h-5 w-5 text-primary-600 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-sm text-gray-500">{exp.duration}</p>
              <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorProfileExperience; 