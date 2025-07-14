import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import Notification from '../models/notification.model.js';
import socketService from './socketService.js';

/**
 * Notification Service - Handles all email and SMS notifications
 */
class NotificationService {
  /**
   * Send registration notifications
   * @param {Object} user - User object
   * @param {string} user.name - User's name
   * @param {string} user.email - User's email
   * @param {string} user.phone - User's phone number (optional)
   * @param {string} user.role - User's role (tutor/student)
   */
  static async sendRegistrationNotification(user) {
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      
      // Send email
      const emailTemplate = user.role === 'tutor' ? 'tutorRegistration' : 'studentRegistration';
      await sendEmail({
        to: user.email,
        template: emailTemplate,
        context: {
          name: user.name,
          loginUrl
        }
      });

      // Send SMS if phone number exists
      if (user.phone) {
        const smsTemplate = user.role === 'tutor' ? 'tutorRegistration' : 'studentRegistration';
        await sendSMS({
          to: user.phone,
          template: smsTemplate,
          context: {
            name: user.name,
            loginUrl
          }
        });
      }

      // Create database notification
      await this.createRegistrationDatabaseNotification(user);

      console.log(`Registration notifications sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send registration notifications:', error);
      throw error;
    }
  }

  /**
   * Send tutor verification notifications
   * @param {Object} tutor - Tutor object with populated user
   * @param {string} status - 'approved' or 'rejected'
   * @param {string} reason - Rejection reason (optional)
   */
  static async sendVerificationNotification(tutor, status, reason = null) {
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      
      if (status === 'approved') {
        // Send approval notifications
        await sendEmail({
          to: tutor.user.email,
          template: 'tutorApproved',
          context: {
            name: tutor.user.name,
            loginUrl
          }
        });

        if (tutor.phone) {
          await sendSMS({
            to: tutor.phone,
            template: 'tutorApproved',
            context: {
              name: tutor.user.name,
              loginUrl
            }
          });
        }
      } else if (status === 'rejected') {
        // Send rejection notifications
        await sendEmail({
          to: tutor.user.email,
          template: 'tutorRejected',
          context: {
            name: tutor.user.name,
            reason: reason,
            supportEmail: process.env.SUPPORT_EMAIL,
            loginUrl
          }
        });

        if (tutor.phone) {
          await sendSMS({
            to: tutor.phone,
            template: 'tutorRejected',
            context: {
              name: tutor.user.name,
              reason: reason,
              loginUrl
            }
          });
        }
      }

      // Create database notification
      await this.createVerificationDatabaseNotification(tutor, status, reason);

      console.log(`Verification ${status} notifications sent to ${tutor.user.email}`);
    } catch (error) {
      console.error('Failed to send verification notifications:', error);
      throw error;
    }
  }

  /**
   * Send booking notifications
   * @param {Object} booking - Booking object with populated relations
   * @param {string} type - 'confirmation', 'reminder', 'cancelled'
   */
  static async sendBookingNotification(booking, type) {
    try {
      const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
      const formattedDate = new Date(booking.date).toLocaleDateString();

      const context = {
        studentName: booking.student.name,
        tutorName: booking.tutor.user.name,
        subject: booking.subject.name,
        topic: booking.topic.name,
        date: formattedDate,
        time: booking.time,
        duration: booking.duration,
        mode: booking.teachingMode,
        amount: booking.amount,
        dashboardUrl
      };

      // Send to student
      await sendEmail({
        to: booking.student.email,
        template: `booking${type.charAt(0).toUpperCase() + type.slice(1)}`,
        context
      });

      // Send to tutor
      await sendEmail({
        to: booking.tutor.user.email,
        template: `booking${type.charAt(0).toUpperCase() + type.slice(1)}`,
        context
      });

      // Send SMS notifications
      if (booking.student.phone) {
        await sendSMS({
          to: booking.student.phone,
          template: `booking${type.charAt(0).toUpperCase() + type.slice(1)}`,
          context
        });
      }

      if (booking.tutor.phone) {
        await sendSMS({
          to: booking.tutor.phone,
          template: `booking${type.charAt(0).toUpperCase() + type.slice(1)}`,
          context
        });
      }

      // Create database notifications
      await this.createBookingDatabaseNotification(booking, type);

      console.log(`Booking ${type} notifications sent for booking ${booking._id}`);
    } catch (error) {
      console.error('Failed to send booking notifications:', error);
      throw error;
    }
  }

  /**
   * Send password reset notification
   * @param {string} email - User's email
   * @param {string} phone - User's phone number (optional)
   * @param {string} name - User's name
   * @param {string} resetUrl - Password reset URL
   */
  static async sendPasswordResetNotification(email, name, resetUrl, phone = null) {
    try {
      // Send email
      await sendEmail({
        to: email,
        template: 'passwordReset',
        context: {
          name,
          resetUrl
        }
      });

      // Send SMS if phone number exists
      if (phone) {
        await sendSMS({
          to: phone,
          template: 'passwordReset',
          context: {
            name,
            resetUrl
          }
        });
      }

      console.log(`Password reset notification sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset notification:', error);
      throw error;
    }
  }

  /**
   * Send session reminder notifications
   * @param {Object} booking - Booking object with populated relations
   */
  static async sendSessionReminder(booking) {
    try {
      const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
      const formattedDate = new Date(booking.date).toLocaleDateString();

      const context = {
        studentName: booking.student.name,
        tutorName: booking.tutor.user.name,
        subject: booking.subject.name,
        date: formattedDate,
        time: booking.time,
        mode: booking.teachingMode,
        dashboardUrl
      };

      // Send to student
      await sendEmail({
        to: booking.student.email,
        template: 'bookingReminder',
        context
      });

      // Send to tutor
      await sendEmail({
        to: booking.tutor.user.email,
        template: 'bookingReminder',
        context
      });

      // Send SMS notifications
      if (booking.student.phone) {
        await sendSMS({
          to: booking.student.phone,
          template: 'bookingReminder',
          context
        });
      }

      if (booking.tutor.phone) {
        await sendSMS({
          to: booking.tutor.phone,
          template: 'bookingReminder',
          context
        });
      }

      console.log(`Session reminder sent for booking ${booking._id}`);
    } catch (error) {
      console.error('Failed to send session reminder:', error);
      throw error;
    }
  }

  /**
   * Send payment notification
   * @param {Object} booking - Booking object with populated relations
   * @param {number} amount - Payment amount
   */
  static async sendPaymentNotification(booking, amount) {
    try {
      const context = {
        studentName: booking.student.name,
        tutorName: booking.tutor.user.name,
        subject: booking.subject.name,
        amount: amount
      };

      // Send to student
      await sendEmail({
        to: booking.student.email,
        template: 'paymentReceived',
        context
      });

      // Send SMS to student if phone exists
      if (booking.student.phone) {
        await sendSMS({
          to: booking.student.phone,
          template: 'paymentReceived',
          context
        });
      }

      console.log(`Payment notification sent for booking ${booking._id}`);
    } catch (error) {
      console.error('Failed to send payment notification:', error);
      throw error;
    }
  }

  /**
   * Send new review notification
   * @param {Object} review - Review object with populated relations
   */
  static async sendReviewNotification(review) {
    try {
      const context = {
        studentName: review.student.name,
        tutorName: review.tutor.user.name,
        reviewText: review.comment.substring(0, 50) + (review.comment.length > 50 ? '...' : '')
      };

      // Send to tutor
      await sendEmail({
        to: review.tutor.user.email,
        template: 'newReview',
        context
      });

      // Send SMS to tutor if phone exists
      if (review.tutor.phone) {
        await sendSMS({
          to: review.tutor.phone,
          template: 'newReview',
          context
        });
      }

      console.log(`Review notification sent to ${review.tutor.user.email}`);
    } catch (error) {
      console.error('Failed to send review notification:', error);
      throw error;
    }
  }

  /**
   * Send admin notification for new tutor application
   * @param {Object} tutor - Tutor object with populated user
   */
  static async sendNewTutorApplicationNotification(tutor) {
    try {
      const adminUrl = `${process.env.FRONTEND_URL}/admin/tutors`;
      
      const context = {
        tutorName: tutor.user.name,
        adminUrl
      };

      // Send to admin (you can configure admin email in env)
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@verifiedtutors.com';
      
      await sendEmail({
        to: adminEmail,
        template: 'newTutorApplication',
        context
      });

      console.log(`New tutor application notification sent to admin`);
    } catch (error) {
      console.error('Failed to send new tutor application notification:', error);
      throw error;
    }
  }

  /**
   * Send system alert notification
   * @param {string} message - Alert message
   * @param {string} level - 'info', 'warning', 'error'
   */
  static async sendSystemAlert(message, level = 'info') {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@verifiedtutors.com';
      
      await sendEmail({
        to: adminEmail,
        template: 'systemAlert',
        context: {
          message,
          level
        }
      });

      console.log(`System alert sent to admin: ${message}`);
    } catch (error) {
      console.error('Failed to send system alert:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   * @param {Array} notifications - Array of notification objects
   */
  static async sendBulkNotifications(notifications) {
    const results = [];

    for (const notification of notifications) {
      try {
        switch (notification.type) {
          case 'registration':
            await this.sendRegistrationNotification(notification.user);
            break;
          case 'verification':
            await this.sendVerificationNotification(notification.tutor, notification.status, notification.reason);
            break;
          case 'booking':
            await this.sendBookingNotification(notification.booking, notification.bookingType);
            break;
          case 'passwordReset':
            await this.sendPasswordResetNotification(
              notification.email,
              notification.name,
              notification.resetUrl,
              notification.phone
            );
            break;
          case 'sessionReminder':
            await this.sendSessionReminder(notification.booking);
            break;
          case 'payment':
            await this.sendPaymentNotification(notification.booking, notification.amount);
            break;
          case 'review':
            await this.sendReviewNotification(notification.review);
            break;
          default:
            console.warn(`Unknown notification type: ${notification.type}`);
        }

        results.push({ success: true, type: notification.type });
      } catch (error) {
        console.error(`Failed to send ${notification.type} notification:`, error);
        results.push({ success: false, type: notification.type, error: error.message });
      }
    }

    return results;
  }

  /**
   * Create database notification
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.userId - User ID
   * @param {string} notificationData.type - Notification type
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {string} notificationData.category - Notification category
   * @param {Object} notificationData.action - Action object (optional)
   * @param {Object} notificationData.metadata - Additional metadata (optional)
   * @param {string} notificationData.priority - Priority level (optional)
   * @param {Date} notificationData.expiresAt - Expiration date (optional)
   */
  static async createDatabaseNotification(notificationData) {
    try {
      const notification = await Notification.createNotification(notificationData);
      console.log(`Database notification created: ${notification._id}`);
      
      // Send real-time notification
      socketService.sendNotificationToUser(notificationData.user, {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        category: notification.category,
        action: notification.action,
        priority: notification.priority,
        createdAt: notification.createdAt,
        read: false
      });
      
      return notification;
    } catch (error) {
      console.error('Failed to create database notification:', error);
      throw error;
    }
  }

  /**
   * Create booking notification in database
   * @param {Object} booking - Booking object with populated relations
   * @param {string} type - 'confirmation', 'reminder', 'cancelled'
   */
  static async createBookingDatabaseNotification(booking, type) {
    try {
      const notificationData = {
        user: booking.student._id,
        type: 'booking',
        category: 'booking',
        priority: type === 'reminder' ? 'high' : 'medium',
        metadata: {
          bookingId: booking._id,
          tutorId: booking.tutor._id,
          subjectId: booking.subject._id,
          type: type
        }
      };

      // Student notification
      if (type === 'confirmation') {
        notificationData.title = 'Booking Confirmed';
        notificationData.message = `Your booking with ${booking.tutor.user.name} for ${booking.subject.name} has been confirmed.`;
        notificationData.action = {
          label: 'View Booking',
          url: `/student/bookings/${booking._id}`
        };
      } else if (type === 'reminder') {
        notificationData.title = 'Session Reminder';
        notificationData.message = `Your session with ${booking.tutor.user.name} is starting soon.`;
        notificationData.action = {
          label: 'Join Session',
          url: `/student/bookings/${booking._id}`
        };
      } else if (type === 'cancelled') {
        notificationData.title = 'Booking Cancelled';
        notificationData.message = `Your booking with ${booking.tutor.user.name} has been cancelled.`;
        notificationData.action = {
          label: 'Book Again',
          url: '/tutors'
        };
      }

      await this.createDatabaseNotification(notificationData);

      // Tutor notification
      const tutorNotificationData = {
        ...notificationData,
        user: booking.tutor.user._id,
        action: {
          label: 'View Booking',
          url: `/tutor/bookings/${booking._id}`
        }
      };

      if (type === 'confirmation') {
        tutorNotificationData.title = 'New Booking Received';
        tutorNotificationData.message = `${booking.student.name} has booked a session with you for ${booking.subject.name}.`;
      } else if (type === 'reminder') {
        tutorNotificationData.title = 'Session Reminder';
        tutorNotificationData.message = `Your session with ${booking.student.name} is starting soon.`;
      } else if (type === 'cancelled') {
        tutorNotificationData.title = 'Booking Cancelled';
        tutorNotificationData.message = `Your booking with ${booking.student.name} has been cancelled.`;
      }

      await this.createDatabaseNotification(tutorNotificationData);

      // Send real-time booking update
      socketService.sendBookingUpdate(booking, type);

      console.log(`Booking database notifications created for ${type}`);
    } catch (error) {
      console.error('Failed to create booking database notifications:', error);
      throw error;
    }
  }

  /**
   * Create verification notification in database
   * @param {Object} tutor - Tutor object with populated user
   * @param {string} status - 'approved' or 'rejected'
   * @param {string} reason - Rejection reason (optional)
   */
  static async createVerificationDatabaseNotification(tutor, status, reason = null) {
    try {
      const notificationData = {
        user: tutor.user._id,
        type: 'verification',
        category: 'verification',
        priority: 'high',
        metadata: {
          tutorId: tutor._id,
          status: status,
          reason: reason
        }
      };

      if (status === 'approved') {
        notificationData.title = 'Profile Approved!';
        notificationData.message = 'Congratulations! Your tutor profile has been verified and approved. You can now start accepting students.';
        notificationData.action = {
          label: 'View Profile',
          url: '/tutor/profile'
        };
      } else if (status === 'rejected') {
        notificationData.title = 'Profile Verification Failed';
        notificationData.message = `Your profile verification was unsuccessful. Reason: ${reason}. Please update your profile and try again.`;
        notificationData.action = {
          label: 'Update Profile',
          url: '/tutor/profile'
        };
      }

      await this.createDatabaseNotification(notificationData);
      console.log(`Verification database notification created for ${status}`);
    } catch (error) {
      console.error('Failed to create verification database notification:', error);
      throw error;
    }
  }

  /**
   * Create registration notification in database
   * @param {Object} user - User object
   */
  static async createRegistrationDatabaseNotification(user) {
    try {
      const notificationData = {
        user: user._id,
        type: 'success',
        category: 'system',
        priority: 'medium',
        metadata: {
          role: user.role
        }
      };

      if (user.role === 'tutor') {
        notificationData.title = 'Welcome to VerifiedTutors!';
        notificationData.message = 'Your tutor account has been created successfully. Complete your profile to start accepting students.';
        notificationData.action = {
          label: 'Complete Profile',
          url: '/tutor/profile'
        };
      } else {
        notificationData.title = 'Welcome to VerifiedTutors!';
        notificationData.message = 'Your student account is ready. Start browsing tutors and booking sessions.';
        notificationData.action = {
          label: 'Find Tutors',
          url: '/tutors'
        };
      }

      await this.createDatabaseNotification(notificationData);
      console.log(`Registration database notification created for ${user.role}`);
    } catch (error) {
      console.error('Failed to create registration database notification:', error);
      throw error;
    }
  }
}

export default NotificationService; 