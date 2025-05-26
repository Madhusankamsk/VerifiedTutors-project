import express from 'express';
import { getAllTutors, approveTutor, rejectTutor, getDashboardStats } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TutorVerification:
 *       type: object
 *       properties:
 *         isVerified:
 *           type: boolean
 *           description: Whether the tutor is verified
 *         verificationStatus:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Current verification status
 *         verificationDate:
 *           type: string
 *           format: date-time
 *           description: Date when verification status was updated
 *         verifiedBy:
 *           type: string
 *           description: ID of the admin who performed the verification
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTutors:
 *                   type: number
 *                   description: Total number of tutors
 *                 totalStudents:
 *                   type: number
 *                   description: Total number of students
 *                 activeSubjects:
 *                   type: number
 *                   description: Number of active subjects
 *                 pendingVerifications:
 *                   type: number
 *                   description: Number of pending tutor verifications
 *                 totalBookings:
 *                   type: number
 *                   description: Total number of bookings
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue from completed bookings
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Not an admin
 */

/**
 * @swagger
 * /api/admin/tutors:
 *   get:
 *     summary: Get all tutors (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tutor name or email
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: [all, verified, unverified]
 *           default: all
 *         description: Filter by verification status
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *           enum: [all, 4, 3, 2]
 *           default: all
 *         description: Filter by minimum rating
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, rating, name]
 *           default: newest
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of tutors with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tutors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Tutor ID
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                       subjects:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             category:
 *                               type: string
 *                       rating:
 *                         type: number
 *                       totalRatings:
 *                         type: number
 *                       isVerified:
 *                         type: boolean
 *                 currentPage:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 totalTutors:
 *                   type: number
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Not an admin
 */

/**
 * @swagger
 * /api/admin/tutors/{id}/approve:
 *   patch:
 *     summary: Approve a tutor (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TutorVerification'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, no token
 *       403:
 *         description: Forbidden - Not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as an admin
 *       404:
 *         description: Tutor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tutor not found
 */

/**
 * @swagger
 * /api/admin/tutors/{id}/reject:
 *   patch:
 *     summary: Reject a tutor (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TutorVerification'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, no token
 *       403:
 *         description: Forbidden - Not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as an admin
 *       404:
 *         description: Tutor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tutor not found
 */

// Admin routes
router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);
router.get('/tutors', protect, authorize('admin'), getAllTutors);
router.patch('/tutors/:id/approve', protect, authorize('admin'), approveTutor);
router.patch('/tutors/:id/reject', protect, authorize('admin'), rejectTutor);

export default router; 