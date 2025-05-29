import express from 'express';
import { getBlogs, getBlogById, likeBlog } from '../controllers/blog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public blog routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected blog routes
router.post('/:id/like', protect, likeBlog);

export default router; 