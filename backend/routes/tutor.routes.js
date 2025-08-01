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
  getTutorStats,
  getTutorBlogById,
  getTutorBookings,
  updateBookingStatus,
  uploadDocument,
  deleteDocument
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateTutorProfile } from '../middleware/validation.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getTutors);

// Profile routes - must come before /:id routes
router.get('/profile', protect, getTutorByUserId);
router.put('/profile', protect, authorize('tutor'), updateTutorProfile);
router.delete('/profile', protect, authorize('tutor'), deleteTutorProfile);

// Document routes
router.post('/documents', protect, authorize('tutor'), upload.single('document'), uploadDocument);
router.delete('/documents/:id', protect, authorize('tutor'), deleteDocument);

// Booking routes
router.get('/bookings', protect, authorize('tutor'), getTutorBookings);
router.patch('/bookings/:id', protect, authorize('tutor'), updateBookingStatus);

// Parameterized routes
router.get('/:id', getTutor);
router.get('/:id/stats', getTutorStats);
router.get('/:id/reviews', getTutorReviews);
router.get('/:id/availability', getTutorAvailability);

// // Blog routes
// router.get('/blogs', protect, authorize('tutor'), getTutorBlogs);
// router.post('/blogs', protect, authorize('tutor'), createBlog);
// router.put('/blogs/:id', protect, authorize('tutor'), updateBlog);
// router.delete('/blogs/:id', protect, authorize('tutor'), deleteBlog);
// router.get('/blogs/:id', protect, authorize('tutor'), getTutorBlogById);

export default router; 