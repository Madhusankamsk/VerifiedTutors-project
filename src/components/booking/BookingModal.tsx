import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Video, Home, Users, BookOpen } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface Subject {
  _id: string;
  name: string;
  rates: {
    individual: number;
    group: number;
    online: number;
  };
  availability: {
    day: string;
    slots: TimeSlot[];
  }[];
}

interface TutorAvailability {
  subject: string;
  availability: {
    [key: string]: TimeSlot[]; // key is day name
  };
}

type LearningMethod = 'online' | 'individual' | 'group';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    subject: string;
    day: string; 
    timeSlot: string; 
    contactNumber: string; 
    learningMethod: LearningMethod 
  }) => void;
  tutorAvailability: TutorAvailability;
  selectedSubject: string;
  availableMethods?: {
    online: boolean;
    individual: boolean;
    group: boolean;
  };
  subjects?: Subject[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  tutorAvailability,
  selectedSubject,
  availableMethods = { online: true, individual: true, group: true },
  subjects = []
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [learningMethod, setLearningMethod] = useState<LearningMethod>('online');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0]._id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (selectedDay && tutorAvailability) {
      const slots = tutorAvailability.availability[selectedDay] || [];
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDay, tutorAvailability]);

  // Set default learning method based on available methods
  useEffect(() => {
    if (availableMethods.online) {
      setLearningMethod('online');
    } else if (availableMethods.individual) {
      setLearningMethod('individual');
    } else if (availableMethods.group) {
      setLearningMethod('group');
    }
  }, [availableMethods]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the selected subject name
    const subject = subjects.find(s => s._id === selectedSubjectId)?.name || selectedSubject;
    
    onSubmit({
      subject,
      day: selectedDay,
      timeSlot: selectedTimeSlot,
      contactNumber,
      learningMethod
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Book a Session</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select your preferred subject, day, and time slot
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject selection */}
            {subjects.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject
                </label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                  >
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Day selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Day
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const hasAvailability = tutorAvailability.availability[day]?.length > 0;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      disabled={!hasAvailability}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        selectedDay === day
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : hasAvailability
                            ? 'border-gray-200 hover:border-primary-300 text-gray-700'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Learning Method selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Learning Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableMethods.online && (
                  <button
                    type="button"
                    onClick={() => setLearningMethod('online')}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      learningMethod === 'online'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Online
                  </button>
                )}
                {availableMethods.individual && (
                  <button
                    type="button"
                    onClick={() => setLearningMethod('individual')}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      learningMethod === 'individual'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Home Visit
                  </button>
                )}
                {availableMethods.group && (
                  <button
                    type="button"
                    onClick={() => setLearningMethod('group')}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      learningMethod === 'group'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Group
                  </button>
                )}
              </div>
            </div>

            {/* Time slot selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    type="button"
                    onClick={() => setSelectedTimeSlot(`${slot.start} - ${slot.end}`)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      selectedTimeSlot === `${slot.start} - ${slot.end}`
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {slot.start} - {slot.end}
                  </button>
                ))}
                {availableTimeSlots.length === 0 && selectedDay && (
                  <p className="col-span-2 text-sm text-gray-500 text-center py-2">
                    No available time slots for {selectedDay}
                  </p>
                )}
                {!selectedDay && (
                  <p className="col-span-2 text-sm text-gray-500 text-center py-2">
                    Please select a day to view available time slots
                  </p>
                )}
              </div>
            </div>

            {/* Contact number input */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter your contact number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                minLength={10}
                maxLength={15}
                pattern="[0-9]*"
              />
              {contactNumber && contactNumber.length < 10 && (
                <p className="mt-1 text-sm text-red-600">
                  Contact number must be at least 10 digits
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTimeSlot || !selectedDay || !contactNumber || contactNumber.length < 10}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 