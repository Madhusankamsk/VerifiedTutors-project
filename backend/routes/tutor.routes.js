import express from 'express';
import {
  getTutors,
  getTutor,
  createTutorProfile,
  updateTutorProfile,
  deleteTutorProfile,
  getTutorAvailability,
  getTutorBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getTutorByUserId
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateTutorProfile } from '../middleware/validation.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Tutors
 *   description: Tutor management API
 */

const router = express.Router();

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
 */
router.get('/', getTutors);

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
router.get('/:id', getTutor);

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
 *                           format: time
 *                         end:
 *                           type: string
 *                           format: time
 *       404:
 *         description: Tutor not found
 *       500:
 *         description: Server error
 */
router.get('/:id/availability', getTutorAvailability);

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
 */
router.get('/profile', protect, getTutorByUserId);

/**
 * @swagger
 * /api/tutors:
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
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               bio:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
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
 *               hourlyRate:
 *                 type: number
 *                 minimum: 0
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           start:
 *                             type: string
 *                             format: time
 *                           end:
 *                             type: string
 *                             format: time
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
router.post('/', protect, authorize('tutor'), validateTutorProfile, createTutorProfile);

/**
 * @swagger
 * /api/tutors/profile:
 *   patch:
 *     summary: Update tutor profile (partial update)
 *     description: Update specific fields of the tutor profile
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
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               bio:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
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
 *               hourlyRate:
 *                 type: number
 *                 minimum: 0
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           start:
 *                             type: string
 *                             format: time
 *                           end:
 *                             type: string
 *                             format: time
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */
router.patch('/profile', protect, authorize('tutor'), updateTutorProfile);

/**
 * @swagger
 * /api/tutors/profile:
 *   put:
 *     summary: Update tutor profile (full update)
 *     description: Update the entire tutor profile. All fields must be provided.
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tutor'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */
router.put('/profile', protect, authorize('tutor'), validateTutorProfile, updateTutorProfile);

/**
 * @swagger
 * /api/tutors/profile:
 *   delete:
 *     summary: Delete tutor profile
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
router.delete('/profile', protect, authorize('tutor'), deleteTutorProfile);

/**
 * @swagger
 * /api/tutors/blogs:
 *   get:
 *     summary: Get tutor's blogs
 *     description: Retrieve all blogs written by the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tutor's blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */
router.get('/blogs', protect, authorize('tutor'), getTutorBlogs);

/**
 * @swagger
 * /api/tutors/blogs:
 *   post:
 *     summary: Create a new blog post
 *     description: Create a new blog post as the authenticated tutor
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
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */
router.post('/blogs', protect, authorize('tutor'), createBlog);

/**
 * @swagger
 * /api/tutors/blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     description: Update an existing blog post by the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Blog post not found
 */
router.put('/blogs/:id', protect, authorize('tutor'), updateBlog);

/**
 * @swagger
 * /api/tutors/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Delete an existing blog post by the authenticated tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Blog post not found
 */
router.delete('/blogs/:id', protect, authorize('tutor'), deleteBlog);

/**
 * @swagger
 * /api/tutors/user/{userId}:
 *   get:
 *     summary: Get tutor profile by user ID
 *     description: Retrieve tutor profile information using the associated user ID
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID associated with the tutor
 *     responses:
 *       200:
 *         description: Tutor profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Tutor profile not found
 */
router.get('/user/:userId', protect, getTutorByUserId);

export default router; 