import express from 'express';
import {
  getTopics,
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic
} from '../controllers/topic.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getTopics);
router.get('/subject/:subjectId', getTopicsBySubject);
router.get('/:id', getTopicById);

// Protected routes (admin only)
router.post('/', protect, admin, createTopic);
router.put('/:id', protect, admin, updateTopic);
router.delete('/:id', protect, admin, deleteTopic);

export default router; 