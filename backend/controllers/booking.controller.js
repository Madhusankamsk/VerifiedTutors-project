import Booking from '../models/booking.model.js';
import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Subject from '../models/subject.model.js';
import Topic from '../models/topic.model.js';
import NotificationService from '../services/notificationService.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      tutorId,
      subjectId,
      startTime,
      endTime,
      duration,
      learningMethod,
      contactNumber,
      selectedTopics,
      notes
    } = req.body;

    const studentId = req.user._id;

    // Validate tutor exists and is verified
    const tutor = await Tutor.findById(tutorId).populate('user', 'name email');
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (!tutor.isVerified) {
      return res.status(400).json({ message: 'Cannot book with unverified tutor' });
    }

    // Validate subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(400).json({ message: 'Invalid subject' });
    }

    // Get the first topic if selectedTopics array is provided
    let topicId = null;
    if (selectedTopics && selectedTopics.length > 0) {
      topicId = selectedTopics[0]; // Use the first selected topic
    }

    // Map learning method to backend format
    const teachingMode = learningMethod === 'home-visit' ? 'individual' : learningMethod;

    // Calculate amount based on duration and tutor's rate
    let amount = 0;
    const tutorSubject = tutor.subjects.find(subj => subj.subject.toString() === subjectId);
    if (tutorSubject) {
      const teachingModeData = tutorSubject.teachingModes.find(mode => mode.type === teachingMode);
      if (teachingModeData) {
        amount = teachingModeData.rate * duration;
      }
    }

    // Create booking
    const booking = await Booking.create({
      student: studentId,
      tutor: tutorId,
      subject: subjectId,
      topic: topicId,
      date: startTime,
      time: startTime,
      duration,
      teachingMode,
      amount,
      notes,
      status: 'confirmed'
    });

    // Populate booking with details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('student', 'name email')
      .populate('tutor', 'user')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('selectedTopics', 'name description')
      .populate({
        path: 'tutor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    // Send notifications using centralized service
    try {
      await NotificationService.sendBookingNotification(populatedBooking, 'confirmation');
      console.log('Booking notifications sent successfully');
    } catch (notificationError) {
      console.error('Failed to send booking notifications:', notificationError);
      // Don't fail the booking if notifications fail
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all bookings for a user (student or tutor)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    
    if (userRole === 'student') {
      query.student = userId;
    } else if (userRole === 'tutor') {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor) {
        return res.status(404).json({ message: 'Tutor profile not found' });
      }
      query.tutor = tutor._id;
    }

    const bookings = await Booking.find(query)
      .populate('student', 'name email')
      .populate('tutor', 'user')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('selectedTopics', 'name description')
      .populate({
        path: 'tutor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
};

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name email')
      .populate('tutor', 'user')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('selectedTopics', 'name description')
      .populate({
        path: 'tutor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === 'student' && booking.student._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    if (userRole === 'tutor') {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor || booking.tutor._id.toString() !== tutor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ message: 'Failed to get booking' });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('student', 'name email phone')
      .populate('tutor', 'user phone')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate({
        path: 'tutor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === 'student' && booking.student._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (userRole === 'tutor') {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor || booking.tutor._id.toString() !== tutor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Send notifications based on status change
    try {
      if (status === 'cancelled') {
        await NotificationService.sendBookingNotification(booking, 'cancelled');
      }
    } catch (notificationError) {
      console.error('Failed to send status change notifications:', notificationError);
    }

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === 'student' && booking.student.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    if (userRole === 'tutor') {
      const tutor = await Tutor.findOne({ user: userId });
      if (!tutor || booking.tutor.toString() !== tutor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this booking' });
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};

// @desc    Send booking reminder
// @route   POST /api/bookings/:id/reminder
// @access  Private
export const sendBookingReminder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name email phone')
      .populate('tutor', 'user phone')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate({
        path: 'tutor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Send reminder notifications using centralized service
    try {
      await NotificationService.sendSessionReminder(booking);
      res.json({ message: 'Reminders sent successfully' });
    } catch (notificationError) {
      console.error('Failed to send reminders:', notificationError);
      res.status(500).json({ message: 'Failed to send reminders' });
    }
  } catch (error) {
    console.error('Error sending booking reminder:', error);
    res.status(500).json({ message: 'Failed to send booking reminder' });
  }
}; 