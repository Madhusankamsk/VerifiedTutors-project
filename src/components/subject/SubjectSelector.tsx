import React, { useState } from 'react';
import { useSubjects, Subject } from '../../contexts/SubjectContext';
import { Video, Home, Users, Plus, Trash2, Save, X } from 'lucide-react';

interface TutorSubject {
  _id: string;
  name: string;
  category: string;
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
  onAddTimeSlot?: (subjectId: string, day: string) => void;
  onRemoveTimeSlot?: (subjectId: string, day: string, slotIndex: number) => void;
  onUpdateTimeSlot?: (subjectId: string, day: string, slotIndex: number, field: 'start' | 'end', value: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TEACHING_MODES = [
  { id: 'online', label: 'Online', icon: Video },
  { id: 'individual', label: 'Home Visit', icon: Home },
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
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');
  const [editingSlot, setEditingSlot] = useState<{ day: string; index: number } | null>(null);
  const [tempSlotValues, setTempSlotValues] = useState<{ start: string; end: string } | null>(null);

  // Get unique education levels from subjects
  const educationLevels = React.useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    return [...new Set(subjects.map(subject => subject.educationLevel))];
  }, [subjects]);

  // Filter subjects based on selected education level
  const filteredSubjects = React.useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    
    return subjects.filter(subject => {
      const matchesEducationLevel = !selectedEducationLevel || subject.educationLevel === selectedEducationLevel;
      return matchesEducationLevel;
    });
  }, [subjects, selectedEducationLevel]);

  const handleSubjectSelect = (subject: Subject) => {
    const tutorSubject: TutorSubject = {
      _id: subject._id,
      name: subject.name,
      category: subject.category,
      rates: {
        individual: 0,
        group: 0,
        online: 0
      },
      availability: []
    };
    onSubjectsChange([tutorSubject]); // Only allow one subject
  };

  const handleTeachingModeToggle = (mode: 'online' | 'individual' | 'group') => {
    if (!selectedSubjects[0]) return;

    // Deep clone the subject to avoid mutating nested objects
    const updatedSubject = JSON.parse(JSON.stringify(selectedSubjects[0]));
    const currentRate = updatedSubject.rates[mode];

    // If rate is 0, enable the mode and set default rate
    if (currentRate === 0) {
      updatedSubject.rates[mode] = 500; // Default rate
    } else {
      // If rate exists, disable the mode and set rate to 0
      updatedSubject.rates[mode] = 0;
    }

    onSubjectsChange([updatedSubject]);
  };

  const handleRateChange = (type: 'individual' | 'group' | 'online', value: string) => {
    if (!selectedSubjects[0]) return;

    const newRate = parseFloat(value) || 0;
    // Deep clone the subject to avoid mutating nested objects
    const updatedSubject = JSON.parse(JSON.stringify(selectedSubjects[0]));
    updatedSubject.rates[type] = newRate;
    onSubjectsChange([updatedSubject]);
  };

  const handleAddTimeSlot = (day: string) => {
    if (!selectedSubjects[0]) return;
    
    if (onAddTimeSlot) {
      // Use parent component's function if provided
      onAddTimeSlot(selectedSubjects[0]._id, day);
      // Set the newly added slot as the editing slot
      const dayAvailability = selectedSubjects[0].availability.find(a => a.day === day);
      const slotIndex = dayAvailability ? dayAvailability.slots.length : 0;
      setEditingSlot({ day, index: slotIndex });
      setTempSlotValues({ start: '09:00', end: '10:00' });
    } else {
      const updatedSubject = { ...selectedSubjects[0] };
      const dayAvailability = updatedSubject.availability.find(a => a.day === day);

      if (dayAvailability) {
        dayAvailability.slots.push({ start: '09:00', end: '10:00' });
      } else {
        updatedSubject.availability.push({
          day,
          slots: [{ start: '09:00', end: '10:00' }]
        });
      }

      // Set the newly added slot as the editing slot
      const slotIndex = dayAvailability ? dayAvailability.slots.length - 1 : 0;
      setEditingSlot({ day, index: slotIndex });
      setTempSlotValues({ start: '09:00', end: '10:00' });
      
      onSubjectsChange([updatedSubject]);
    }
  };

  const handleTimeSlotChange = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    if (!tempSlotValues) return;
    
    setTempSlotValues({
      ...tempSlotValues,
      [field]: value
    });
  };

  const handleRemoveTimeSlot = (day: string, slotIndex: number) => {
    if (!selectedSubjects[0]) return;

    if (onRemoveTimeSlot) {
      // Use parent component's function if provided
      onRemoveTimeSlot(selectedSubjects[0]._id, day, slotIndex);
      
      // Reset editing state if the removed slot was being edited
      if (editingSlot && editingSlot.day === day && editingSlot.index === slotIndex) {
        setEditingSlot(null);
        setTempSlotValues(null);
      }
    } else {
      const updatedSubject = { ...selectedSubjects[0] };
      const dayAvailability = updatedSubject.availability.find(a => a.day === day);

      if (dayAvailability) {
        dayAvailability.slots.splice(slotIndex, 1);
        if (dayAvailability.slots.length === 0) {
          updatedSubject.availability = updatedSubject.availability.filter(a => a.day !== day);
        }
        onSubjectsChange([updatedSubject]);
        
        // Reset editing state if the removed slot was being edited
        if (editingSlot && editingSlot.day === day && editingSlot.index === slotIndex) {
          setEditingSlot(null);
          setTempSlotValues(null);
        }
      }
    }
  };
  
  const startEditingSlot = (day: string, slotIndex: number, slot: { start: string; end: string }) => {
    setEditingSlot({ day, index: slotIndex });
    setTempSlotValues({ ...slot });
  };
  
  const saveTimeSlot = () => {
    if (!selectedSubjects[0] || !editingSlot || !tempSlotValues) return;
    
    if (onUpdateTimeSlot) {
      // Use parent component's function if provided
      onUpdateTimeSlot(
        selectedSubjects[0]._id,
        editingSlot.day,
        editingSlot.index,
        'start',
        tempSlotValues.start
      );
      
      onUpdateTimeSlot(
        selectedSubjects[0]._id,
        editingSlot.day,
        editingSlot.index,
        'end',
        tempSlotValues.end
      );
    } else {
      const updatedSubject = { ...selectedSubjects[0] };
      const dayAvailability = updatedSubject.availability.find(a => a.day === editingSlot.day);
      
      if (dayAvailability) {
        dayAvailability.slots[editingSlot.index] = { ...tempSlotValues };
        onSubjectsChange([updatedSubject]);
      }
    }
    
    // Reset editing state
    setEditingSlot(null);
    setTempSlotValues(null);
  };
  
  const cancelEditTimeSlot = () => {
    setEditingSlot(null);
    setTempSlotValues(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Error loading subjects: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Education Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Education Level
        </label>
        <select
          value={selectedEducationLevel}
          onChange={(e) => setSelectedEducationLevel(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Levels</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Subject
        </label>
        <select
          value={selectedSubjects[0]?._id || ''}
          onChange={(e) => {
            const selectedSubject = filteredSubjects.find(subject => subject._id === e.target.value);
            if (selectedSubject) {
              handleSubjectSelect(selectedSubject);
            }
          }}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Select a subject</option>
          {filteredSubjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Subject Display with Rates and Availability */}
      {selectedSubjects[0] && (
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Subject</h3>
            <div className="flex items-center gap-1 px-3 py-2 bg-primary-100 text-primary-800 rounded-md text-sm">
              <span>{selectedSubjects[0].name}</span>
            </div>
          </div>

          {/* Teaching Modes & Rates */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Teaching Modes & Rates</h3>
            <div className="space-y-4">
              {TEACHING_MODES.map((mode) => {
                const Icon = mode.icon;
                const isEnabled = selectedSubjects[0].rates[mode.id] > 0;
                
                return (
                  <div 
                    key={mode.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      isEnabled 
                        ? 'border-primary-200 bg-primary-50' 
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                          {mode.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTeachingModeToggle(mode.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isEnabled 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {isEnabled && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className={`relative ${!isEnabled && 'opacity-50'}`}>
                      <input
                        type="number"
                        min="0"
                        value={selectedSubjects[0].rates[mode.id]}
                        onChange={(e) => handleRateChange(mode.id, e.target.value)}
                        disabled={!isEnabled}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isEnabled 
                            ? 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500' 
                            : 'border-gray-100 bg-gray-50'
                        } transition-all duration-200`}
                        placeholder="Rate per hour"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        LKR/hr
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Availability</h3>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const dayAvailability = selectedSubjects[0].availability.find(a => a.day === day);
                return (
                  <div key={day} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">{day}</h5>
                      <button
                        type="button"
                        onClick={() => handleAddTimeSlot(day)}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time Slot
                      </button>
                    </div>
                    {dayAvailability?.slots.map((slot, slotIndex) => {
                      const isEditing = editingSlot && 
                                       editingSlot.day === day && 
                                       editingSlot.index === slotIndex;
                      
                      return (
                        <div key={slotIndex} className="border border-gray-100 rounded-lg p-3 mb-2">
                          <div className="flex items-center space-x-3">
                            {isEditing ? (
                              <>
                                <input
                                  type="time"
                                  value={tempSlotValues?.start || slot.start}
                                  onChange={(e) => handleTimeSlotChange(day, slotIndex, 'start', e.target.value)}
                                  className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={tempSlotValues?.end || slot.end}
                                  onChange={(e) => handleTimeSlotChange(day, slotIndex, 'end', e.target.value)}
                                  className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                />
                              </>
                            ) : (
                              <>
                                <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-700">{slot.start}</div>
                                <span className="text-gray-500">to</span>
                                <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-700">{slot.end}</div>
                              </>
                            )}
                            
                            <div className="flex items-center ml-auto">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={saveTimeSlot}
                                    className="p-1.5 text-green-600 hover:text-green-700 transition-colors duration-200 mr-1"
                                    title="Save"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditTimeSlot}
                                    className="p-1.5 text-gray-600 hover:text-gray-700 transition-colors duration-200"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditingSlot(day, slotIndex, slot)}
                                    className="p-1.5 text-blue-600 hover:text-blue-700 transition-colors duration-200 mr-1"
                                    title="Edit"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTimeSlot(day, slotIndex)}
                                    className="p-1.5 text-red-600 hover:text-red-700 transition-colors duration-200"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector; 