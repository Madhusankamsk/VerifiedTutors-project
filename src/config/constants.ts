// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Pagination
export const ITEMS_PER_PAGE = 12;

// Subject Areas (for demo purposes)
export const SUBJECT_AREAS = [
  'Mathematics',
  'Science',
  'English Language',
  'IT & Computing',
  'History',
  'Geography',
  'Economics',
  'Business Studies',
  'Art & Design',
  'Music',
  'Physical Education',
  'Foreign Languages'
];

// Locations in Sri Lanka (for demo purposes)
export const LOCATIONS = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Negombo',
  'Batticaloa',
  'Trincomalee',
  'Anuradhapura',
  'Ratnapura',
  'Badulla',
  'Matara',
  'Kurunegala'
];

// Teaching Methods
export const TEACHING_METHODS = [
  'One-on-one',
  'Group classes',
  'Online sessions',
  'Home visits',
  'Visual learning',
  'Practical exercises',
  'Exam preparation',
  'Problem-based learning'
];

// Time Slots
export const TIME_SLOTS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekend mornings',
  'Weekend afternoons',
  'Weekend evenings'
];