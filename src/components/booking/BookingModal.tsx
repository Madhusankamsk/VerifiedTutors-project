import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Video, Home, BookOpen, DollarSign, Hash, ChevronRight, ChevronLeft, Phone, CheckCircle, User } from 'lucide-react';

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
    type: 'online' | 'home-visit';
    rate: number;
    enabled: boolean;
  }[];
  availability: {
    day: string;
    slots: TimeSlot[];
  }[];
  rates?: {
    individual: number;
    online: number;
  };
}

interface TutorAvailability {
  subject: string;
  availability: {
    [key: string]: TimeSlot[];
  };
}

type LearningMethod = 'online' | 'home-visit';
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
  availableMethods = { online: true, 'home-visit': true },
  subjects = [],
  tutorName = 'Tutor'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const totalSteps = 4; // Reduced from 5 to 4 steps

  // Get available days (only days with time slots)
  const getAvailableDays = () => {
    const availableDays: { day: string; slots: TimeSlot[] }[] = [];
    
    DAYS_OF_WEEK.forEach(day => {
      const daySlots = tutorAvailability.availability[day] || [];
      if (daySlots.length > 0) {
        // Filter slots based on selected duration
        const filteredSlots = daySlots.filter(slot => {
          const [startHour, startMin] = slot.start.split(':').map(Number);
          const [endHour, endMin] = slot.end.split(':').map(Number);
          
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;
          const slotDuration = (endTime - startTime) / 60;
          
          return slotDuration >= selectedDuration;
        });
        
        if (filteredSlots.length > 0) {
          availableDays.push({ day, slots: filteredSlots });
        }
      }
    });
    
    return availableDays;
  };

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
      setSelectedTopic('');
    }
  }, [selectedSubjectId, subjects]);

  // Set default learning method
  useEffect(() => {
    if (availableMethods.online) {
      setLearningMethod('online');
    } else if (availableMethods['home-visit']) {
      setLearningMethod('home-visit');
    }
  }, [availableMethods]);

  // Calculate total price
  useEffect(() => {
    if (currentSubject && selectedDuration) {
      let rate = 0;
      
      const teachingMode = currentSubject.teachingModes.find(mode => 
        mode.type === learningMethod && mode.enabled
      );
      
      if (teachingMode) {
        rate = teachingMode.rate;
      } else if (currentSubject.rates) {
        switch (learningMethod) {
          case 'online':
            rate = currentSubject.rates.online;
            break;
          case 'home-visit':
            rate = currentSubject.rates.individual;
            break;
        }
      }
      
      setTotalPrice(rate * selectedDuration);
    }
  }, [currentSubject, selectedDuration, learningMethod]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedDay('');
      setSelectedTimeSlot('');
      setSelectedDuration(1);
      setSelectedTopic('');
      setContactNumber('');
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
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

  const handleDayTimeSelection = (day: string, timeSlot: string) => {
    setSelectedDay(day);
    setSelectedTimeSlot(timeSlot);
  };

  // Default to first available day when entering Step 3
  useEffect(() => {
    if (currentStep === 3) {
      const days = getAvailableDays();
      if (days.length > 0 && !selectedDay) {
        setSelectedDay(days[0].day);
      }
    }
  }, [currentStep, tutorAvailability, selectedDuration, selectedDay]);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-IN')}`;
  };

  const getLearningMethodIcon = (method: LearningMethod) => {
    switch (method) {
      case 'online':
        return <Video className="w-5 h-5" />;
      case 'home-visit':
        return <Home className="w-5 h-5" />;
    }
  };

  const getLearningMethodLabel = (method: LearningMethod) => {
    switch (method) {
      case 'online':
        return 'Online Session';
      case 'home-visit':
        return 'Home Visit';
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Duration & Method';
      case 2: return 'Select Topic';
      case 3: return 'Choose Day & Time';
      case 4: return 'Contact & Confirm';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedDuration && learningMethod;
      case 2: return true; // Topic is optional
      case 3: return selectedDay && selectedTimeSlot;
      case 4: return contactNumber && contactNumber.length >= 10;
      default: return false;
    }
  };

  if (!isOpen) return null;

  const availableDays = getAvailableDays();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 -m-2"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-8">
            <h2 className="text-xl font-bold mb-1">Book a Session</h2>
            <p className="text-blue-100 text-sm">with {tutorName}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-blue-100">Step {currentStep} of {totalSteps}</span>
              <span className="text-xs text-blue-100">{getStepTitle(currentStep)}</span>
            </div>
            <div className="w-full bg-blue-800/30 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto">
          {/* Step 1: Duration & Method (Bubble UI) */}
          {currentStep === 1 && (
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Duration</h3>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((duration) => {
                    const isActive = selectedDuration === duration;
                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSelectedDuration(duration)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        aria-pressed={isActive}
                      >
                        <Clock className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{duration} hour{duration > 1 ? 's' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Method</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(availableMethods).map(([method, isAvailable]) => {
                    if (!isAvailable) return null;
                    const isActive = learningMethod === (method as LearningMethod);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setLearningMethod(method as LearningMethod)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        aria-pressed={isActive}
                      >
                        {getLearningMethodIcon(method as LearningMethod)}
                        <span>{getLearningMethodLabel(method as LearningMethod)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Topic Selection (Bubble UI) */}
          {currentStep === 2 && (
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Topic</h3>
                <p className="text-sm text-gray-600 mb-4">Choose a specific topic or skip for general tutoring</p>
              </div>

              {currentSubject && currentSubject.selectedTopics.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {currentSubject.selectedTopics.map((topic) => {
                      const isActive = selectedTopic === topic._id;
                      return (
                        <button
                          key={topic._id}
                          type="button"
                          onClick={() => setSelectedTopic(isActive ? '' : topic._id)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-all ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                          aria-pressed={isActive}
                          title={topic.description || topic.name}
                        >
                          <Hash className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className="truncate max-w-[12rem] sm:max-w-[16rem]">{topic.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No specific topics available</p>
                  <p className="text-sm mt-1">You'll have general tutoring session</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Combined Day & Time Selection (Bubble UI, responsive) */}
          {currentStep === 3 && (
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Day & Time</h3>
                <p className="text-sm text-gray-600 mb-4">Select your preferred day and time slot</p>
              </div>

              {availableDays.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {availableDays.map(({ day, slots }) => (
                    <div key={day} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white text-gray-800 border border-gray-200">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {day}
                        </span>
                      </div>
                      <div className="-mx-1 px-1 flex gap-2 overflow-x-auto">
                        {slots.map((slot) => {
                          const isActive = selectedDay === day && selectedTimeSlot === `${slot.start} - ${slot.end}`;
                          return (
                            <button
                              key={`${day}-${slot.start}-${slot.end}`}
                              onClick={() => handleDayTimeSelection(day, `${slot.start} - ${slot.end}`)}
                              className={`shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-sm border transition-all ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                              aria-pressed={isActive}
                              title={`${slot.start} - ${slot.end}`}
                            >
                              {slot.start} - {slot.end}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No available time slots</p>
                  <p className="text-sm mt-1">Try selecting a different duration</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Contact & Confirm */}
          {currentStep === 4 && (
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your contact number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                {contactNumber && contactNumber.length < 10 && (
                  <p className="mt-2 text-sm text-red-600">
                    Contact number must be at least 10 digits
                  </p>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{selectedDuration} hour{selectedDuration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{getLearningMethodLabel(learningMethod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Day:</span>
                    <span className="font-medium">{selectedDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTimeSlot}</span>
                  </div>
                  {selectedTopic && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Topic:</span>
                      <span className="font-medium">{currentSubject?.selectedTopics.find(t => t._id === selectedTopic)?.name}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          </div>
          {/* Navigation */}
          <div className="shrink-0 flex justify-between items-center pt-4 pb-2 border-t mt-4 bg-white">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Book Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 