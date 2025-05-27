import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile, TutorSubject } from '../../contexts/TutorContext';
import { useLocations, Location } from '../../contexts/LocationContext';
import { useSubjects, Subject } from '../../contexts/SubjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { X, Plus, Save, Trash2, MapPin, BookOpen, GraduationCap, Briefcase, User, Phone, Mail, Clock, Upload } from 'lucide-react';
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
  const { profile, loading, error, updateProfile, uploadDocument, deleteDocument } = useTutor();
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
  const [uploading, setUploading] = useState(false);

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
        locations: formData.locations.map(l => {
          const location = locations.find(loc => loc._id === l._id);
          if (!location) {
            throw new Error(`Location with id ${l._id} not found`);
          }
          return {
            _id: location._id,
            name: location.name,
            level: location.level,
            parent: location.parent
          };
        })
      };
      await updateProfile(apiData);
      toast.success('Profile updated successfully');
      navigate('/tutor/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadDocument(file, 'qualification');
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId);
        toast.success('Document deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete document');
      }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h2>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
                }))}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </button>
            </div>
            <div className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].degree = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].institution = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input
                        type="number"
                        value={edu.year}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].year = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        min={1900}
                        max={new Date().getFullYear()}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newEducation = formData.education.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Experience
              </h2>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  experience: [...prev.experience, { position: '', institution: '', duration: '', description: '' }]
                }))}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {formData.experience.map((exp, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].position = e.target.value;
                            setFormData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Institution</label>
                        <input
                          type="text"
                          value={exp.institution}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].institution = e.target.value;
                            setFormData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const newExperience = [...formData.experience];
                          newExperience[index].duration = e.target.value;
                          setFormData(prev => ({ ...prev, experience: newExperience }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExperience = [...formData.experience];
                          newExperience[index].description = e.target.value;
                          setFormData(prev => ({ ...prev, experience: newExperience }));
                        }}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newExperience = formData.experience.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, experience: newExperience }));
                    }}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects & Rates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Subjects & Rates
            </h2>
            <div className="mb-4">
              <SubjectSelector
                selectedSubjects={formData.subjects}
                onSubjectsChange={handleSubjectSelect}
              />
            </div>
            <div className="space-y-6">
              {formData.subjects.map((subject) => (
                <div key={subject._id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">{subject.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Individual Rate</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={subject.rates.individual}
                          onChange={(e) => handleRateChange(subject._id, 'individual', e.target.value)}
                          className="pl-7 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Group Rate</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={subject.rates.group}
                          onChange={(e) => handleRateChange(subject._id, 'group', e.target.value)}
                          className="pl-7 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Online Rate</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={subject.rates.online}
                          onChange={(e) => handleRateChange(subject._id, 'online', e.target.value)}
                          className="pl-7 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
                    <div className="space-y-4">
                      {DAYS_OF_WEEK.map((day) => {
                        const dayAvailability = subject.availability.find(a => a.day === day);
                        return (
                          <div key={day} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium">{day}</h5>
                              <button
                                type="button"
                                onClick={() => addTimeSlot(subject._id, day)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Time Slot
                              </button>
                            </div>
                            {dayAvailability?.slots.map((slot, slotIndex) => (
                              <div key={slotIndex} className="flex items-center space-x-2 mt-2">
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateTimeSlot(subject._id, day, slotIndex, 'start', e.target.value)}
                                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                                />
                                <span>to</span>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateTimeSlot(subject._id, day, slotIndex, 'end', e.target.value)}
                                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(subject._id, day, slotIndex)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Teaching Locations
            </h2>
            <LocationSelector
              selectedLocations={formData.locations}
              onLocationsChange={handleLocationSelect}
            />
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Documents
            </h2>
            <div className="space-y-4">
              {profile?.documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                    {doc.verified && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDocumentDelete(doc._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload New Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="document-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="document-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleDocumentUpload}
                          disabled={uploading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTutorProfile;