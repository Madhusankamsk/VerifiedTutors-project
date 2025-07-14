import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'booking', 'verification', 'payment', 'review'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['system', 'booking', 'verification', 'payment', 'review', 'general'],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  action: {
    label: String,
    url: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, category: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  return await notification.save();
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  const query = { user: userId };
  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }
  
  return await this.updateMany(query, { read: true });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, read: false });
};

// Static method to get notifications with pagination
notificationSchema.statics.getNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    read = null,
    category = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { user: userId };
  
  if (read !== null) {
    query.read = read;
  }
  
  if (category) {
    query.category = category;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    notifications,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total
  };
};

// Static method to delete old notifications
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 