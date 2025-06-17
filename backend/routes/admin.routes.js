import express from 'express';
import { getAllTutors, approveTutor, rejectTutor, getDashboardStats, getTutorVerificationDetails, getAllBookings, notifyTutorAboutBooking } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);
router.get('/tutors', protect, authorize('admin'), getAllTutors);
router.get('/tutors/:id/verification', protect, authorize('admin'), getTutorVerificationDetails);
router.patch('/tutors/:id/approve', protect, authorize('admin'), approveTutor);
router.patch('/tutors/:id/reject', protect, authorize('admin'), rejectTutor);

// New booking routes
router.get('/bookings', protect, authorize('admin'), getAllBookings);
router.post('/bookings/:id/notify', protect, authorize('admin'), notifyTutorAboutBooking);

export default router; 