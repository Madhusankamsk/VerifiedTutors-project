import express from 'express';
import { getAllTutors, approveTutor, rejectTutor } from '../controllers/admin.controller.js';
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
 * /api/admin/tutors:
 *   get:
 *     summary: Get all tutors (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tutors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Tutor ID
 *                   user:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *                   isVerified:
 *                     type: boolean
 *                   verificationStatus:
 *                     type: string
 *                     enum: [pending, approved, rejected]
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
router.get('/tutors', protect, authorize('admin'), getAllTutors);
router.patch('/tutors/:id/approve', protect, authorize('admin'), approveTutor);
router.patch('/tutors/:id/reject', protect, authorize('admin'), rejectTutor);

export default router; 