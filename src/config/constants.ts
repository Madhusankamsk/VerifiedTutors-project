// API Configuration
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://verifiedtutors-project.onrender.com' // Your production backend URL
  : 'http://localhost:5000'; // Development backend URL

// Application URLs
export const APP_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3000';

// Firebase Configuration
