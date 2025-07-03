import { Subject, Topic } from '../contexts/AdminContext';

// Basic tutor profile interfaces
export interface TutorProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  bio: string;
  socialMedia: {
    instagram: string;
    youtube: string;
    facebook: string;
    linkedin: string;
  };
  teachingMediums: string[];
  education: Education[];
  experience: Experience[];
  subjects: TutorSubject[];
  availableLocations: string;
  documents: Document[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationChecks: {
    documents: boolean;
    education: boolean;
    experience: boolean;
    background: boolean;
    interview: boolean;
  };
  rejectionReason?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  totalEarnings: number;
  totalStudents: number;
  totalSessions: number;
}

// Education interface
export interface Education {
  degree: string;
  institution: string;
  year: number;
}

// Experience interface
export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

// Document interface
export interface Document {
  id?: string;
  url: string;
}

// Teaching mode interface
export interface TeachingMode {
  type: 'online' | 'home-visit' | 'group';
  rate: number;
  enabled: boolean;
}

// Tutor subject interface
export interface TutorSubject {
  subject: Subject;
  selectedTopics: string[]; // Topic IDs
  teachingModes: TeachingMode[];
  availability: TutorAvailability[];
  // Legacy fields for backward compatibility
  bestTopics?: string[];
  rates?: {
    individual: number;
    group: number;
    online: number;
  };
}

// Availability interface
export interface TutorAvailability {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  slots: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  }[];
}

// Form data interface for editing
export interface EditTutorFormData {
  phone: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  socialMedia: {
    instagram: string;
    youtube: string;
    facebook: string;
    linkedin: string;
  };
  teachingMediums: string[];
  education: Education[];
  experience: Experience[];
  subjects: Array<{
    _id: string;
    name: string;
    selectedTopics: string[];
    teachingModes: TeachingMode[];
    availability: Array<{
      day: string;
      slots: Array<{
        start: string;
        end: string;
      }>;
    }>;
  }>; // Note: Array with max length 1
  availableLocations: string;
  documents: Document[];
}

// Social media interface
export interface SocialMedia {
  instagram: string;
  youtube: string;
  facebook: string;
  linkedin: string;
}

// Basic info data interface
export interface BasicInfoData {
  phone: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  socialMedia: SocialMedia;
  teachingMediums: string[];
}

// Tutor review interface
export interface TutorReview {
  _id: string;
  student: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  subject: {
    _id: string;
    name: string;
    category: string;
  };
  topics: {
    _id: string;
    name: string;
    description?: string;
  }[];
  rating: number;
  review: string;
  isVerified: boolean;
  createdAt: string;
}

// Tutor blog interface
export interface TutorBlog {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  featuredImage: string;
  status: 'draft' | 'published';
}

// Favorite interface
export interface Favorite {
  _id: string;
  tutor: TutorProfile;
  student: string;
  createdAt: string;
}

// Blog interface
export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  featuredImage?: string;
  tags?: string[];
  status: 'draft' | 'published';
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// Tutor stats interface
export interface TutorStats {
  totalStudents: number;
  totalSessions: number;
  averageRating: number;
  totalEarnings: number;
}

// Booking data interface
export interface BookingData {
  tutorId: string;
  subjectId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  learningMethod: 'online' | 'individual' | 'group';
}

// Search parameters interface
export interface TutorSearchParams {
  subject?: string;
  topic?: string;
  rating?: number;
  price?: { min: number; max: number };
  location?: string;
  teachingMode?: string;
  search?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search results interface
export interface TutorSearchResults {
  tutors: TutorProfile[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// Tutor listing interface (for search results)
export interface TutorListing {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  subjects: TutorSubject[];
  availableLocations: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
} 