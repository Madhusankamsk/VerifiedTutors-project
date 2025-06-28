import React, { useState } from 'react';
import { useSubjects } from '../../contexts/SubjectContext';
import { Video, Home, Users, Plus, Trash2, Save, X, Check, Edit2 } from 'lucide-react';

// Define the Subject interface locally since it's not exported from the context
interface Subject {
  _id: string;
  name: string;
  topics: string[];
  description: string;
  isActive: boolean;
}

interface TutorSubject {
  _id: string;
  name: string;
  bestTopics: string[];
  rates: {
    individual: number;
    group: number;
    online: number;
  };
  availability: Array<{
    day: string;
    slots: Array<{
      start: string;
      end: string;
    }>;
  }>;
}

interface SubjectSelectorProps {
  selectedSubjects: TutorSubject[];
  onSubjectsChange: (subjects: TutorSubject[]) => void;
  onAddTimeSlot: (subjectId: string, day: string, start: string, end: string) => void;
  onRemoveTimeSlot: (subjectId: string, day: string, slotIndex: number) => void;
  onUpdateTimeSlot: (subjectId: string, day: string, slotIndex: number, start: string, end: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TEACHING_MODES = [
  { id: 'online', label: 'Online', icon: Video },
  { id: 'individual', label: 'Individual', icon: Home },
  { id: 'group', label: 'Group', icon: Users }
] as const;

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ 
  selectedSubjects, 
  onSubjectsChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateTimeSlot
}) => {
  const { subjects, loading, error } = useSubjects();
  const [editingSlot, setEditingSlot] = useState<{ day: string; index: number } | null>(null);
  const [tempSlotValues, setTempSlotValues] = useState<{ start: string; end: string } | null>(null);

  const handleSubjectSelect = (subject: Subject) => {
    const tutorSubject: TutorSubject = {
      _id: subject._id,
      name: subject.name,
      bestTopics: [],
      rates: {
        individual: 0,
        group: 0,
        online: 0
      },
      availability: []
    };
    onSubjectsChange([tutorSubject]); // Only allow one subject
  };

  const handleBestTopicToggle = (subjectId: string, topic: string) => {
    const updatedSubjects = selectedSubjects.map(subject => {
      if (subject._id === subjectId) {
        const currentTopics = subject.bestTopics || [];
        const newTopics = currentTopics.includes(topic)
          ? currentTopics.filter(t => t !== topic)
          : currentTopics.length < 5
            ? [...currentTopics, topic]
            : currentTopics;
        
        return {
          ...subject,
          bestTopics: newTopics
        };
      }
      return subject;
    });
    onSubjectsChange(updatedSubjects);
  };

  const handleRateChange = (subjectId: string, mode: keyof TutorSubject['rates'], value: number) => {
    const updatedSubjects = selectedSubjects.map(subject => {
      if (subject._id === subjectId) {
        return {
          ...subject,
          rates: {
            ...subject.rates,
            [mode]: value
          }
        };
      }
      return subject;
    });
    onSubjectsChange(updatedSubjects);
  };

  const handleRemoveSubject = (subjectId: string) => {
    const updatedSubjects = selectedSubjects.filter(subject => subject._id !== subjectId);
    onSubjectsChange(updatedSubjects);
  };

  const handleAddTimeSlot = (subjectId: string, day: string) => {
    const start = '09:00';
    const end = '10:00';
    onAddTimeSlot(subjectId, day, start, end);
  };

  const handleEditSlot = (day: string, index: number, start: string, end: string) => {
    setEditingSlot({ day, index });
    setTempSlotValues({ start, end });
  };

  const handleSaveSlot = (subjectId: string) => {
    if (editingSlot && tempSlotValues) {
      onUpdateTimeSlot(subjectId, editingSlot.day, editingSlot.index, tempSlotValues.start, tempSlotValues.end);
      setEditingSlot(null);
      setTempSlotValues(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setTempSlotValues(null);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Selection */}
      {selectedSubjects.length === 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Your Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.filter(subject => subject.isActive).map((subject) => (
              <button
                key={subject._id}
                onClick={() => handleSubjectSelect(subject)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <h4 className="font-medium text-gray-900">{subject.name}</h4>
                {subject.description && (
                  <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {subject.topics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {topic}
                    </span>
                  ))}
                  {subject.topics.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{subject.topics.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Subject Configuration */}
      {selectedSubjects.map((tutorSubject) => {
        const subject = subjects.find(s => s._id === tutorSubject._id);
        if (!subject) return null;

        return (
          <div key={tutorSubject._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                <p className="text-sm text-gray-600">Configure your expertise and availability</p>
              </div>
              <button
                onClick={() => handleRemoveSubject(tutorSubject._id)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Best Topics Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Select Your Best Topics (Max 5)
              </h4>
              <div className="flex flex-wrap gap-2">
                {subject.topics.map((topic) => {
                  const isSelected = tutorSubject.bestTopics.includes(topic);
                  const canSelect = isSelected || tutorSubject.bestTopics.length < 5;
                  
                  return (
                    <button
                      key={topic}
                      onClick={() => handleBestTopicToggle(tutorSubject._id, topic)}
                      disabled={!canSelect}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : canSelect
                            ? 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300'
                            : 'bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed'
                      }`}
                    >
                      {topic}
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {tutorSubject.bestTopics.length}/5 topics
              </p>
            </div>

            {/* Rates Configuration */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Set Your Rates (per hour)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEACHING_MODES.map((mode) => (
                  <div key={mode.id} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <mode.icon className="h-4 w-4" />
                      {mode.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tutorSubject.rates[mode.id]}
                      onChange={(e) => handleRateChange(tutorSubject._id, mode.id, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Set Your Availability</h4>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const daySlots = tutorSubject.availability.find(a => a.day === day)?.slots || [];
                  
                  return (
                    <div key={day} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-medium text-gray-700">{day}</h5>
                        <button
                          onClick={() => handleAddTimeSlot(tutorSubject._id, day)}
                          className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Slot
                        </button>
                      </div>
                      
                      {daySlots.length === 0 ? (
                        <p className="text-xs text-gray-500">No time slots added</p>
                      ) : (
                        <div className="space-y-2">
                          {daySlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {editingSlot?.day === day && editingSlot?.index === index ? (
                                <>
                                  <input
                                    type="time"
                                    value={tempSlotValues?.start || ''}
                                    onChange={(e) => setTempSlotValues(prev => ({ ...prev!, start: e.target.value }))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <span className="text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={tempSlotValues?.end || ''}
                                    onChange={(e) => setTempSlotValues(prev => ({ ...prev!, end: e.target.value }))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <button
                                    onClick={() => handleSaveSlot(tutorSubject._id)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm text-gray-700">
                                    {slot.start} - {slot.end}
                                  </span>
                                  <button
                                    onClick={() => handleEditSlot(day, index, slot.start, slot.end)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => onRemoveTimeSlot(tutorSubject._id, day, index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubjectSelector; 