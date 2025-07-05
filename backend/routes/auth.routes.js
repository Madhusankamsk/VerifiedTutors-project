import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  googleAuth,
  googleCallback,
  updateGoogleUserRole,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.put('/google/update-role', protect, updateGoogleUserRole);
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);

export default router;