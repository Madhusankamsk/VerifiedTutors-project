import express from 'express';
import { getAllTutors, approveTutor, rejectTutor, getDashboardStats, getTutorVerificationDetails, getAllBookings, toggleTutorVerification } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);
router.get('/tutors', protect, authorize('admin'), getAllTutors);
router.get('/tutors/:id/verification', protect, authorize('admin'), getTutorVerificationDetails);
router.patch('/tutors/:id/approve', protect, authorize('admin'), approveTutor);
router.patch('/tutors/:id/reject', protect, authorize('admin'), rejectTutor);
router.patch('/tutors/:id/toggle-verification', protect, authorize('admin'), toggleTutorVerification);

// Booking routes
router.get('/bookings', protect, authorize('admin'), getAllBookings);

export default router; 