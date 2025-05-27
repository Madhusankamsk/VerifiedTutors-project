import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile, TutorSubject } from '../../contexts/TutorContext';
import { useLocations, Location } from '../../contexts/LocationContext';
import { useSubjects, Subject } from '../../contexts/SubjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { X, Plus, Search, Save, Trash2, MapPin, BookOpen, GraduationCap, Briefcase, User, Phone, Mail, Clock } from 'lucide-react';
import LocationSelector from '../../components/location/LocationSelector';
import SubjectSelector from '../../components/subject/SubjectSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface FormData {
  phone: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: Array<{
    position: string;
    institution: string;
    duration: string;
    description: string;
  }>;
  subjects: Array<{
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
  }>;
  locations: Array<{
    _id: string;
    name: string;
    province: string;
  }>;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const EditTutorProfile: React.FC = () => {
  const { profile, loading, error, updateProfile } = useTutor();
  const { locations } = useLocations();
  const { subjects } = useSubjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    bio: '',
    gender: 'Male',
    education: [],
    experience: [],
    subjects: [],
    locations: []
  });

  useEffect(() => {
    // Check if user is authenticated and is a tutor
    if (!user) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }

    if (user.role !== 'tutor') {
      toast.error('Only tutors can access this page');
      navigate('/');
      return;
    }

    if (profile) {
      setFormData({
        phone: profile.phone || '',
        bio: profile.bio || '',
        gender: profile.gender || 'Male',
        education: profile.education || [],
        experience: profile.experience || [],
        subjects: profile.subjects.map(s => ({
          _id: s.subject._id,
          name: s.subject.name,
          category: s.subject.category,
          rates: s.rates || {
            individual: 0,
            group: 0,
            online: 0
          },
          availability: s.availability || []
        })) || [],
        locations: profile.locations.map(l => ({
          _id: l._id,
          name: l.name,
          province: l.level === 1 ? l.name : 
                    l.level === 2 ? (locations.find(p => p._id === l.parent) as Location)?.name || '' :
                    (locations.find(p => p._id === (locations.find(p2 => p2._id === l.parent) as Location)?.parent) as Location)?.name || ''
        })) || []
      });
    }
  }, [profile, locations, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiData: Partial<TutorProfile> = {
        phone: formData.phone,
        bio: formData.bio,
        gender: formData.gender,
        education: formData.education,
        experience: formData.experience,
        subjects: formData.subjects.map(s => {
          const subject = subjects.find(sub => sub._id === s._id);
          if (!subject) {
            throw new Error(`Subject with id ${s._id} not found`);
          }
          return {
            subject,
            rates: s.rates,
            availability: s.availability
          };
        }),
        locations: formData.locations.map(l => ({
          _id: l._id,
          name: l.name,
          level: 1,
          parent: null
        }))
      };
      await updateProfile(apiData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handleSubjectSelect = (selectedSubjects: Array<{ _id: string; name: string; category: string }>) => {
    setFormData(prev => ({
      ...prev,
      subjects: selectedSubjects.map(s => {
        const existingSubject = prev.subjects.find(p => p._id === s._id);
        return {
          ...s,
          rates: existingSubject?.rates || {
            individual: 0,
            group: 0,
            online: 0
          },
          availability: existingSubject?.availability || []
        };
      })
    }));
  };

  const handleLocationSelect = (selectedLocations: Array<{ _id: string; name: string; province: string }>) => {
    setFormData(prev => ({
      ...prev,
      locations: selectedLocations
    }));
  };

  const handleRateChange = (subjectId: string, rateType: 'individual' | 'group' | 'online', value: string) => {
    const rate = value === '' ? 0 : Math.max(0, Number(value));
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s._id === subjectId ? {
          ...s,
          rates: {
            ...s.rates,
            [rateType]: rate
          }
        } : s
      )
    }));
  };

  const addTimeSlot = (subjectId: string, day: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s._id === subjectId) {
          const dayAvailability = s.availability.find(a => a.day === day);
          if (dayAvailability) {
            return {
              ...s,
              availability: s.availability.map(a => 
                a.day === day ? {
                  ...a,
                  slots: [...a.slots, { start: '09:00', end: '10:00' }]
                } : a
              )
            };
          } else {
            return {
              ...s,
              availability: [...s.availability, {
                day,
                slots: [{ start: '09:00', end: '10:00' }]
              }]
            };
          }
        }
        return s;
      })
    }));
  };

  const removeTimeSlot = (subjectId: string, day: string, slotIndex: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s._id === subjectId) {
          return {
            ...s,
            availability: s.availability.map(a => 
              a.day === day ? {
                ...a,
                slots: a.slots.filter((_, i) => i !== slotIndex)
              } : a
            )
          };
        }
        return s;
      })
    }));
  };

  const updateTimeSlot = (subjectId: string, day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s._id === subjectId) {
          return {
            ...s,
            availability: s.availability.map(a => 
              a.day === day ? {
                ...a,
                slots: a.slots.map((slot, i) => 
                  i === slotIndex ? { ...slot, [field]: value } : slot
                )
              } : a
            )
          };
        }
        return s;
      })
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { position: '', institution: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-primary-100 mt-2">Update your teaching profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <Mail className="w-5 h-5 mr-2 text-primary-600" />
                About Me
              </h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Tell us about yourself, your teaching experience, and what makes you a great tutor..."
              />
            </div>

            {/* Teaching Subjects */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                Teaching Subjects
              </h2>
              <div className="space-y-6">
                <SubjectSelector
                  selectedSubjects={formData.subjects}
                  onSubjectsChange={handleSubjectSelect}
                />
                
                {formData.subjects.map((subject) => (
                  <div key={subject._id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-4">{subject.name}</h3>
                    
                    {/* Rates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Individual Rate ($/hour)
                        </label>
                        <input
                          type="number"
                          value={subject.rates.individual}
                          onChange={(e) => handleRateChange(subject._id, 'individual', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Group Rate ($/hour)
                        </label>
                        <input
                          type="number"
                          value={subject.rates.group}
                          onChange={(e) => handleRateChange(subject._id, 'group', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Online Rate ($/hour)
                        </label>
                        <input
                          type="number"
                          value={subject.rates.online}
                          onChange={(e) => handleRateChange(subject._id, 'online', e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Availability
                        </h4>
                      </div>
                      
                      {DAYS_OF_WEEK.map((day) => {
                        const dayAvailability = subject.availability.find(a => a.day === day);
                        return (
                          <div key={day} className="bg-white rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{day}</h5>
                              <button
                                type="button"
                                onClick={() => addTimeSlot(subject._id, day)}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                Add Time Slot
                              </button>
                            </div>
                            
                            {dayAvailability?.slots.map((slot, slotIndex) => (
                              <div key={slotIndex} className="flex items-center space-x-2 mt-2">
                                <select
                                  value={slot.start}
                                  onChange={(e) => updateTimeSlot(subject._id, day, slotIndex, 'start', e.target.value)}
                                  className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                  {TIME_SLOTS.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                                <span>to</span>
                                <select
                                  value={slot.end}
                                  onChange={(e) => updateTimeSlot(subject._id, day, slotIndex, 'end', e.target.value)}
                                  className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                  {TIME_SLOTS.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(subject._id, day, slotIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teaching Locations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Teaching Locations
              </h2>
              <LocationSelector
                selectedLocations={formData.locations}
                onLocationsChange={handleLocationSelect}
              />
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-800">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                  Education
                </h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={`education-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-800">Education #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].degree = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].institution = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input
                          type="number"
                          value={edu.year}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].year = parseInt(e.target.value);
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-800">
                  <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                  Experience
                </h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={`experience-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-800">Experience #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].position = e.target.value;
                            setFormData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={exp.institution}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].institution = e.target.value;
                            setFormData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].duration = e.target.value;
                            setFormData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].description = e.target.value;
                            setFormData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          rows={3}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfile;