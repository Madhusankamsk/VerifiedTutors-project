import express from 'express';
import {
  getTutorRatings,
  createRating,
  updateRating,
  deleteRating
} from '../controllers/rating.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - tutor
 *         - student
 *         - rating
 *         - review
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the rating
 *         tutor:
 *           type: string
 *           description: Reference to Tutor model
 *         student:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             profileImage:
 *               type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value from 1 to 5
 *         review:
 *           type: string
 *           description: Review text
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Whether the rating is verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Rating creation timestamp
 *     TutorRatingUpdate:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           description: Updated average rating of the tutor
 *         totalRatings:
 *           type: number
 *           description: Total number of ratings for the tutor
 */

/**
 * @swagger
 * /api/ratings/tutor/{tutorId}:
 *   get:
 *     summary: Get all ratings for a tutor
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: List of ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *             example:
 *               - _id: "60d21b4667d0d8992e610c85"
 *                 tutor: "60d21b4667d0d8992e610c86"
 *                 student:
 *                   _id: "60d21b4667d0d8992e610c87"
 *                   name: "John Doe"
 *                   profileImage: "https://example.com/profile.jpg"
 *                 rating: 5
 *                 review: "Excellent teaching methods!"
 *                 isVerified: true
 *                 createdAt: "2024-03-15T10:30:00Z"
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching ratings
 */
router.get('/tutor/:tutorId', getTutorRatings);

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Create a new rating (Student only)
 *     description: Creates a new rating and updates the tutor's average rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - rating
 *               - review
 *             properties:
 *               tutorId:
 *                 type: string
 *                 description: Tutor ID
 *                 example: 60d21b4667d0d8992e610c85
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *                 example: 5
 *               review:
 *                 type: string
 *                 description: Review text
 *                 example: Great teaching experience!
 *     responses:
 *       201:
 *         description: Rating created successfully and tutor's average rating updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Rating'
 *                 - type: object
 *                   properties:
 *                     tutorRatingUpdate:
 *                       $ref: '#/components/schemas/TutorRatingUpdate'
 *             example:
 *               _id: "60d21b4667d0d8992e610c85"
 *               tutor: "60d21b4667d0d8992e610c86"
 *               student:
 *                 _id: "60d21b4667d0d8992e610c87"
 *                 name: "John Doe"
 *                 profileImage: "https://example.com/profile.jpg"
 *               rating: 5
 *               review: "Great teaching experience!"
 *               isVerified: false
 *               createdAt: "2024-03-15T10:30:00Z"
 *               tutorRatingUpdate:
 *                 rating: 4.8
 *                 totalRatings: 5
 *       400:
 *         description: Already rated this tutor or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You have already rated this tutor
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
router.post('/', protect, authorize('student'), createRating);

/**
 * @swagger
 * /api/ratings/{id}:
 *   put:
 *     summary: Update a rating (Student only)
 *     description: Updates a rating and recalculates the tutor's average rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: New rating value
 *                 example: 4
 *               review:
 *                 type: string
 *                 description: Updated review text
 *                 example: Updated review text
 *     responses:
 *       200:
 *         description: Rating updated successfully and tutor's average rating recalculated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Rating'
 *                 - type: object
 *                   properties:
 *                     tutorRatingUpdate:
 *                       $ref: '#/components/schemas/TutorRatingUpdate'
 *             example:
 *               _id: "60d21b4667d0d8992e610c85"
 *               tutor: "60d21b4667d0d8992e610c86"
 *               student:
 *                 _id: "60d21b4667d0d8992e610c87"
 *                 name: "John Doe"
 *                 profileImage: "https://example.com/profile.jpg"
 *               rating: 4
 *               review: "Updated review text"
 *               isVerified: false
 *               createdAt: "2024-03-15T10:30:00Z"
 *               tutorRatingUpdate:
 *                 rating: 4.6
 *                 totalRatings: 5
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
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
 *         description: Rating not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rating not found
 */
router.put('/:id', protect, authorize('student'), updateRating);

/**
 * @swagger
 * /api/ratings/{id}:
 *   delete:
 *     summary: Delete a rating (Student only)
 *     description: Deletes a rating and recalculates the tutor's average rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID
 *     responses:
 *       200:
 *         description: Rating deleted successfully and tutor's average rating recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rating removed
 *                 tutorRatingUpdate:
 *                   $ref: '#/components/schemas/TutorRatingUpdate'
 *             example:
 *               message: "Rating removed"
 *               tutorRatingUpdate:
 *                 rating: 4.5
 *                 totalRatings: 4
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
 *         description: Rating not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rating not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting rating
 */
router.delete('/:id', protect, authorize('student'), deleteRating);

export default router; 