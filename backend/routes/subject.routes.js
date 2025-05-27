import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subject.controller.js';

const router = express.Router();

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', protect, authorize('admin'), createSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

export default router; 