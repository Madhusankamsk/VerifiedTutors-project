import express from 'express';
import { createBooking, getStudentBookings } from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student booking routes
router.post('/', protect, authorize('student'), createBooking);
router.get('/', protect, authorize('student'), getStudentBookings);

export default router; 