import React, { useState, useEffect, useRef } from 'react';
import { useTutor } from '../../contexts/TutorContext';
import { useSubjects } from '../../contexts/SubjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { MapPin } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/constants';

// Import new components
import EditTutorProfileHeader from '../../components/tutor-profile/EditTutorProfileHeader';
import EditTutorProfileBasicInfo from '../../components/tutor-profile/EditTutorProfileBasicInfo';
import EditTutorProfileEducation, { Education } from '../../components/tutor-profile/EditTutorProfileEducation';
import EditTutorProfileExperience, { Experience } from '../../components/tutor-profile/EditTutorProfileExperience';
import EditTutorProfileDocuments, { Document } from '../../components/tutor-profile/EditTutorProfileDocuments';
import EditTutorProfileDiscardDialog from '../../components/tutor-profile/EditTutorProfileDiscardDialog';
import EditTutorProfileSubjects from '../../components/tutor-profile/EditTutorProfileSubjects';

// Import types
import { EditTutorFormData, BasicInfoData, TutorProfile, TeachingMode } from '../../types/tutor';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

// Helper to get all days of week with empty slots
type Availability = {
  day: string;
  slots: { start: string; end: string }[];
};

const getFullWeekAvailability = (existingAvailability: Availability[] = []): Availability[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map(day => {
    const found = existingAvailability.find(a => a.day === day);
    return found ? found : { day, slots: [] };
  });
};

const EditTutorProfile: React.FC = () => {
  const { profile, loading, error, updateProfile, uploadDocument, deleteDocument } = useTutor();
  const { subjects, topics, fetchTopics } = useSubjects();
  const { user, uploadProfilePhoto } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [formData, setFormData] = useState<EditTutorFormData>({
    phone: '',
    bio: '',
    gender: 'Male',
    socialMedia: {
      instagram: '',
      youtube: '',
      facebook: '',
      linkedin: ''
    },
    teachingMediums: [],
    education: [],
    experience: [],
    subjects: [],
    availableLocations: '',
    documents: []
  });
  const [initialFormData, setInitialFormData] = useState<EditTutorFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const newFormData: EditTutorFormData = {
        phone: profile.phone || '',
        bio: profile.bio || '',
        gender: profile.gender || 'Male',
        socialMedia: profile.socialMedia || {
          instagram: '',
          youtube: '',
          facebook: '',
          linkedin: ''
        },
        teachingMediums: profile.teachingMediums || [],
        education: profile.education || [],
        experience: profile.experience || [],
        subjects: profile.subjects.map(s => {
          // Handle both new and legacy structures
          const hasNewStructure = s.selectedTopics !== undefined && s.teachingModes !== undefined;
          const hasLegacyStructure = (s as any).rates !== undefined;

          let selectedTopics: string[] = [];
          let teachingModes: any[] = [];

          if (hasNewStructure) {
            selectedTopics = s.selectedTopics || [];
            teachingModes = s.teachingModes || [
              { type: 'online', rate: 0, enabled: false },
              { type: 'home-visit', rate: 0, enabled: false },
              { type: 'group', rate: 0, enabled: false }
            ];
          } else if (hasLegacyStructure) {
            // Convert legacy structure to new structure
            selectedTopics = s.selectedTopics || (s as any).bestTopics || [];
            const { individual = 0, group = 0, online = 0 } = (s as any).rates || {};
            teachingModes = [
              { type: 'online', rate: online, enabled: online > 0 },
              { type: 'home-visit', rate: individual, enabled: individual > 0 },
              { type: 'group', rate: group, enabled: group > 0 }
            ];
          } else {
            // Default structure for new subjects
            selectedTopics = [];
            teachingModes = [
              { type: 'online', rate: 0, enabled: false },
              { type: 'home-visit', rate: 0, enabled: false },
              { type: 'group', rate: 0, enabled: false }
            ];
          }

          return {
            _id: s.subject._id,
            name: s.subject.name,
            selectedTopics,
            teachingModes,
            availability: getFullWeekAvailability(s.availability),
            createdAt: new Date().toISOString()
          };
        }) || [],
        availableLocations: profile.availableLocations || '',
        documents: profile.documents.map(d => ({
          id: d.id || d.url,
          url: d.url
        })) || []
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      
      // Set the profile image if it exists
      if (profile.user?.profileImage) {
        setProfileImage(profile.user.profileImage);
      }
    }
  }, [profile, user, navigate]);

  // Fetch topics when subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      fetchTopics();
    }
  }, [subjects, fetchTopics]);

  // Add effect to track form changes
  useEffect(() => {
    if (initialFormData) {
      const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
      setHasChanges(hasFormChanges);
    }
  }, [formData, initialFormData]);

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    if (initialFormData) {
      setFormData(initialFormData);
      setHasChanges(false);
      setShowDiscardConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const apiData: Partial<TutorProfile> = {
        phone: formData.phone,
        bio: formData.bio,
        gender: formData.gender,
        socialMedia: formData.socialMedia,
        teachingMediums: formData.teachingMediums,
        education: formData.education,
        experience: formData.experience,
        subjects: formData.subjects.map(s => {
          const subject = subjects.find(sub => sub._id === s._id);
          if (!subject) {
            throw new Error(`Subject with id ${s._id} not found`);
          }
          return {
            subject: {
              _id: subject._id,
              name: subject.name,
              description: subject.description,
              isActive: subject.isActive,
              createdAt: subject.createdAt || new Date().toISOString()
            },
            selectedTopics: s.selectedTopics,
            teachingModes: s.teachingModes,
            availability: s.availability.map(avail => ({
              day: avail.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
              slots: avail.slots
            }))
          };
        }),
        availableLocations: formData.availableLocations
      };

      await updateProfile(apiData);
      toast.success('Profile updated successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check if adding these files would exceed the limit
    if (files.length + selectedDocuments.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum file size is 2MB.`);
        continue;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please upload JPG or PNG images only.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedDocuments(prev => [...prev, ...validFiles]);
    }
  };

  const handleDocumentUpload = async () => {
    if (selectedDocuments.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of selectedDocuments) {
        await uploadDocument(file, 'other');
      }
      setSelectedDocuments([]);
      toast.success('Documents uploaded successfully!');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!documentId) {
      toast.error('Invalid document ID');
      return;
    }
    
    try {
      await deleteDocument(documentId);
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId)
      }));
      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const removeSelectedDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadProfilePhoto(file);
      setProfileImage(imageUrl);
      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handler for basic info changes
  const handleBasicInfoChange = (data: Partial<BasicInfoData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Handler for education changes
  const handleEducationChange = (education: Education[]) => {
    setFormData(prev => ({ ...prev, education }));
  };

  // Handler for experience changes
  const handleExperienceChange = (experience: Experience[]) => {
    setFormData(prev => ({ ...prev, experience }));
  };

  // Handler for subjects changes
  const handleSubjectsChange = (subjects: any[]) => {
    setFormData(prev => ({ ...prev, subjects }));
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8 lg:py-12 pb-16 sm:pb-24 lg:pb-32">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <EditTutorProfileHeader
            hasChanges={hasChanges}
            onDiscard={handleDiscard}
            onSave={() => {}}
            isSubmitting={isSubmitting}
          />

          <EditTutorProfileDiscardDialog
            isOpen={showDiscardConfirm}
            onCancel={() => setShowDiscardConfirm(false)}
            onConfirm={confirmDiscard}
          />

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <EditTutorProfileBasicInfo
              data={{
                phone: formData.phone,
                bio: formData.bio,
                gender: formData.gender,
                socialMedia: formData.socialMedia,
                teachingMediums: formData.teachingMediums
              }}
              profileImage={profileImage}
              isUploading={isUploading}
              onDataChange={handleBasicInfoChange}
              onProfileImageUpload={handleProfileImageUpload}
            />

            {/* Subjects Section */}
            <EditTutorProfileSubjects
              subjects={formData.subjects}
              allSubjects={subjects}
              allTopics={topics}
              onSubjectsChange={handleSubjectsChange}
            />

            {/* Education Section */}
            <EditTutorProfileEducation
              education={formData.education}
              onEducationChange={handleEducationChange}
            />

            {/* Experience Section */}
            <EditTutorProfileExperience
              experience={formData.experience}
              onExperienceChange={handleExperienceChange}
            />

            {/* Locations Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 flex items-center text-gray-900">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
                Teaching Locations
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="availableLocations" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Teaching Locations
                  </label>
                  <textarea
                    id="availableLocations"
                    value={formData.availableLocations}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableLocations: e.target.value }))}
                    placeholder="Enter your available teaching locations (e.g., Colombo, Kandy, Online, etc.)"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base ${
                      formData.availableLocations.length > 100 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    rows={3}
                    maxLength={100}
                    required
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 gap-1 sm:gap-0">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Describe the areas where you are available to teach. You can include cities, towns, or specify if you offer online teaching.
                    </p>
                    <span className={`text-xs ${
                      formData.availableLocations.length > 100 ? 'text-red-600' : 
                      formData.availableLocations.length > 80 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {formData.availableLocations.length}/100
                    </span>
                  </div>
                  {formData.availableLocations.length > 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      Location description is too long. Please keep it under 100 characters.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <EditTutorProfileDocuments
              documents={formData.documents}
              selectedDocuments={selectedDocuments}
              uploading={uploading}
              onDocumentSelect={handleDocumentSelect}
              onDocumentUpload={handleDocumentUpload}
              onDeleteDocument={handleDeleteDocument}
              onRemoveSelectedDocument={removeSelectedDocument}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfile;
