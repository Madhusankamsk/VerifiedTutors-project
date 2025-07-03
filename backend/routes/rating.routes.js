import express from 'express';
import {
  getTutorRatings,
  createRating,
  updateRating,
  deleteRating,
  getBookingRating
} from '../controllers/rating.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/tutor/:tutorId', getTutorRatings);
router.get('/booking/:bookingId', protect, authorize('student'), getBookingRating);
router.post('/', protect, authorize('student'), createRating);
router.put('/:id', protect, authorize('student'), updateRating);
router.delete('/:id', protect, authorize('student'), deleteRating);

export default router; 