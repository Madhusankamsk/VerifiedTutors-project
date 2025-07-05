// Remove the SUBJECT_CATEGORIES constant as we're simplifying the subject structure
// Subjects will now be managed directly with topics by admins

// Education Levels
export const EDUCATION_LEVELS = {
  PRIMARY: 'Primary (Grade 1-5)',
  JUNIOR_SECONDARY: 'Junior Secondary (Grade 6-9)',
  SENIOR_SECONDARY: 'Senior Secondary (Grade 10-11)',
  ADVANCED_LEVEL: 'Advanced Level (Grade 12-13)',
  HIGHER_EDUCATION: 'Higher Education'
};

export const MEDIUM_OPTIONS = [
  'English',
  'Sinhala',
  'Tamil'
];

export const TEACHING_MODES = [
  'ONLINE',
  'INDIVIDUAL'
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'All Levels'
]; 