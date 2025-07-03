import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Video, Home, Users, BookOpen, DollarSign, Hash } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface Topic {
  _id: string;
  name: string;
  description?: string;
}

interface Subject {
  _id: string;
  name: string;
  selectedTopics: Topic[];
  teachingModes: {
    type: 'online' | 'home-visit' | 'group';
    rate: number;
    enabled: boolean;
  }[];
  availability: {
    day: string;
    slots: TimeSlot[];
  }[];
  // Legacy rates for backward compatibility
  rates?: {
    individual: number;
    group: number;
    online: number;
  };
}

interface TutorAvailability {
  subject: string;
  availability: {
    [key: string]: TimeSlot[]; // key is day name
  };
}

type LearningMethod = 'online' | 'home-visit' | 'group';
type Duration = 1 | 2 | 3;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    subject: string;
    topics: string[];
    day: string; 
    timeSlot: string; 
    duration: Duration;
    contactNumber: string; 
    learningMethod: LearningMethod;
    totalPrice: number;
  }) => void;
  tutorAvailability: TutorAvailability;
  selectedSubject: string;
  availableMethods?: {
    online: boolean;
    'home-visit': boolean;
    group: boolean;
  };
  subjects?: Subject[];
  tutorName?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATION_OPTIONS = [1, 2, 3] as const;

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  tutorAvailability,
  selectedSubject,
  availableMethods = { online: true, 'home-visit': true, group: true },
  subjects = [],
  tutorName = 'Tutor'
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<Duration>(1);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [contactNumber, setContactNumber] = useState('');
  const [learningMethod, setLearningMethod] = useState<LearningMethod>('online');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Initialize selected subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0]._id);
    }
  }, [subjects, selectedSubjectId]);

  // Update current subject when selection changes
  useEffect(() => {
    if (selectedSubjectId && subjects.length > 0) {
      const subject = subjects.find(s => s._id === selectedSubjectId);
      setCurrentSubject(subject || null);
      setSelectedTopic(''); // Reset topic when subject changes
    }
  }, [selectedSubjectId, subjects]);

  // Update available time slots based on selected day, duration, and tutor availability
  useEffect(() => {
    if (selectedDay && tutorAvailability && selectedDuration) {
      const slots = tutorAvailability.availability[selectedDay] || [];
      
      // Filter slots based on duration to ensure we have enough time
      const filteredSlots = slots.filter(slot => {
        const [startHour, startMin] = slot.start.split(':').map(Number);
        const [endHour, endMin] = slot.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        const slotDuration = (endTime - startTime) / 60; // Convert to hours
        
        return slotDuration >= selectedDuration;
      });
      
      setAvailableTimeSlots(filteredSlots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDay, tutorAvailability, selectedDuration]);

  // Set default learning method based on available methods
  useEffect(() => {
    if (availableMethods.online) {
      setLearningMethod('online');
    } else if (availableMethods['home-visit']) {
      setLearningMethod('home-visit');
    } else if (availableMethods.group) {
      setLearningMethod('group');
    }
  }, [availableMethods]);

  // Calculate total price based on duration and learning method
  useEffect(() => {
    if (currentSubject && selectedDuration) {
      let rate = 0;
      
      // Get rate from teaching modes
      const teachingMode = currentSubject.teachingModes.find(mode => 
        mode.type === learningMethod && mode.enabled
      );
      
      if (teachingMode) {
        rate = teachingMode.rate;
      } else if (currentSubject.rates) {
        // Fallback to legacy rates
        switch (learningMethod) {
          case 'online':
            rate = currentSubject.rates.online;
            break;
          case 'home-visit':
            rate = currentSubject.rates.individual;
            break;
          case 'group':
            rate = currentSubject.rates.group;
            break;
        }
      }
      
      setTotalPrice(rate * selectedDuration);
    }
  }, [currentSubject, selectedDuration, learningMethod]);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(selectedTopic === topicId ? '' : topicId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSubject) return;
    
    onSubmit({
      subject: currentSubject.name,
      topics: selectedTopic ? [selectedTopic] : [],
      day: selectedDay,
      timeSlot: selectedTimeSlot,
      duration: selectedDuration,
      contactNumber,
      learningMethod,
      totalPrice
    });
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-IN')}`;
  };

  const getLearningMethodIcon = (method: LearningMethod) => {
    switch (method) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'home-visit':
        return <Home className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
    }
  };

  const getLearningMethodLabel = (method: LearningMethod) => {
    switch (method) {
      case 'online':
        return 'Online';
      case 'home-visit':
        return 'Home Visit';
      case 'group':
        return 'Group';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-2 -m-2"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="pr-12">
            <h2 className="text-2xl font-semibold text-gray-900">Book a Session</h2>
            <p className="mt-1 text-sm text-gray-500">
              Book a session with {tutorName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject selection */}
            {subjects.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Subject
                </label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                  >
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Available Topics */}
            {currentSubject && currentSubject.selectedTopics.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a Topic (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSubject.selectedTopics.map((topic) => (
                    <button
                      key={topic._id}
                      type="button"
                      onClick={() => handleTopicSelect(topic._id)}
                      className={`p-4 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        selectedTopic === topic._id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg shadow-primary-100'
                          : 'border-gray-200 hover:border-primary-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedTopic === topic._id
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTopic === topic._id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">{topic.name}</div>
                          {topic.description && (
                            <div className="text-xs text-gray-500 leading-relaxed">{topic.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedTopic && (
                  <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">
                        Selected: {currentSubject.selectedTopics.find(t => t._id === selectedTopic)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Session Duration
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DURATION_OPTIONS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-4 py-3 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      selectedDuration === duration
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{duration} Hour{duration > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(availableMethods).map(([method, isAvailable]) => 
                  isAvailable && (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setLearningMethod(method as LearningMethod)}
                      className={`px-4 py-3 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        learningMethod === method
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 text-gray-700'
                      }`}
                    >
                      {getLearningMethodIcon(method as LearningMethod)}
                      <span>{getLearningMethodLabel(method as LearningMethod)}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Day
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const hasAvailability = tutorAvailability.availability[day]?.length > 0;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      disabled={!hasAvailability}
                      className={`px-3 py-3 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        selectedDay === day
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : hasAvailability
                            ? 'border-gray-200 hover:border-primary-300 text-gray-700'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{day.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Time Slots
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    type="button"
                    onClick={() => setSelectedTimeSlot(`${slot.start} - ${slot.end}`)}
                    className={`px-4 py-3 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      selectedTimeSlot === `${slot.start} - ${slot.end}`
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{slot.start} - {slot.end}</span>
                  </button>
                ))}
                {availableTimeSlots.length === 0 && selectedDay && (
                  <div className="col-span-2 sm:col-span-3 text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No available time slots for {selectedDay}</p>
                    <p className="text-sm mt-1">Try selecting a different day or duration</p>
                  </div>
                )}
                {!selectedDay && (
                  <div className="col-span-2 sm:col-span-3 text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Please select a day to view available time slots</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-3">
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter your contact number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                minLength={10}
                maxLength={15}
                pattern="[0-9]*"
              />
              {contactNumber && contactNumber.length < 10 && (
                <p className="mt-2 text-sm text-red-600">
                  Contact number must be at least 10 digits
                </p>
              )}
            </div>

            {/* Price Summary */}
            {totalPrice > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Total Price</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{formatPrice(totalPrice)}</div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(totalPrice / selectedDuration)} × {selectedDuration} hour{selectedDuration > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTimeSlot || !selectedDay || !contactNumber || contactNumber.length < 10}
                className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Book Session - {formatPrice(totalPrice)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 