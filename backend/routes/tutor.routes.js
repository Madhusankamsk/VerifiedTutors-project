import express from 'express';
import {
  getTutors,
  getTutor,
  createTutorProfile,
  updateTutorProfile,
  deleteTutorProfile,
  getTutorAvailability,
  getTutorBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getTutorByUserId,
  getTutorReviews
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateTutorProfile } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getTutors);
router.get('/:id', getTutor);
router.get('/:id/availability', getTutorAvailability);
router.get('/:id/reviews', getTutorReviews);

// Protected routes
router.use(protect);

// Tutor profile routes
router.get('/profile', getTutorByUserId);
router.put('/profile', authorize('tutor'), validateTutorProfile, updateTutorProfile);
router.delete('/profile', authorize('tutor'), deleteTutorProfile);

// Blog routes
router.get('/blogs', authorize('tutor'), getTutorBlogs);
router.post('/blogs', authorize('tutor'), createBlog);
router.put('/blogs/:id', authorize('tutor'), updateBlog);
router.delete('/blogs/:id', authorize('tutor'), deleteBlog);

export default router; 