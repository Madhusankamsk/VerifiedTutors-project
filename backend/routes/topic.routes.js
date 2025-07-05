import express from 'express';
import {
  getTopics,
  getTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicTutorCount,
  getTopicsTutorCountsBySubject
} from '../controllers/topic.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getTopics);
router.get('/subject/:subjectId', getTopicsBySubject);
router.get('/subject/:subjectId/tutor-counts', getTopicsTutorCountsBySubject);
router.get('/:id/tutor-count', getTopicTutorCount);

// Protected routes (admin only)
router.post('/', protect, admin, createTopic);
router.put('/:id', protect, admin, updateTopic);
router.delete('/:id', protect, admin, deleteTopic);

export default router; 