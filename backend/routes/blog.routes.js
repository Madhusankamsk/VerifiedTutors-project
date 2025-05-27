import express from 'express';
import { getBlogs, getBlogById } from '../controllers/blog.controller.js';

const router = express.Router();

// Public blog routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

export default router; 