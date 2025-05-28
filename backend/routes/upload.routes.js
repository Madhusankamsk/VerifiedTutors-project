import express from 'express';
import { upload } from '../config/cloudinary.js';
import { 
  uploadProfilePhoto, 
  uploadVerificationDocs, 
  deleteImage 
} from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.post('/verification-docs', protect, upload.array('documents', 5), uploadVerificationDocs);
router.delete('/:publicId', protect, deleteImage);

export default router; 