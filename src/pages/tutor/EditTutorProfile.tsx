import React, { useState, useEffect } from 'react';
import { useTutor } from '../../contexts/TutorContext';
import { useLocations } from '../../contexts/LocationContext';
import { useSubjects } from '../../contexts/SubjectContext';
import { toast } from 'react-toastify';
import { X, Plus, Search } from 'lucide-react';

type Gender = 'Male' | 'Female' | 'Other';

interface Location {
  _id: string;
  name: string;
  province: string;
}

interface Subject {
  _id: string;
  name: string;
  category: string;
}

const EditTutorProfile = () => {
  const { tutor, loading: tutorLoading, error: tutorError, updateTutorProfile } = useTutor();
  const { locations = [], loading: locationsLoading, error: locationsError } = useLocations();
  const { subjects = [], loading: subjectsLoading, error: subjectsError } = useSubjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  
  const [formData, setFormData] = useState({
    gender: 'Other' as Gender,
    mobileNumber: '',
    locations: [] as Array<{ _id: string; name: string; province: string }>,
    subjects: [] as Array<{ _id: string; name: string; category: string }>,
    bio: '',
    hourlyRate: 0,
    education: [] as Array<{ degree: string; institution: string; year: number }>,
    experience: [] as Array<{ title: string; company: string; duration: string; description: string }>,
  });

  // Get unique provinces from locations
  const provinces = Array.from(new Set(locations.map(loc => loc.province))).sort();

  // Get unique categories from subjects
  const categories = Array.from(new Set(subjects.map(sub => sub.category))).sort();

  // Filter locations when province changes or search changes
  useEffect(() => {
    let filtered = locations;
    
    if (selectedProvince) {
      filtered = filtered.filter(loc => loc.province === selectedProvince);
    }
    
    if (locationSearch) {
      const searchLower = locationSearch.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(searchLower) || 
        loc.province.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredLocations(filtered);
  }, [selectedProvince, locations, locationSearch]);

  // Filter subjects when category changes or search changes
  useEffect(() => {
    let filtered = subjects;
    
    if (selectedCategory) {
      filtered = filtered.filter(sub => sub.category === selectedCategory);
    }
    
    if (subjectSearch) {
      const searchLower = subjectSearch.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchLower) || 
        sub.category.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredSubjects(filtered);
  }, [selectedCategory, subjects, subjectSearch]);

  // Initialize form data when tutor profile is loaded
  useEffect(() => {
    if (tutor) {
      setFormData({
        gender: (tutor.gender as Gender) || 'Other',
        mobileNumber: tutor.mobileNumber || '',
        locations: Array.isArray(tutor.locations) ? tutor.locations : [],
        subjects: Array.isArray(tutor.subjects) ? tutor.subjects : [],
        bio: tutor.bio || '',
        hourlyRate: tutor.hourlyRate || 0,
        education: Array.isArray(tutor.education) ? tutor.education : [],
        experience: Array.isArray(tutor.experience) ? tutor.experience : [],
      });
      
      // Set initial province if tutor has locations
      if (tutor.locations?.length > 0) {
        setSelectedProvince(tutor.locations[0].province);
      }
      
      // Set initial category if tutor has subjects
      if (tutor.subjects?.length > 0) {
        setSelectedCategory(tutor.subjects[0].category);
      }
    }
  }, [tutor]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
  };

  const handleLocationSelect = (location: Location) => {
    setFormData(prev => {
      const exists = prev.locations.some(loc => loc._id === location._id);
      if (exists) {
        return {
          ...prev,
          locations: prev.locations.filter(loc => loc._id !== location._id)
        };
      } else {
        return {
          ...prev,
          locations: [...prev.locations, location]
        };
      }
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setFormData(prev => {
      const exists = prev.subjects.some(sub => sub._id === subject._id);
      if (exists) {
        return {
          ...prev,
          subjects: prev.subjects.filter(sub => sub._id !== subject._id)
        };
      } else {
        return {
          ...prev,
          subjects: [...prev.subjects, subject]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // First validate the form data
      if (!formData.mobileNumber || !formData.gender) {
        throw new Error('Please fill in all required fields');
      }

      // Make sure locations is an array
      if (!Array.isArray(formData.locations) || formData.locations.length === 0) {
        throw new Error('Please select at least one teaching location');
      }

      // Make sure subjects is an array
      if (!Array.isArray(formData.subjects) || formData.subjects.length === 0) {
        throw new Error('Please select at least one subject');
      }

      // Update the profile
      await updateTutorProfile(formData);

      // Show success message
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }],
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  if (tutorLoading || locationsLoading || subjectsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tutorError || locationsError || subjectsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{tutorError || locationsError || subjectsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">Tutor profile not found. Please create a profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                pattern="[0-9]{10}"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter 10-digit mobile number"
                required
              />
            </div>

            <div>
              <label htmlFor="locations" className="block text-sm font-medium text-gray-700">
                Teaching Locations
              </label>
              <select
                id="locations"
                name="locations"
                multiple
                value={formData.locations.map(loc => loc._id)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                {Array.isArray(locations) && locations.map((location) => (
                  <option 
                    key={location._id} 
                    value={location._id}
                    data-province={location.province}
                  >
                    {location.name}, {location.province}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple locations</p>
            </div>

            <div>
              <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">
                Teaching Subjects
              </label>
              <select
                id="subjects"
                name="subjects"
                multiple
                value={formData.subjects.map(sub => sub._id)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                {Array.isArray(subjects) && subjects.map(subject => (
                  <option 
                    key={subject._id} 
                    value={subject._id} 
                    data-category={subject.category}
                  >
                    {subject.name} ({subject.category})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple subjects</p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Tell us about yourself"
                maxLength={1000}
              />
              <p className="mt-1 text-sm text-gray-500">{formData.bio.length}/1000 characters</p>
            </div>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Hourly Rate</h2>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">$</span>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            <span className="text-gray-600 ml-2">per hour</span>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education</h2>
            <button
              type="button"
              onClick={addEducation}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Add Education
            </button>
          </div>
          <div className="space-y-4">
            {formData.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="Degree"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  placeholder="Institution"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    placeholder="Year"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Experience</h2>
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    placeholder="Job Title"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    placeholder="Company"
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <input
                  type="text"
                  value={exp.duration}
                  onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                  placeholder="Duration (e.g., 2018-2020)"
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <textarea
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  placeholder="Description of responsibilities and achievements"
                  rows={3}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Locations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Teaching Locations</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                Select Province
              </label>
              <select
                id="province"
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Provinces</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Locations
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search locations..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Available Locations</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredLocations.map(location => (
                  <button
                    key={location._id}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      formData.locations.some(loc => loc._id === location._id)
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {location.name}, {location.province}
                  </button>
                ))}
                {filteredLocations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No locations found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Locations</h3>
              <div className="flex flex-wrap gap-2">
                {formData.locations.map(location => (
                  <span
                    key={location._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {location.name}, {location.province}
                    <button
                      type="button"
                      onClick={() => handleLocationSelect(location)}
                      className="ml-1 inline-flex text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {formData.locations.length === 0 && (
                  <p className="text-sm text-gray-500">No locations selected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Subjects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Teaching Subjects</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Subjects
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Search subjects..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Available Subjects</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredSubjects.map(subject => (
                  <button
                    key={subject._id}
                    type="button"
                    onClick={() => handleSubjectSelect(subject)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      formData.subjects.some(sub => sub._id === subject._id)
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {subject.name} ({subject.category})
                  </button>
                ))}
                {filteredSubjects.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No subjects found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map(subject => (
                  <span
                    key={subject._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {subject.name} ({subject.category})
                    <button
                      type="button"
                      onClick={() => handleSubjectSelect(subject)}
                      className="ml-1 inline-flex text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {formData.subjects.length === 0 && (
                  <p className="text-sm text-gray-500">No subjects selected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTutorProfile;