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
  getTutorByUserId
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateTutorProfile } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getTutors);
router.get('/:id', getTutor);
router.get('/:id/availability', getTutorAvailability);
router.get('/profile', protect, getTutorByUserId);
router.post('/', protect, authorize('tutor'), validateTutorProfile, createTutorProfile);
router.put('/profile', protect, authorize('tutor'), validateTutorProfile, updateTutorProfile);
router.delete('/profile', protect, authorize('tutor'), deleteTutorProfile);

// Blog routes
router.get('/:id/blogs', getTutorBlogs);
router.post('/blogs', protect, authorize('tutor'), createBlog);
router.put('/blogs/:id', protect, authorize('tutor'), updateBlog);
router.delete('/blogs/:id', protect, authorize('tutor'), deleteBlog);

export default router; 