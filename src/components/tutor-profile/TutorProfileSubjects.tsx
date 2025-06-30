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
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Subjects & Teaching</h2>
      
      {profile.subjects.length === 0 ? (
        <div className="text-center py-6 sm:py-8 lg:py-12">
          <div className="text-gray-500 text-base sm:text-lg lg:text-xl">No subjects added yet</div>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">This tutor hasn't added their teaching subjects</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {profile.subjects.map((subjectData, index) => {
            const rates = getRatesFromTeachingModes(subjectData.teachingModes);
            
            return (
              <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
                {/* Subject Header */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    {subjectData.subject.name}
                  </h3>
                  
                  {/* Selected Topics */}
                  {subjectData.selectedTopics && subjectData.selectedTopics.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Specialized Topics:</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {subjectData.selectedTopics.map((topic, topicIndex) => (
                          <span
                            key={topicIndex}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-50 text-primary-700 text-xs sm:text-sm rounded-full border border-primary-200"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Teaching Modes & Rates */}
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">Teaching Modes & Rates:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {subjectData.teachingModes.map((mode, modeIndex) => {
                      const IconComponent = TEACHING_MODE_ICONS[mode.type];
                      return (
                        <div
                          key={modeIndex}
                          className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 ${
                            mode.enabled && mode.rate > 0
                              ? 'border-primary-200 bg-primary-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center">
                              <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mr-1.5 sm:mr-2" />
                              <span className="text-xs sm:text-sm font-medium text-gray-700">
                                {TEACHING_MODE_LABELS[mode.type]}
                              </span>
                            </div>
                            {mode.enabled && mode.rate > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                Available
                              </span>
                            )}
                          </div>
                          <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
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
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Availability:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                      {DAYS_OF_WEEK.map(day => {
                        const dayAvailability = subjectData.availability.find(a => a.day === day);
                        return (
                          <div key={day} className="border border-gray-200 rounded-lg p-2 sm:p-3 lg:p-4">
                            <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{day}</h5>
                            {dayAvailability && dayAvailability.slots.length > 0 ? (
                              <div className="space-y-0.5 sm:space-y-1">
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
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="break-words">Available in: {profile.availableLocations}</span>
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