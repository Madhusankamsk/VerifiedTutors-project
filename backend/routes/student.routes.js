import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       required:
 *         - student
 *         - tutor
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the favorite
 *         student:
 *           type: string
 *           description: Reference to Student (User) model
 *         tutor:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 profileImage:
 *                   type: string
 *             totalFavorites:
 *               type: number
 *               description: Total number of times this tutor has been favorited
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Favorite creation timestamp
 */

/**
 * @swagger
 * /api/students/favorites:
 *   get:
 *     summary: Get all favorite tutors for the student
 *     description: Retrieves a list of all tutors that the student has favorited
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite tutors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *             example:
 *               - _id: "60d21b4667d0d8992e610c85"
 *                 student: "60d21b4667d0d8992e610c86"
 *                 tutor:
 *                   _id: "60d21b4667d0d8992e610c87"
 *                   user:
 *                     _id: "60d21b4667d0d8992e610c88"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                     profileImage: "https://example.com/profile.jpg"
 *                   totalFavorites: 5
 *                 createdAt: "2024-03-15T10:30:00Z"
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
 *         description: Forbidden - Not a student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as a student
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching favorites
 */

/**
 * @swagger
 * /api/students/favorites/{tutorId}:
 *   post:
 *     summary: Add a tutor to favorites
 *     description: Adds a tutor to the student's favorites and increments the tutor's totalFavorites count
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       201:
 *         description: Tutor added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *             example:
 *               _id: "60d21b4667d0d8992e610c85"
 *               student: "60d21b4667d0d8992e610c86"
 *               tutor: "60d21b4667d0d8992e610c87"
 *               createdAt: "2024-03-15T10:30:00Z"
 *       400:
 *         description: Already favorited or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Already favorited
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
 *         description: Forbidden - Not a student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as a student
 *   delete:
 *     summary: Remove a tutor from favorites
 *     description: Removes a tutor from the student's favorites and decrements the tutor's totalFavorites count
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor removed from favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removed from favorites
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
 *         description: Forbidden - Not a student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as a student
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Favorite not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error removing favorite
 */

// Student favorites routes
router.get('/favorites', protect, authorize('student'), getFavorites);
router.post('/favorites/:tutorId', protect, authorize('student'), addFavorite);
router.delete('/favorites/:tutorId', protect, authorize('student'), removeFavorite);

export default router; 