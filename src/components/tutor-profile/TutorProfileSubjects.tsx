import React from 'react';
import { Video, Home, Users, Clock, MapPin } from 'lucide-react';
import { TutorProfile } from '../../contexts/TutorContext';
import { getRatesFromTeachingModes } from '../../utils/tutorUtils';

interface TutorProfileSubjectsProps {
  profile: TutorProfile;
}

const TutorProfileSubjects: React.FC<TutorProfileSubjectsProps> = ({ profile }) => {
  const TEACHING_MODE_LABELS = {
    'online': 'Online',
    'home-visit': 'Home Visit',
    'group': 'Group'
  };

  const TEACHING_MODE_ICONS = {
    'online': Video,
    'home-visit': Home,
    'group': Users
  };

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Subjects & Teaching</h2>
      
      {profile.subjects.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No subjects added yet</div>
          <p className="text-gray-400 mt-2">This tutor hasn't added their teaching subjects</p>
        </div>
      ) : (
        <div className="space-y-6">
          {profile.subjects.map((subjectData, index) => {
            const rates = getRatesFromTeachingModes(subjectData.teachingModes);
            
            return (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                {/* Subject Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {subjectData.subject.name}
                  </h3>
                  
                  {/* Selected Topics */}
                  {subjectData.selectedTopics && subjectData.selectedTopics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Specialized Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {subjectData.selectedTopics.map((topic, topicIndex) => (
                          <span
                            key={topicIndex}
                            className="px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Teaching Modes & Rates */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Teaching Modes & Rates:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subjectData.teachingModes.map((mode, modeIndex) => {
                      const IconComponent = TEACHING_MODE_ICONS[mode.type];
                      return (
                        <div
                          key={modeIndex}
                          className={`p-4 rounded-lg border-2 ${
                            mode.enabled && mode.rate > 0
                              ? 'border-primary-200 bg-primary-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 text-gray-600 mr-2" />
                              <span className="text-sm font-medium text-gray-700">
                                {TEACHING_MODE_LABELS[mode.type]}
                              </span>
                            </div>
                            {mode.enabled && mode.rate > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Available
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            Rs. {mode.rate}/hr
                          </div>
                          {!mode.enabled && mode.rate === 0 && (
                            <div className="text-xs text-gray-500 mt-1">Not available</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Availability */}
                {subjectData.availability && subjectData.availability.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Availability:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {DAYS_OF_WEEK.map(day => {
                        const dayAvailability = subjectData.availability.find(a => a.day === day);
                        return (
                          <div key={day} className="border border-gray-200 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">{day}</h5>
                            {dayAvailability && dayAvailability.slots.length > 0 ? (
                              <div className="space-y-1">
                                {dayAvailability.slots.map((slot, slotIndex) => (
                                  <div key={slotIndex} className="text-xs text-gray-600">
                                    {slot.start} - {slot.end}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">Not available</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Location */}
                {profile.availableLocations && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Available in: {profile.availableLocations}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TutorProfileSubjects; 