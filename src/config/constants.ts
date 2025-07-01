// API Configuration
export const API_URL = ''; // Empty base URL since API is served from same origin in production

// Application URLs
export const APP_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3000';

// Firebase Configuration
