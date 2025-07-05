import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
  sendBookingReminder
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Booking routes
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);
router.post('/:id/reminder', sendBookingReminder);

export default router; 