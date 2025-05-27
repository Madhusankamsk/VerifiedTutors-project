import React, { useState, useEffect } from 'react';
import { useTutor, TutorProfile, TutorSubject } from '../../contexts/TutorContext';
import { useLocations, Location } from '../../contexts/LocationContext';
import { useSubjects, Subject } from '../../contexts/SubjectContext';
import { toast } from 'react-toastify';
import { X, Plus, Search, Save, Trash2, MapPin, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import LocationSelector from '../../components/location/LocationSelector';
import SubjectSelector from '../../components/subject/SubjectSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
    hourlyRate: number;
  }>;
  locations: Array<{
    _id: string;
    name: string;
    province: string;
  }>;
}

const EditTutorProfile: React.FC = () => {
  const { profile, loading, error, updateProfile } = useTutor();
  const { locations } = useLocations();
  const { subjects } = useSubjects();
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
          hourlyRate: s.rates?.individual || 0
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
  }, [profile, locations]);

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
            rates: {
              individual: Number(s.hourlyRate) || 0,
              group: 0,
              online: 0
            },
            availability: []
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
      subjects: selectedSubjects.map(s => ({
        ...s,
        hourlyRate: prev.subjects.find(p => p._id === s._id)?.hourlyRate || 0
      }))
    }));
  };

  const handleLocationSelect = (selectedLocations: Array<{ _id: string; name: string; province: string }>) => {
    setFormData(prev => ({
      ...prev,
      locations: selectedLocations
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

  const handleHourlyRateChange = (subjectId: string, value: string) => {
    const rate = value === '' ? 0 : Math.max(0, Number(value));
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s._id === subjectId ? { ...s, hourlyRate: rate } : s
      )
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
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bio</h2>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Tell us about yourself..."
          />
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
              onClick={addEducation}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </button>
          </div>
          <div className="space-y-4">
            {formData.education.map((edu, index) => (
              <div key={`education-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium">Education #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
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
              onClick={addExperience}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <div key={`experience-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium">Experience #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Teaching Subjects
          </h2>
          <SubjectSelector
            selectedSubjects={formData.subjects}
            onSubjectsChange={handleSubjectSelect}
          />
          <div className="mt-4 space-y-4">
            {formData.subjects.map((subject) => (
              <div key={subject._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{subject.category}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={subject.hourlyRate || ''}
                      onChange={(e) => handleHourlyRateChange(subject._id, e.target.value)}
                      className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Enter hourly rate"
                    />
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTutorProfile;