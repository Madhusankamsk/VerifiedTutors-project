import Notification from '../models/notification.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get user notifications with pagination
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 20,
    read = null,
    category = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    read: read === 'true' ? true : read === 'false' ? false : null,
    category,
    sortBy,
    sortOrder
  };

  const result = await Notification.getNotifications(userId, options);

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await Notification.getUnreadCount(userId);

  res.json({
    success: true,
    data: { unreadCount: count }
  });
});

// @desc    Mark notifications as read
// @route   PATCH /api/notifications/mark-read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationIds } = req.body;

  const result = await Notification.markAsRead(userId, notificationIds);

  res.json({
    success: true,
    message: 'Notifications marked as read',
    data: { updatedCount: result.modifiedCount }
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.markAsRead(userId);

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: { updatedCount: result.modifiedCount }
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/delete-read
// @access  Private
export const deleteReadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.deleteMany({
    user: userId,
    read: true
  });

  res.json({
    success: true,
    message: 'Read notifications deleted successfully',
    data: { deletedCount: result.deletedCount }
  });
});

// @desc    Create notification (for internal use)
// @route   POST /api/notifications
// @access  Private
export const createNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    type,
    title,
    message,
    category = 'general',
    action,
    metadata = {},
    priority = 'medium',
    expiresAt = null
  } = req.body;

  const notification = await Notification.createNotification({
    user: userId,
    type,
    title,
    message,
    category,
    action,
    metadata,
    priority,
    expiresAt: expiresAt ? new Date(expiresAt) : null
  });

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
export const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    totalNotifications,
    unreadCount,
    readCount,
    categoryStats
  ] = await Promise.all([
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, read: false }),
    Notification.countDocuments({ user: userId, read: true }),
    Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])
  ]);

  const stats = {
    total: totalNotifications,
    unread: unreadCount,
    read: readCount,
    categories: categoryStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Admin: Get all notifications (for admin dashboard)
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getAllNotifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    userId = null,
    category = null,
    read = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};
  
  if (userId) {
    query.user = userId;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (read !== null) {
    query.read = read === 'true';
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('user', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Notification.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasMore: parseInt(page) * parseInt(limit) < total
    }
  });
});

// @desc    Admin: Create notification for specific user
// @route   POST /api/admin/notifications
// @access  Private/Admin
export const adminCreateNotification = asyncHandler(async (req, res) => {
  const {
    userId,
    type,
    title,
    message,
    category = 'system',
    action,
    metadata = {},
    priority = 'medium',
    expiresAt = null
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const notification = await Notification.createNotification({
    user: userId,
    type,
    title,
    message,
    category,
    action,
    metadata,
    priority,
    expiresAt: expiresAt ? new Date(expiresAt) : null
  });

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
});

// @desc    Admin: Bulk create notifications
// @route   POST /api/admin/notifications/bulk
// @access  Private/Admin
export const bulkCreateNotifications = asyncHandler(async (req, res) => {
  const { notifications } = req.body;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Notifications array is required'
    });
  }

  const createdNotifications = await Notification.insertMany(notifications);

  res.status(201).json({
    success: true,
    message: `${createdNotifications.length} notifications created successfully`,
    data: { createdCount: createdNotifications.length }
  });
});

// @desc    Admin: Cleanup old notifications
// @route   DELETE /api/admin/notifications/cleanup
// @access  Private/Admin
export const cleanupOldNotifications = asyncHandler(async (req, res) => {
  const { daysOld = 90 } = req.query;

  const result = await Notification.cleanupOldNotifications(parseInt(daysOld));

  res.json({
    success: true,
    message: 'Old notifications cleaned up successfully',
    data: { deletedCount: result.deletedCount }
  });
}); 