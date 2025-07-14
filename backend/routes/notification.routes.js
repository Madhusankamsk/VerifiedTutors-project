import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createNotification,
  getNotificationStats,
  getAllNotifications,
  adminCreateNotification,
  bulkCreateNotifications,
  cleanupOldNotifications
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// User notification routes (protected)
router.use(protect);

// Get user notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark notifications as read
router.patch('/mark-read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete specific notification
router.delete('/:id', deleteNotification);

// Delete all read notifications
router.delete('/delete-read', deleteReadNotifications);

// Create notification (for internal use)
router.post('/', createNotification);

// Admin routes (protected + admin)
router.use(admin);

// Get all notifications (admin)
router.get('/admin/all', getAllNotifications);

// Create notification for specific user (admin)
router.post('/admin/create', adminCreateNotification);

// Bulk create notifications (admin)
router.post('/admin/bulk', bulkCreateNotifications);

// Cleanup old notifications (admin)
router.delete('/admin/cleanup', cleanupOldNotifications);

export default router; 