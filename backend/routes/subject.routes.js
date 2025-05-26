import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subject.controller.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - name
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the subject
 *         name:
 *           type: string
 *           description: Name of the subject
 *           example: "Advanced Mathematics"
 *         category:
 *           type: string
 *           enum: [Science, Mathematics, Languages, Arts, Computer Science, Business, Other]
 *           description: Category of the subject
 *           example: "Mathematics"
 *         description:
 *           type: string
 *           description: Detailed description of the subject
 *           example: "Advanced topics in mathematics including calculus and linear algebra"
 *         level:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced, All Levels]
 *           default: "All Levels"
 *           description: Difficulty level of the subject
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the subject is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Subject creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Retrieve a list of all active subjects
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: List of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *             example:
 *               - _id: "60d21b4667d0d8992e610c85"
 *                 name: "Advanced Mathematics"
 *                 category: "Mathematics"
 *                 description: "Advanced topics in mathematics"
 *                 level: "Advanced"
 *                 isActive: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching subjects
 */

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     description: Retrieve detailed information about a specific subject
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching subject
 */

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject (Admin only)
 *     description: Create a new subject in the system
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the subject
 *                 example: "Advanced Mathematics"
 *               category:
 *                 type: string
 *                 enum: [Science, Mathematics, Languages, Arts, Computer Science, Business, Other]
 *                 description: Category of the subject
 *                 example: "Mathematics"
 *               description:
 *                 type: string
 *                 description: Detailed description of the subject
 *                 example: "Advanced topics in mathematics including calculus and linear algebra"
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced, All Levels]
 *                 default: "All Levels"
 *                 description: Difficulty level of the subject
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the subject is active
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
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
 * /api/subjects/{id}:
 *   put:
 *     summary: Update a subject (Admin only)
 *     description: Update an existing subject's information
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Science, Mathematics, Languages, Arts, Computer Science, Business, Other]
 *               description:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced, All Levels]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
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
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject not found
 */

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete a subject (Admin only)
 *     description: Delete an existing subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject removed
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
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subject not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting subject
 */

// Public routes
router.get('/', getSubjects);
router.get('/:id', getSubject);

// Admin only routes
router.post('/', protect, authorize('admin'), createSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

export default router; 