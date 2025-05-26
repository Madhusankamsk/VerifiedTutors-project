import React, { useState, useEffect } from 'react';
import { useTutor } from '../../contexts/TutorContext';
import { useLocations, Location } from '../../contexts/LocationContext';
import { useSubjects } from '../../contexts/SubjectContext';
import { toast } from 'react-toastify';
import { X, Plus, Search } from 'lucide-react';
import LocationSelector from '../../components/location/LocationSelector';
import SubjectSelector from '../../components/subject/SubjectSelector';

type Gender = 'Male' | 'Female' | 'Other';

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Subject {
  _id: string;
  name: string;
  category: string;
}

interface TutorLocation {
  _id: string;
  name: string;
  province: string;
}

interface FormData {
  gender: Gender;
  mobileNumber: string;
  locations: TutorLocation[];
  subjects: Array<{
    _id: string;
    name: string;
    category: string;
  }>;
  bio: string;
  hourlyRate: number;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: Experience[];
}

const EditTutorProfile = () => {
  const { tutor, loading: tutorLoading, error: tutorError, updateTutorProfile } = useTutor();
  const { locations = [], loading: locationsLoading, error: locationsError } = useLocations();
  const { subjects = [], loading: subjectsLoading, error: subjectsError } = useSubjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<string>('');
  const [availableTowns, setAvailableTowns] = useState<Location[]>([]);
  const [availableHomeTowns, setAvailableHomeTowns] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    gender: 'Male',
    mobileNumber: '',
    locations: [],
    subjects: [],
    bio: '',
    hourlyRate: 0,
    education: [],
    experience: []
  });

  // Get cities (level 1 locations)
  const cities = React.useMemo(() => {
    if (!Array.isArray(locations)) return [];
    return locations.filter(loc => loc.level === 1);
  }, [locations]);

  // Update available towns when city changes
  useEffect(() => {
    if (!selectedCity || !Array.isArray(locations)) {
      setAvailableTowns([]);
      setSelectedTown('');
      return;
    }

    const city = locations.find(loc => loc._id === selectedCity);
    if (city?.children) {
      setAvailableTowns(city.children);
    } else {
      setAvailableTowns([]);
    }
    setSelectedTown('');
  }, [selectedCity, locations]);

  // Update available home towns when town changes
  useEffect(() => {
    if (!selectedTown || !Array.isArray(locations)) {
      setAvailableHomeTowns([]);
      return;
    }

    const town = locations.find(loc => loc._id === selectedTown);
    if (town?.children) {
      setAvailableHomeTowns(town.children);
    } else {
      setAvailableHomeTowns([]);
    }
  }, [selectedTown, locations]);

  // Filter locations when province changes or search changes
  useEffect(() => {
    if (!Array.isArray(locations)) {
      setFilteredLocations([]);
      return;
    }

    let filtered = locations;
    
    if (selectedCity) {
      filtered = filtered.filter(loc => loc._id === selectedCity);
    }
    
    if (locationSearch) {
      const searchLower = locationSearch.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(searchLower) || 
        loc._id.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredLocations(filtered);
  }, [selectedCity, locations, locationSearch]);

  // Filter subjects when category changes or search changes
  useEffect(() => {
    if (!Array.isArray(subjects)) {
      setFilteredSubjects([]);
      return;
    }

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

  // Add this effect to extract unique categories from subjects
  useEffect(() => {
    if (Array.isArray(subjects)) {
      const uniqueCategories = [...new Set(subjects.map(subject => subject.category))];
      setCategories(uniqueCategories);
    }
  }, [subjects]);

  // Initialize form data when tutor profile is loaded
  useEffect(() => {
    if (tutor) {
      setFormData({
        gender: (tutor.gender as Gender) || 'Male',
        mobileNumber: tutor.mobileNumber || '',
        locations: Array.isArray(tutor.locations) ? tutor.locations : [],
        subjects: Array.isArray(tutor.subjects) ? tutor.subjects : [],
        bio: tutor.bio || '',
        hourlyRate: tutor.hourlyRate || 0,
        education: Array.isArray(tutor.education) ? tutor.education : [],
        experience: Array.isArray(tutor.experience) ? tutor.experience : []
      });
      
      // Set initial city if tutor has locations
      if (Array.isArray(tutor.locations) && tutor.locations.length > 0) {
        const firstLocation = tutor.locations[0];
        // Find the city based on the location's province
        const city = locations.find(loc => 
          loc.level === 1 && loc.name === firstLocation.province
        ) as Location;
        if (city) {
          setSelectedCity(city._id);
        }
      }
      
      // Set initial category if tutor has subjects
      if (Array.isArray(tutor.subjects) && tutor.subjects.length > 0) {
        setSelectedCategory(tutor.subjects[0].category);
      }
    }
  }, [tutor, locations]);

  const handleLocationSelect = (location: Location | TutorLocation) => {
    // If it's a TutorLocation (removing), just remove it
    if ('province' in location) {
      setFormData(prev => ({
        ...prev,
        locations: prev.locations.filter(loc => loc._id !== location._id)
      }));
      return;
    }

    // If it's a Location (adding), convert it to TutorLocation
    const tutorLocation: TutorLocation = {
      _id: location._id,
      name: location.name,
      province: location.level === 1 ? location.name : 
                location.level === 2 ? (locations.find(l => l._id === location.parent) as Location)?.name || '' :
                (locations.find(l => l._id === (locations.find(p => p._id === location.parent) as Location)?.parent) as Location)?.name || ''
    };

    setFormData(prev => {
      const exists = prev.locations.some(loc => loc._id === location._id);
      if (exists) {
        return {
          ...prev,
          locations: prev.locations.filter(loc => loc._id !== location._id)
        };
      }
      return {
        ...prev,
        locations: [...prev.locations, tutorLocation]
      };
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
      // Validate required fields
      if (!formData.gender) {
        throw new Error('Please select your gender');
      }

      if (!formData.mobileNumber || !/^[0-9]{10}$/.test(formData.mobileNumber)) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      if (!formData.locations || formData.locations.length === 0) {
        throw new Error('Please select at least one teaching location');
      }

      if (!formData.subjects || formData.subjects.length === 0) {
        throw new Error('Please select at least one subject');
      }

      if (!formData.hourlyRate || formData.hourlyRate <= 0) {
        throw new Error('Please enter a valid hourly rate');
      }

      // Validate education entries
      for (const edu of formData.education) {
        if (!edu.degree || !edu.institution || !edu.year) {
          throw new Error('Please fill in all education fields');
        }
        if (edu.year < 1900 || edu.year > new Date().getFullYear()) {
          throw new Error('Please enter a valid year for education');
        }
      }

      // Validate experience entries
      for (const exp of formData.experience) {
        if (!exp.title || !exp.company || !exp.duration || !exp.description) {
          throw new Error('Please fill in all experience fields');
        }
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
    
    // Validate mobile number format
    if (name === 'mobileNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue,
        }));
      }
      return;
    }

    // Validate hourly rate
    if (name === 'hourlyRate') {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue >= 0) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue,
        }));
      }
      return;
    }

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
          <LocationSelector
            selectedLocations={formData.locations}
            onLocationsChange={(locations) => setFormData(prev => ({ ...prev, locations }))}
          />
        </div>

        {/* Teaching Subjects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Teaching Subjects</h2>
          <SubjectSelector
            selectedSubjects={formData.subjects}
            onSubjectsChange={(subjects) => setFormData(prev => ({ ...prev, subjects }))}
          />
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