import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile, TutorSubject } from '../../contexts/TutorContext';
import { useLocations, Location } from '../../contexts/LocationContext';
import { useSubjects, Subject } from '../../contexts/SubjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { X, Plus, Save, Trash2, MapPin, BookOpen, GraduationCap, Briefcase, User, Phone, Mail, Clock, Upload, Camera, Globe, Languages } from 'lucide-react';
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

const LANGUAGE_MEDIUMS = [
  { id: 'english', name: 'English', flag: '🇬🇧' },
  { id: 'sinhala', name: 'Sinhala', flag: '🇱🇰' },
  { id: 'tamil', name: 'Tamil', flag: '🇱🇰' },
];

const EditTutorProfile: React.FC = () => {
  const { profile, loading, error, updateProfile, uploadDocument, deleteDocument } = useTutor();
  const { locations } = useLocations();
  const { subjects } = useSubjects();
  const { user, uploadProfilePhoto } = useAuth();
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
      
      // Set the profile image if it exists
      if (profile.user?.profileImage) {
        setProfileImage(profile.user.profileImage);
      }
    }
  }, [profile, locations, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {      const apiData: Partial<TutorProfile> = {
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
        locations: formData.locations.map(l => l._id) as unknown as Location[]
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

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting profile photo upload...');
      
      const imageUrl = await uploadProfilePhoto(file);
      console.log('Profile photo uploaded successfully:', imageUrl);
      
      setProfileImage(imageUrl);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Profile photo upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediumToggle = (mediumId: string) => {
    setSelectedMediums(prev => 
      prev.includes(mediumId)
        ? prev.filter(id => id !== mediumId)
        : [...prev, mediumId]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 rounded-2xl p-8 shadow-lg">
            <p className="text-red-700 font-medium text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <button
              type="submit"
              form="profile-form"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </button>
          </div>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture & Basic Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl cursor-pointer ${
                        isUploading ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Camera className="w-8 h-8 text-white mb-1" />
                        <span className="text-white text-sm font-medium">Change Photo</span>
                      </div>
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                {/* Basic Information */}
                <div className="flex-1 space-y-6">
                  <h2 className="text-xl font-semibold flex items-center text-gray-900">
                    <User className="w-5 h-5 mr-2 text-primary-600" />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Language Mediums */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teaching Mediums
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {LANGUAGE_MEDIUMS.map((medium) => (
                        <button
                          key={medium.id}
                          type="button"
                          onClick={() => handleMediumToggle(medium.id)}
                          className={`flex items-center px-4 py-2 rounded-xl border transition-all duration-200 ${
                            selectedMediums.includes(medium.id)
                              ? 'bg-primary-50 border-primary-200 text-primary-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200'
                          }`}
                        >
                          <span className="mr-2">{medium.flag}</span>
                          {medium.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-900">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                  Education
                </h2>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
                  }))}
                  className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Education
                </button>
              </div>
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEducation = [...formData.education];
                              newEducation[index].degree = e.target.value;
                              setFormData(prev => ({ ...prev, education: newEducation }));
                            }}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const newEducation = [...formData.education];
                              newEducation[index].institution = e.target.value;
                              setFormData(prev => ({ ...prev, education: newEducation }));
                            }}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
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
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                        className="ml-4 p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-900">
                  <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                  Experience
                </h2>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    experience: [...prev.experience, { position: '', institution: '', duration: '', description: '' }]
                  }))}
                  className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => {
                                const newExperience = [...formData.experience];
                                newExperience[index].position = e.target.value;
                                setFormData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                            <input
                              type="text"
                              value={exp.institution}
                              onChange={(e) => {
                                const newExperience = [...formData.experience];
                                newExperience[index].institution = e.target.value;
                                setFormData(prev => ({ ...prev, experience: newExperience }));
                              }}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => {
                              const newExperience = [...formData.experience];
                              newExperience[index].duration = e.target.value;
                              setFormData(prev => ({ ...prev, experience: newExperience }));
                            }}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExperience = [...formData.experience];
                              newExperience[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, experience: newExperience }));
                            }}
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                        className="ml-4 p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects & Rates Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                Subjects & Rates
              </h2>
              <div className="mb-6">
                <SubjectSelector
                  selectedSubjects={formData.subjects}
                  onSubjectsChange={handleSubjectSelect}
                />
              </div>
              <div className="space-y-6">
                {formData.subjects.map((subject) => (
                  <div key={subject._id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                    <h3 className="font-semibold text-lg mb-4">{subject.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Individual Rate</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            value={subject.rates.individual}
                            onChange={(e) => handleRateChange(subject._id, 'individual', e.target.value)}
                            className="pl-7 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Rate</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            value={subject.rates.group}
                            onChange={(e) => handleRateChange(subject._id, 'group', e.target.value)}
                            className="pl-7 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Online Rate</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            value={subject.rates.online}
                            onChange={(e) => handleRateChange(subject._id, 'online', e.target.value)}
                            className="pl-7 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Availability</h4>
                      <div className="space-y-4">
                        {DAYS_OF_WEEK.map((day) => {
                          const dayAvailability = subject.availability.find(a => a.day === day);
                          return (
                            <div key={day} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">{day}</h5>
                                <button
                                  type="button"
                                  onClick={() => addTimeSlot(subject._id, day)}
                                  className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all duration-200"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Time Slot
                                </button>
                              </div>
                              {dayAvailability?.slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center space-x-3 mt-2">
                                  <input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => updateTimeSlot(subject._id, day, slotIndex, 'start', e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                  />
                                  <span className="text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateTimeSlot(subject._id, day, slotIndex, 'end', e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeTimeSlot(subject._id, day, slotIndex)}
                                    className="p-1.5 text-red-600 hover:text-red-700 transition-colors duration-200"
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

            {/* Locations Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Teaching Locations
              </h2>
              <LocationSelector
                selectedLocations={formData.locations}
                onLocationsChange={handleLocationSelect}
              />
            </div>

            {/* Documents Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                <Upload className="w-5 h-5 mr-2 text-primary-600" />
                Documents
              </h2>
              <div className="space-y-4">
                {profile?.documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                      {doc.verified && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDocumentDelete(doc._id)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Document
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-500 transition-colors duration-200">
                    <div className="space-y-2 text-center">
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfile;
