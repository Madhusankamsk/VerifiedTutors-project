import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Video, Home, BookOpen, DollarSign, Hash, ChevronRight, ChevronLeft, Phone, CheckCircle, User, ArrowRight } from 'lucide-react';

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
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
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
        <div className="p-6 min-h-[400px] flex flex-col">
          {/* Step 1: Duration & Method */}
          {currentStep === 1 && (
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Duration</h3>
                <div className="grid grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        selectedDuration === duration
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-2" />
                      <div className="text-sm font-medium">{duration}h</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Method</h3>
                <div className="space-y-3">
                  {Object.entries(availableMethods).map(([method, isAvailable]) => 
                    isAvailable && (
                      <button
                        key={method}
                        onClick={() => setLearningMethod(method as LearningMethod)}
                        className={`w-full p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          learningMethod === method
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getLearningMethodIcon(method as LearningMethod)}
                          <span className="font-medium">{getLearningMethodLabel(method as LearningMethod)}</span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Topic Selection */}
          {currentStep === 2 && (
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Topic</h3>
                <p className="text-sm text-gray-600 mb-4">Choose a specific topic or skip for general tutoring</p>
              </div>

              {currentSubject && currentSubject.selectedTopics.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {currentSubject.selectedTopics.map((topic) => (
                    <button
                      key={topic._id}
                      onClick={() => setSelectedTopic(selectedTopic === topic._id ? '' : topic._id)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all transform hover:scale-105 ${
                        selectedTopic === topic._id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedTopic === topic._id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTopic === topic._id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{topic.name}</div>
                          {topic.description && (
                            <div className="text-xs text-gray-500">{topic.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
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

          {/* Step 3: Combined Day & Time Selection */}
          {currentStep === 3 && (
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Day & Time</h3>
                <p className="text-sm text-gray-600 mb-4">Select your preferred day and time slot</p>
              </div>

              {availableDays.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {availableDays.map(({ day, slots }) => (
                    <div key={day} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">{day}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={`${day}-${slot.start}-${slot.end}`}
                            onClick={() => handleDayTimeSelection(day, `${slot.start} - ${slot.end}`)}
                            className={`p-3 rounded-lg border-2 transition-all transform hover:scale-105 ${
                              selectedDay === day && selectedTimeSlot === `${slot.start} - ${slot.end}`
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">{slot.start} - {slot.end}</span>
                            </div>
                          </button>
                        ))}
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

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
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