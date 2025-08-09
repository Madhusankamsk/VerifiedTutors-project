import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  
  // New state for temporary uploads
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tempProfileImage, setTempProfileImage] = useState<{file: File, preview: string} | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Section refs for navigation
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);

  // Profile completion validation
  const validateProfileCompletion = () => {
    const requiredFields = {
      personalInfo: !!(formData.phone && formData.bio && formData.gender && user?.name && user?.email),
      education: formData.education.length > 0,
      experience: formData.experience.length > 0,
      subjects: formData.subjects.length > 0 && formData.subjects.some(s => s && s.selectedTopics && s.selectedTopics.length > 0),
      profileImage: !!(profileImage || tempProfileImage),
      locations: !!formData.availableLocations,
      documents: formData.documents.length > 0
    };

    const completedFields = Object.values(requiredFields).filter(Boolean).length;
    const totalFields = Object.keys(requiredFields).length;
    const isComplete = completedFields === totalFields;

    return {
      isComplete,
      completedFields,
      totalFields,
      requirements: requiredFields
    };
  };

  const profileValidation = useMemo(() => validateProfileCompletion(), [formData, profileImage, tempProfileImage, user]);

  // Navigation function
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    if (sectionRef.current) {
      const headerHeight = 80; // Approximate header height
      const bottomBarHeight = 60; // Approximate bottom bar height
      const offset = headerHeight + 20; // Add some padding
      
      const elementTop = sectionRef.current.offsetTop;
      const elementPosition = elementTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Section navigation handlers
  const handleSectionClick = (section: string) => {
    let targetRef: React.RefObject<HTMLDivElement> | null = null;
    
    switch (section) {
      case 'Personal Info':
        targetRef = basicInfoRef;
        break;
      case 'Education':
        targetRef = educationRef;
        break;
      case 'Experience':
        targetRef = experienceRef;
        break;
      case 'Subjects & Topics':
        targetRef = subjectsRef;
        break;
      case 'Profile Image':
        targetRef = basicInfoRef; // Profile image is in basic info section
        break;
      case 'Available Locations':
        targetRef = locationsRef;
        break;
      case 'Documents':
        targetRef = documentsRef;
        break;
    }
    
    if (targetRef) {
      setSelectedSection(section);
      scrollToSection(targetRef);
    }
  };

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
        subjects: (() => {
          const processedSubjects = [];
          for (const s of profile.subjects || []) {
            if (!s || !s.subject || !s.subject._id) {
              continue; // Skip invalid subjects
            }
            
            try {
              // Handle both new and legacy structures
              const hasNewStructure = s.selectedTopics !== undefined && s.teachingModes !== undefined;
              const hasLegacyStructure = (s as any).rates !== undefined;

              let selectedTopics: string[] = [];
              let teachingModes: any[] = [];

              if (hasNewStructure) {
                selectedTopics = (s.selectedTopics || []).map(topic => 
                  typeof topic === 'string' ? topic : topic._id
                );
                teachingModes = s.teachingModes || [
                  { type: 'online', rate: 0, enabled: false },
                  { type: 'home-visit', rate: 0, enabled: false },
                  { type: 'group', rate: 0, enabled: false }
                ];
              } else if (hasLegacyStructure) {
                // Convert legacy structure to new structure
                selectedTopics = (s.selectedTopics || (s as any).bestTopics || []).map(topic => 
                  typeof topic === 'string' ? topic : topic._id
                );
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

              processedSubjects.push({
                _id: s.subject._id,
                name: s.subject.name,
                selectedTopics,
                teachingModes,
                availability: getFullWeekAvailability(s.availability),
                createdAt: new Date().toISOString()
              });
            } catch (error) {
              console.error('Error processing subject:', s, error);
            }
          }
          return processedSubjects;
        })(),
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
      const hasTempUploads = tempProfileImage !== null;
      setHasChanges(hasFormChanges || hasTempUploads);
    }
  }, [formData, initialFormData, tempProfileImage]);

  const handleDiscard = useCallback(() => {
    setShowDiscardConfirm(true);
  }, []);

  const confirmDiscard = useCallback(() => {
    if (initialFormData) {
      setFormData(initialFormData);
      
      // Clean up temporary uploads
      if (tempProfileImage) {
        URL.revokeObjectURL(tempProfileImage.preview);
        setTempProfileImage(null);
      }
      setSelectedDocuments([]);
      
      setHasChanges(false);
      setShowDiscardConfirm(false);
    }
  }, [initialFormData, tempProfileImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if subjects are loaded before saving
    if (!subjects || subjects.length === 0) {
      toast.error('Please wait for subjects to load before saving.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Upload temporary profile image if exists
      let finalProfileImage = profileImage;
      if (tempProfileImage) {
        finalProfileImage = await uploadProfilePhoto(tempProfileImage.file);
      }

      // Documents are already uploaded and stored in formData.documents
      const finalDocuments = formData.documents;

      const apiData: Partial<TutorProfile> = {
        phone: formData.phone,
        bio: formData.bio,
        gender: formData.gender,
        socialMedia: formData.socialMedia,
        teachingMediums: formData.teachingMediums,
        education: formData.education,
        experience: formData.experience,
        subjects: formData.subjects
          .filter(s => s && s._id) // Filter out subjects without _id
          .map(s => {
            const subject = subjects?.find(sub => sub && sub._id === s._id);
            if (!subject) {
              console.warn(`Subject with id ${s._id} not found in subjects list`);
              return null;
            }
            return {
              subject: {
                _id: subject._id,
                name: subject.name,
                description: subject.description,
                isActive: subject.isActive,
                createdAt: subject.createdAt || new Date().toISOString()
              },
              selectedTopics: s.selectedTopics || [],
              teachingModes: s.teachingModes || [],
              availability: (s.availability || []).map(avail => ({
                day: avail.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
                slots: avail.slots || []
              }))
            };
          })
          .filter((subject): subject is NonNullable<typeof subject> => subject !== null), // Remove null entries with type guard
        availableLocations: formData.availableLocations,
        documents: finalDocuments
      };

      await updateProfile(apiData);
      
      // Clean up temporary data
      if (tempProfileImage) {
        URL.revokeObjectURL(tempProfileImage.preview);
        setTempProfileImage(null);
      }
      setProfileImage(finalProfileImage);

      const message = profileValidation.isComplete 
        ? 'Profile updated successfully! Your profile is now complete and submitted for admin review.'
        : 'Profile draft saved successfully! Complete all sections to submit for review.';
      
      toast.success(message);
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    
    // Calculate total documents (existing + selected + new files)
    const totalExisting = formData.documents.length + selectedDocuments.length;
    const totalAfterAdding = totalExisting + files.length;
    
    // Check if adding these files would exceed the limit
    if (totalAfterAdding > 5) {
      const available = 5 - totalExisting;
      toast.error(`You can only add ${available} more image(s). Maximum 5 images allowed total.`);
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
      toast.success(`${validFiles.length} image(s) selected for upload.`);
    }
    
    // Reset the input value to allow selecting the same files again if needed
    e.target.value = '';
  }, [formData.documents.length, selectedDocuments.length]);

  const handleDocumentUpload = useCallback(async () => {
    if (selectedDocuments.length === 0) {
      toast.warning('No documents selected to upload.');
      return;
    }
    
    setUploading(true);
    
    try {
      // Use the generic upload endpoint that doesn't save to profile
      const formData = new FormData();
      selectedDocuments.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/upload/verification-docs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      // Add uploaded documents to form data (but don't save profile yet)
      const uploadedDocs = data.data.map((doc: any) => ({
        id: doc.id,
        url: doc.url
      }));

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs]
      }));
      
      setSelectedDocuments([]);
      toast.success(`${uploadedDocs.length} document(s) uploaded successfully! Click Save Draft to save your profile.`);
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toast.error(error.message || 'Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [selectedDocuments]);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    if (!documentId) {
      toast.error('Invalid document ID');
      return;
    }
    
    try {
      setUploading(true);
      
      // URL encode the document ID to handle special characters
      const encodedId = encodeURIComponent(documentId);
      const deleteUrl = `/api/upload/${encodedId}`;
      
      // Delete the file from server/Cloudinary
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete image';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (like HTML), get the text
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}): Unable to delete image`;
        }
        throw new Error(errorMessage);
      }

      // Remove from local form data
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId)
      }));
      
      toast.success('Image deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, []);

  const removeSelectedDocument = useCallback((index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleProfileImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create preview immediately
      const preview = URL.createObjectURL(file);
      
      // Store profile image temporarily with preview
      setTempProfileImage({ file, preview });
      
      // Show success message
      toast.success('Profile image preview loaded! It will be uploaded when you save changes.');
    } catch (error) {
      console.error('Error processing profile image:', error);
      toast.error('Failed to process profile image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handler for basic info changes
  const handleBasicInfoChange = useCallback((data: Partial<BasicInfoData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Handler for education changes
  const handleEducationChange = useCallback((education: Education[]) => {
    setFormData(prev => ({ ...prev, education }));
  }, []);

  // Handler for experience changes
  const handleExperienceChange = useCallback((experience: Experience[]) => {
    setFormData(prev => ({ ...prev, experience }));
  }, []);

  // Handler for subjects changes
  const handleSubjectsChange = useCallback((subjects: any[]) => {
    setFormData(prev => ({ ...prev, subjects }));
  }, []);

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

  // Safety check for subjects loading
  if (!subjects) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="bg-blue-50/80 backdrop-blur-sm border-l-4 border-blue-500 rounded-2xl p-8 shadow-lg">
            <p className="text-blue-700 font-medium text-lg">Loading subjects...</p>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <EditTutorProfileHeader
        hasChanges={hasChanges}
        onDiscard={handleDiscard}
        onSave={() => handleSubmit({} as React.FormEvent)}
        isSubmitting={isSubmitting}
        isComplete={profileValidation.isComplete}
        completionPercentage={Math.round((profileValidation.completedFields / profileValidation.totalFields) * 100)}
      />

      <form id="profile-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-32">
        {/* Basic Information */}
        <div 
          ref={basicInfoRef} 
          onClick={() => setSelectedSection('Personal Info')}
          className={`transition-all duration-300 cursor-pointer ${
            selectedSection === 'Personal Info' || selectedSection === 'Profile Image' 
              ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
              : ''
          }`}
        >
          <EditTutorProfileBasicInfo
            phone={formData.phone}
            bio={formData.bio}
            gender={formData.gender}
            socialMedia={formData.socialMedia}
            teachingMediums={formData.teachingMediums}
            profileImage={profileImage || (tempProfileImage?.preview || null)}
            isUploading={isUploading}
            onDataChange={handleBasicInfoChange}
            onProfileImageUpload={handleProfileImageUpload}
          />
        </div>

        {/* Bio Section */}
        <div 
          ref={bioRef} 
          onClick={() => setSelectedSection('Personal Info')}
          className={`bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 transition-all duration-300 cursor-pointer ${
            selectedSection === 'Personal Info' 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : ''
          }`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">About Me</h2>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
              placeholder="Tell students about yourself, your teaching style, and what makes you unique..."
              required
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </div>

        {/* Education */}
        <div 
          ref={educationRef} 
          onClick={() => setSelectedSection('Education')}
          className={`transition-all duration-300 cursor-pointer ${
            selectedSection === 'Education' 
              ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
              : ''
          }`}
        >
          <EditTutorProfileEducation
            education={formData.education}
            onEducationChange={handleEducationChange}
          />
        </div>

        {/* Experience */}
        <div 
          ref={experienceRef} 
          onClick={() => setSelectedSection('Experience')}
          className={`transition-all duration-300 cursor-pointer ${
            selectedSection === 'Experience' 
              ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
              : ''
          }`}
        >
          <EditTutorProfileExperience
            experience={formData.experience}
            onExperienceChange={handleExperienceChange}
          />
        </div>

        {/* Subjects and Topics */}
        <div 
          ref={subjectsRef} 
          onClick={() => setSelectedSection('Subjects & Topics')}
          className={`transition-all duration-300 cursor-pointer ${
            selectedSection === 'Subjects & Topics' 
              ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
              : ''
          }`}
        >
          <EditTutorProfileSubjects
            subjects={formData.subjects}
            allSubjects={subjects}
            allTopics={topics}
            onSubjectsChange={handleSubjectsChange}
          />
        </div>

        {/* Available Locations */}
        <div 
          ref={locationsRef} 
          onClick={() => setSelectedSection('Available Locations')}
          className={`bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 transition-all duration-300 cursor-pointer ${
            selectedSection === 'Available Locations' 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : ''
          }`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            Available Locations
          </h2>
          <div>
            <label htmlFor="availableLocations" className="block text-sm font-medium text-gray-700 mb-2">
              Areas where you can provide tutoring
            </label>
            <textarea
              id="availableLocations"
              rows={4}
              value={formData.availableLocations}
              onChange={(e) => setFormData({ ...formData, availableLocations: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
              placeholder="e.g., Colombo, Gampaha, Kandy, Online sessions available"
              required
            />
          </div>
        </div>

        {/* Documents */}
        <div 
          ref={documentsRef} 
          onClick={() => setSelectedSection('Documents')}
          className={`transition-all duration-300 cursor-pointer ${
            selectedSection === 'Documents' 
              ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
              : ''
          }`}
        >
          <EditTutorProfileDocuments
            documents={formData.documents}
            selectedDocuments={selectedDocuments}
            uploading={uploading}
            onDocumentSelect={handleDocumentSelect}
            onDocumentUpload={handleDocumentUpload}
            onDeleteDocument={handleDeleteDocument}
            onRemoveSelectedDocument={removeSelectedDocument}
          />
        </div>
      </form>

      {/* Profile Completion Status - Fixed Bottom Strip */}
      {!profileValidation.isComplete && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Progress Bar */}
              <div className="flex-1 mr-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((profileValidation.completedFields / profileValidation.totalFields) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                    {Math.round((profileValidation.completedFields / profileValidation.totalFields) * 100)}%
                  </span>
                </div>
              </div>

              {/* Status Items - Reordered to match form content */}
              <div className="hidden lg:flex items-center space-x-6">
                {Object.entries({
                  'Profile Image': profileValidation.requirements.profileImage,
                  'Personal Info': profileValidation.requirements.personalInfo,
                  'Education': profileValidation.requirements.education,
                  'Experience': profileValidation.requirements.experience,
                  'Subjects & Topics': profileValidation.requirements.subjects,
                  'Available Locations': profileValidation.requirements.locations,
                  'Documents': profileValidation.requirements.documents
                }).map(([label, completed]) => (
                  <button
                    key={label}
                    onClick={() => handleSectionClick(label)}
                    className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                      completed ? 'hover:text-green-600' : 'hover:text-gray-700'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                      completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-xs font-medium ${
                      completed ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mobile/Tablet View - Scrollable */}
              <div className="lg:hidden flex items-center space-x-4 overflow-x-auto no-scrollbar">
                {Object.entries({
                  'Profile Image': profileValidation.requirements.profileImage,
                  'Personal Info': profileValidation.requirements.personalInfo,
                  'Education': profileValidation.requirements.education,
                  'Experience': profileValidation.requirements.experience,
                  'Subjects & Topics': profileValidation.requirements.subjects,
                  'Available Locations': profileValidation.requirements.locations,
                  'Documents': profileValidation.requirements.documents
                }).map(([label, completed]) => (
                  <button
                    key={label}
                    onClick={() => handleSectionClick(label)}
                    className={`flex items-center space-x-1.5 flex-shrink-0 transition-all duration-200 hover:scale-105 ${
                      completed ? 'hover:text-green-600' : 'hover:text-gray-700'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${
                      completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-xs font-medium ${
                      completed ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Dialog */}
      <EditTutorProfileDiscardDialog
        isOpen={showDiscardConfirm}
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirm={confirmDiscard}
      />
    </>
  );
};

export default EditTutorProfile;
