import express from 'express';
import {
  getTutors,
  getTutor,
  createTutorProfile,
  updateTutorProfile,
  deleteTutorProfile,
  getTutorAvailability,
  updateTutorAvailability,
  getTutorBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/tutor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
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
 *             example:
 *               - _id: "60d21b4667d0d8992e610c85"
 *                 user:
 *                   _id: "60d21b4667d0d8992e610c86"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   profileImage: "https://example.com/profile.jpg"
 *                 bio: "Experienced math tutor"
 *                 subjects:
 *                   - _id: "60d21b4667d0d8992e610c87"
 *                     name: "Mathematics"
 *                     category: "Science"
 *                 hourlyRate: 50
 *                 rating: 4.5
 *                 totalRatings: 10
 *                 isVerified: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching tutors
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
 *                   example: Error fetching tutor
 */

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
 *               bio:
 *                 type: string
 *                 description: Tutor's biography
 *                 example: "Experienced math tutor with 5 years of teaching"
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of subject IDs
 *                 example: ["60d21b4667d0d8992e610c87"]
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
 *                 description: Price per hour
 *                 example: 50
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
 *                           end:
 *                             type: string
 *     responses:
 *       201:
 *         description: Tutor profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       400:
 *         description: Tutor profile already exists or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tutor profile already exists
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
 *         description: Forbidden - Not a tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as a tutor
 */

/**
 * @swagger
 * /api/tutors/{id}:
 *   put:
 *     summary: Update a tutor profile
 *     description: Update an existing tutor profile
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
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
 *     responses:
 *       200:
 *         description: Tutor profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
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
 *         description: Forbidden - Not the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
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
 * /api/tutors/{id}:
 *   delete:
 *     summary: Delete a tutor profile
 *     description: Delete an existing tutor profile
 *     tags: [Tutors]
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
 *         description: Tutor profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tutor profile removed
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
 *         description: Forbidden - Not the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
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
 *                   example: Error deleting tutor profile
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
 *                   example: Error fetching availability
 */

/**
 * @swagger
 * /api/tutors/{id}/availability:
 *   put:
 *     summary: Update tutor's availability
 *     description: Update the weekly availability schedule of a tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - day
 *                 - slots
 *               properties:
 *                 day:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - start
 *                       - end
 *                     properties:
 *                       start:
 *                         type: string
 *                         example: "09:00"
 *                       end:
 *                         type: string
 *                         example: "17:00"
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: string
 *                   slots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                         end:
 *                           type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid availability data
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
 *         description: Forbidden - Not the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized, no token
 *       403:
 *         description: Forbidden - Not a tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as a tutor
 *       404:
 *         description: Tutor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tutor profile not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching blogs
 */

/**
 * @swagger
 * /api/tutors/blogs:
 *   post:
 *     summary: Create a new blog
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
 *                 description: Blog post title
 *                 example: "Tips for Learning Mathematics"
 *               content:
 *                 type: string
 *                 description: Blog post content
 *                 example: "Here are some effective strategies..."
 *               featuredImage:
 *                 type: string
 *                 description: URL to the featured image
 *                 example: "https://example.com/image.jpg"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tags
 *                 example: ["mathematics", "education", "tips"]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: Blog post status
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
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
 *         description: Forbidden - Not a tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized as a tutor
 *       404:
 *         description: Tutor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tutor profile not found
 */

/**
 * @swagger
 * /api/tutors/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     description: Update an existing blog post
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
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
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
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
 *         description: Forbidden - Not the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found
 */

/**
 * @swagger
 * /api/tutors/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Delete an existing blog post
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog removed
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
 *         description: Forbidden - Not the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting blog
 */

// Tutor routes
router.get('/', getTutors);
router.get('/:id', getTutor);
router.post('/', protect, authorize('tutor'), createTutorProfile);
router.put('/:id', protect, authorize('tutor'), updateTutorProfile);
router.delete('/:id', protect, authorize('tutor'), deleteTutorProfile);
router.get('/:id/availability', getTutorAvailability);
router.put('/:id/availability', protect, authorize('tutor'), updateTutorAvailability);

// Blog routes
router.get('/blogs', protect, authorize('tutor'), getTutorBlogs);
router.post('/blogs', protect, authorize('tutor'), createBlog);
router.put('/blogs/:id', protect, authorize('tutor'), updateBlog);
router.delete('/blogs/:id', protect, authorize('tutor'), deleteBlog);

export default router; 