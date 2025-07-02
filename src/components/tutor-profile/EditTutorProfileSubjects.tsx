import React, { useState } from 'react';
import { BookOpen, Clock, DollarSign, MapPin, X, Check, AlertCircle } from 'lucide-react';
import { Subject, Topic } from '../../contexts/AdminContext';
import { toast } from 'react-toastify';

interface TeachingMode {
  type: 'online' | 'home-visit' | 'group';
  rate: number;
  enabled: boolean;
}

interface SubjectData {
  _id: string;
  name: string;
  selectedTopics: string[];
  teachingModes: TeachingMode[];
  availability: Array<{
    day: string;
    slots: Array<{
      start: string;
      end: string;
    }>;
  }>;
}

interface EditTutorProfileSubjectsProps {
  subjects: SubjectData[];
  allSubjects: Subject[];
  allTopics: Topic[];
  onSubjectsChange: (subjects: SubjectData[]) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const TEACHING_MODE_LABELS = {
  'online': 'Online',
  'home-visit': 'Home Visit',
  'group': 'Group'
};

const EditTutorProfileSubjects: React.FC<EditTutorProfileSubjectsProps> = ({
  subjects,
  allSubjects,
  allTopics,
  onSubjectsChange
}) => {
  const removeSubject = (subjectId: string) => {
    onSubjectsChange([]);
  };

  const updateSubjectTopics = (subjectId: string, topics: string[]) => {
    if (topics.length > 5) {
      toast.error('You can select maximum 5 topics per subject');
      return;
    }

    onSubjectsChange(subjects.map(s => 
      s._id === subjectId ? { ...s, selectedTopics: topics } : s
    ));
  };

  const updateTeachingMode = (subjectId: string, modeType: string, updates: Partial<TeachingMode>) => {
    onSubjectsChange(subjects.map(s => 
      s._id === subjectId ? {
        ...s,
        teachingModes: s.teachingModes.map(m => 
          m.type === modeType ? { ...m, ...updates } : m
        )
      } : s
    ));
  };

  const updateAvailability = (subjectId: string, day: string, slots: Array<{ start: string; end: string }>) => {
    onSubjectsChange(subjects.map(s => 
      s._id === subjectId ? {
        ...s,
        availability: s.availability.map(a => 
          a.day === day ? { ...a, slots } : a
        )
      } : s
    ));
  };

  const addTimeSlot = (subjectId: string, day: string) => {
    const subject = subjects.find(s => s._id === subjectId);
    if (!subject) return;

    const dayAvailability = subject.availability.find(a => a.day === day);
    if (!dayAvailability) return;

    // Check if already at maximum slots (3 slots per day)
    if (dayAvailability.slots.length >= 3) {
      toast.error('Maximum 3 time slots allowed per day');
      return;
    }

    const newSlot = { start: '09:00', end: '10:00' };
    updateAvailability(subjectId, day, [...dayAvailability.slots, newSlot]);
  };

  const removeTimeSlot = (subjectId: string, day: string, slotIndex: number) => {
    const subject = subjects.find(s => s._id === subjectId);
    if (!subject) return;

    const dayAvailability = subject.availability.find(a => a.day === day);
    if (!dayAvailability) return;

    const newSlots = dayAvailability.slots.filter((_, index) => index !== slotIndex);
    updateAvailability(subjectId, day, newSlots);
  };

  const updateTimeSlot = (subjectId: string, day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const subject = subjects.find(s => s._id === subjectId);
    if (!subject) return;

    const dayAvailability = subject.availability.find(a => a.day === day);
    if (!dayAvailability) return;

    const newSlots = dayAvailability.slots.map((slot, index) => 
      index === slotIndex ? { ...slot, [field]: value } : slot
    );
    updateAvailability(subjectId, day, newSlots);
  };

  const getTopicsBySubject = (subjectId: string): Topic[] => {
    return allTopics.filter(topic => 
      typeof topic.subject === 'string' 
        ? topic.subject === subjectId 
        : topic.subject._id === subjectId
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center text-gray-900">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
          Subject & Teaching Details
        </h2>
      </div>

      {/* Subject Display */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {subjects.map((subject) => {
          const availableTopics = getTopicsBySubject(subject._id);
          
          return (
            <div key={subject._id} className="bg-gray-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
              {/* Subject Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">{subject.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Your selected subject</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(subject._id)}
                  className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 flex-shrink-0 ml-2"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Topics Selection */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700">Best Topics (Max 5)</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    subject.selectedTopics.length >= 5 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {subject.selectedTopics.length}/5 selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {availableTopics.map((topic) => {
                    const isSelected = subject.selectedTopics.includes(topic._id);
                    const isDisabled = !isSelected && subject.selectedTopics.length >= 5;
                    
                    return (
                      <label
                        key={topic._id}
                        className={`flex items-center p-2 sm:p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : isDisabled
                            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSubjectTopics(subject._id, [...subject.selectedTopics, topic._id]);
                            } else {
                              updateSubjectTopics(subject._id, subject.selectedTopics.filter(id => id !== topic._id));
                            }
                          }}
                          className="sr-only"
                        />
                        <Check className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 ${
                          isSelected ? 'text-primary-600' : 'text-transparent'
                        }`} />
                        <span className="text-xs sm:text-sm font-medium truncate">{topic.name}</span>
                      </label>
                    );
                  })}
                </div>
                {subject.selectedTopics.length === 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    Select up to 5 topics you're best at teaching
                  </p>
                )}
                {subject.selectedTopics.length >= 5 && (
                  <p className="text-xs sm:text-sm text-amber-600 mt-2 sm:mt-3 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    Maximum 5 topics selected. Deselect a topic to add another.
                  </p>
                )}
              </div>

              {/* Teaching Modes */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  Teaching Modes & Rates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {subject.teachingModes.map((mode) => (
                    <div key={mode.type} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={mode.enabled}
                            onChange={(e) => updateTeachingMode(subject._id, mode.type, { enabled: e.target.checked })}
                            className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                            {TEACHING_MODE_LABELS[mode.type]}
                          </span>
                        </label>
                      </div>
                      {mode.enabled && (
                        <div className="relative">
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                            <span className="text-xs sm:text-sm text-gray-500 pl-2 sm:pl-3">Rs.</span>
                            <input
                              type="number"
                              value={mode.rate}
                              onChange={(e) => updateTeachingMode(subject._id, mode.type, { rate: Number(e.target.value) })}
                              placeholder="0"
                              min="0"
                              className="flex-1 p-1.5 sm:p-2 bg-transparent border-0 focus:ring-0 focus:outline-none text-xs sm:text-sm min-w-0"
                            />
                            <span className="text-xs sm:text-sm text-gray-500 pr-2 sm:pr-3 whitespace-nowrap">/hour</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  Available Time Slots
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {subject.availability.map((dayAvailability) => (
                    <div key={dayAvailability.day} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h5 className="text-xs sm:text-sm font-medium text-gray-700 truncate">{dayAvailability.day}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                            dayAvailability.slots.length >= 3 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {dayAvailability.slots.length}/3 slots
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(subject._id, dayAvailability.day)}
                          disabled={dayAvailability.slots.length >= 3}
                          className={`text-xs sm:text-sm font-medium flex-shrink-0 ml-2 ${
                            dayAvailability.slots.length >= 3
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-primary-600 hover:text-primary-700'
                          }`}
                        >
                          + Add Slot
                        </button>
                      </div>
                      
                      {dayAvailability.slots.length === 0 ? (
                        <p className="text-xs text-gray-500">No time slots added</p>
                      ) : (
                        <div className="space-y-2">
                          {dayAvailability.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-1 sm:gap-2">
                              <select
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(subject._id, dayAvailability.day, slotIndex, 'start', e.target.value)}
                                className="flex-1 p-1 sm:p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {TIME_SLOTS.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <span className="text-xs text-gray-500 flex-shrink-0">to</span>
                              <select
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(subject._id, dayAvailability.day, slotIndex, 'end', e.target.value)}
                                className="flex-1 p-1 sm:p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {TIME_SLOTS.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(subject._id, dayAvailability.day, slotIndex)}
                                className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                              >
                                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {dayAvailability.slots.length >= 3 && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          Maximum 3 time slots reached. Remove a slot to add another.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="bg-gray-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Select Your Subject</h3>
              <p className="text-xs sm:text-sm text-gray-600">Choose the subject you want to teach</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {allSubjects.map((subject) => (
                <button
                  key={subject._id}
                  type="button"
                  onClick={() => {
                    const newSubject: SubjectData = {
                      _id: subject._id,
                      name: subject.name,
                      selectedTopics: [],
                      teachingModes: [
                        { type: 'online', rate: 0, enabled: false },
                        { type: 'home-visit', rate: 0, enabled: false },
                        { type: 'group', rate: 0, enabled: false }
                      ],
                      availability: DAYS_OF_WEEK.map(day => ({
                        day,
                        slots: []
                      }))
                    };
                    onSubjectsChange([newSubject]);
                  }}
                  className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
                >
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mb-2 sm:mb-3" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 text-center">{subject.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    Click to select this subject and configure your teaching details
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTutorProfileSubjects; 