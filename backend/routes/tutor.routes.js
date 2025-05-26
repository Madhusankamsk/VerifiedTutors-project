import express from 'express';
import {
  getTutors,
  getTutor,
  createTutorProfile,
  updateTutorProfile,
  deleteTutorProfile,
  getTutorAvailability,
  updateAvailability,
  getTutorBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getTutorByUserId,
  updateSubjects,
  updateLocations,
  updateEducation,
  updateExperience,
  updateHourlyRate,
  updateBio
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Tutor:
 *       type: object
 *       required:
 *         - user
 *         - subjects
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the tutor
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             profileImage:
 *               type: string
 *         bio:
 *           type: string
 *           description: Tutor's biography
 *         subjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *         education:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               degree:
 *                 type: string
 *               institution:
 *                 type: string
 *               year:
 *                 type: number
 *         experience:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               duration:
 *                 type: string
 *               description:
 *                 type: string
 *         hourlyRate:
 *           type: number
 *           description: Price per hour
 *         availability:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                     end:
 *                       type: string
 *         rating:
 *           type: number
 *           description: Average rating (0-5)
 *         totalRatings:
 *           type: number
 *           description: Total number of ratings
 *         isVerified:
 *           type: boolean
 *           description: Whether the tutor is verified
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of document URLs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Profile creation timestamp
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the blog
 *         title:
 *           type: string
 *           description: The blog post title
 *         content:
 *           type: string
 *           description: The blog post content
 *         author:
 *           type: string
 *           description: Reference to the Tutor model
 *         featuredImage:
 *           type: string
 *           description: URL to the featured image
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tags for the blog post
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           description: The status of the blog post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Blog creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * tags:
 *   name: Tutors
 *   description: Tutor management API
 */

/**
 * @swagger
 * /api/tutors:
 *   get:
 *     summary: Get all tutors
 *     description: Retrieve a list of tutors with optional filtering
 *     tags: [Tutors]
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Filter by minimum rating
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         description: Filter by maximum price per hour
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: List of tutors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutor'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new tutor profile
 *     description: Create a new tutor profile for the authenticated user
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjects
 *               - hourlyRate
 *               - bio
 *             properties:
 *               bio:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *               hourlyRate:
 *                 type: number
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Tutor profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       400:
 *         description: Invalid input or profile already exists
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as tutor
 */

/**
 * @swagger
 * /api/tutors/{id}:
 *   get:
 *     summary: Get tutor by ID
 *     description: Retrieve detailed information about a specific tutor
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       404:
 *         description: Tutor not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tutors/{id}/availability:
 *   get:
 *     summary: Get tutor's availability
 *     description: Retrieve the weekly availability schedule of a tutor
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor's availability
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: string
 *                     enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                   slots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                         end:
 *                           type: string
 *       404:
 *         description: Tutor not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tutors/profile:
 *   get:
 *     summary: Get authenticated tutor's profile
 *     description: Retrieve the profile of the currently authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutor profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 *   put:
 *     summary: Update authenticated tutor's profile
 *     description: Update the profile of the currently authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *               hourlyRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 *   delete:
 *     summary: Delete authenticated tutor's profile
 *     description: Delete the profile of the currently authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/availability:
 *   put:
 *     summary: Update tutor's availability
 *     description: Update the availability schedule of the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                       end:
 *                         type: string
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/subjects:
 *   put:
 *     summary: Update tutor's subjects
 *     description: Update the subjects taught by the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Subjects updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/locations:
 *   put:
 *     summary: Update tutor's locations
 *     description: Update the teaching locations of the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Locations updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/education:
 *   put:
 *     summary: Update tutor's education
 *     description: Update the education history of the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: number
 *     responses:
 *       200:
 *         description: Education updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/experience:
 *   put:
 *     summary: Update tutor's experience
 *     description: Update the work experience of the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     company:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/hourly-rate:
 *   put:
 *     summary: Update tutor's hourly rate
 *     description: Update the hourly rate of the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hourlyRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Hourly rate updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/bio:
 *   put:
 *     summary: Update tutor's bio
 *     description: Update the biography of the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bio updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */

// Public routes
router.get('/', getTutors);
router.get('/:id', getTutor);
router.get('/:id/availability', getTutorAvailability);

// Protected routes - require authentication
router.get('/profile', protect, getTutorByUserId);

// Tutor-only routes
router.post('/', protect, authorize('tutor'), createTutorProfile);
router.put('/profile', protect, authorize('tutor'), updateTutorProfile);
router.delete('/profile', protect, authorize('tutor'), deleteTutorProfile);

// Additional profile update routes
router.put('/availability', protect, authorize('tutor'), updateAvailability);
router.put('/subjects', protect, authorize('tutor'), updateSubjects);
router.put('/locations', protect, authorize('tutor'), updateLocations);
router.put('/education', protect, authorize('tutor'), updateEducation);
router.put('/experience', protect, authorize('tutor'), updateExperience);
router.put('/hourly-rate', protect, authorize('tutor'), updateHourlyRate);
router.put('/bio', protect, authorize('tutor'), updateBio);

// Blog routes
router.get('/blogs', protect, authorize('tutor'), getTutorBlogs);
router.post('/blogs', protect, authorize('tutor'), createBlog);
router.put('/blogs/:id', protect, authorize('tutor'), updateBlog);
router.delete('/blogs/:id', protect, authorize('tutor'), deleteBlog);

export default router; 