import React, { useState } from 'react';
import { BookOpen, Clock, DollarSign, MapPin, Plus, X, Check, AlertCircle } from 'lucide-react';
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
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [showAddSubject, setShowAddSubject] = useState(false);

  const addSubject = () => {
    if (!selectedSubjectId) return;

    const subject = allSubjects.find(s => s._id === selectedSubjectId);
    if (!subject) return;

    // Check if a subject is already selected
    if (subjects.length > 0) {
      toast.error('You can only select one subject. Please remove the current subject first.');
      return;
    }

    const newSubject: SubjectData = {
      _id: selectedSubjectId,
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
    setSelectedSubjectId('');
    setShowAddSubject(false);
  };

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
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-gray-900">
          <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
          Subject & Teaching Details
        </h2>
        {subjects.length === 0 && (
          <button
            type="button"
            onClick={() => setShowAddSubject(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Select Subject
          </button>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Your Subject</h3>
            <p className="text-sm text-gray-600 mb-4">Choose the subject you want to teach</p>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a subject</option>
              {allSubjects
                .filter(subject => !subjects.find(s => s._id === subject._id))
                .map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={addSubject}
                disabled={!selectedSubjectId}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select
              </button>
              <button
                onClick={() => {
                  setShowAddSubject(false);
                  setSelectedSubjectId('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Display */}
      <div className="space-y-6">
        {subjects.map((subject) => {
          const availableTopics = getTopicsBySubject(subject._id);
          
          return (
            <div key={subject._id} className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
              {/* Subject Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-600">Your selected subject</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(subject._id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Topics Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Best Topics (Max 5)</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    subject.selectedTopics.length >= 5 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {subject.selectedTopics.length}/5 selected
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableTopics.map((topic) => {
                    const isSelected = subject.selectedTopics.includes(topic._id);
                    const isDisabled = !isSelected && subject.selectedTopics.length >= 5;
                    
                    return (
                      <label
                        key={topic._id}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
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
                        <Check className={`w-4 h-4 mr-2 ${
                          isSelected ? 'text-primary-600' : 'text-transparent'
                        }`} />
                        <span className="text-sm font-medium">{topic.name}</span>
                      </label>
                    );
                  })}
                </div>
                {subject.selectedTopics.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Select up to 5 topics you're best at teaching
                  </p>
                )}
                {subject.selectedTopics.length >= 5 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Maximum 5 topics selected. Deselect a topic to add another.
                  </p>
                )}
              </div>

              {/* Teaching Modes */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Teaching Modes & Rates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subject.teachingModes.map((mode) => (
                    <div key={mode.type} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={mode.enabled}
                            onChange={(e) => updateTeachingMode(subject._id, mode.type, { enabled: e.target.checked })}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {TEACHING_MODE_LABELS[mode.type]}
                          </span>
                        </label>
                      </div>
                      {mode.enabled && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">$</span>
                          <input
                            type="number"
                            value={mode.rate}
                            onChange={(e) => updateTeachingMode(subject._id, mode.type, { rate: Number(e.target.value) })}
                            placeholder="0"
                            min="0"
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          />
                          <span className="text-sm text-gray-500 ml-2">/hour</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Available Time Slots
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subject.availability.map((dayAvailability) => (
                    <div key={dayAvailability.day} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700">{dayAvailability.day}</h5>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(subject._id, dayAvailability.day)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          + Add Slot
                        </button>
                      </div>
                      
                      {dayAvailability.slots.length === 0 ? (
                        <p className="text-xs text-gray-500">No time slots added</p>
                      ) : (
                        <div className="space-y-2">
                          {dayAvailability.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-2">
                              <select
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(subject._id, dayAvailability.day, slotIndex, 'start', e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {TIME_SLOTS.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <span className="text-xs text-gray-500">to</span>
                              <select
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(subject._id, dayAvailability.day, slotIndex, 'end', e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {TIME_SLOTS.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(subject._id, dayAvailability.day, slotIndex)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subject selected yet</h3>
            <p className="text-gray-500 mb-4">Select your subject to start teaching and set your availability</p>
            <button
              type="button"
              onClick={() => setShowAddSubject(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Select Your Subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTutorProfileSubjects; 