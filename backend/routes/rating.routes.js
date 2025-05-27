import express from 'express';
import {
  getTutorRatings,
  createRating,
  updateRating,
  deleteRating
} from '../controllers/rating.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/tutor/:tutorId', getTutorRatings);
router.post('/', protect, authorize('student'), createRating);
router.put('/:id', protect, authorize('student'), updateRating);
router.delete('/:id', protect, authorize('student'), deleteRating);

export default router; 