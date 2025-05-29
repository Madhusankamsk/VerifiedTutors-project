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
  getTutorReviews,
  getTutorStats
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateTutorProfile } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getTutors);

// Protected routes
router.use(protect);

// Profile routes - must come before /:id routes
router.get('/profile', getTutorByUserId);
router.put('/profile', authorize('tutor'), updateTutorProfile);
router.delete('/profile', authorize('tutor'), deleteTutorProfile);

// Blog routes
router.get('/blogs', authorize('tutor'), getTutorBlogs);
router.post('/blogs', authorize('tutor'), createBlog);
router.put('/blogs/:id', authorize('tutor'), updateBlog);
router.delete('/blogs/:id', authorize('tutor'), deleteBlog);

// Parameterized routes - must come after specific routes
router.get('/:id', getTutor);
router.get('/:id/availability', getTutorAvailability);
router.get('/:id/reviews', getTutorReviews);
router.get('/:id/stats', getTutorStats);

export default router; 