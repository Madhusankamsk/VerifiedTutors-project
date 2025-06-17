import express from 'express';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite,
  createBooking,
  getStudentBookings
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/favorites', protect, authorize('student'), getFavorites);
router.post('/favorites/:tutorId', protect, authorize('student'), addFavorite);
router.delete('/favorites/:tutorId', protect, authorize('student'), removeFavorite);

// Booking routes
router.post('/bookings', protect, authorize('student'), createBooking);
router.get('/bookings', protect, authorize('student'), getStudentBookings);

export default router; 