import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Subject from '../models/subject.model.js';
import Booking from '../models/booking.model.js';
import { sendEmail } from '../services/emailService.js';

// @desc    Get all tutors
// @route   GET /api/admin/tutors
// @access  Private/Admin
export const getAllTutors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const verified = req.query.verified || 'all';
    const rating = req.query.rating || 'all';
    const sortBy = req.query.sortBy || 'newest';

    // Build query
    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by verification status
    if (verified !== 'all') {
      query.isVerified = verified === 'verified';
    }

    // Filter by rating
    if (rating !== 'all') {
      query.rating = { $gte: parseInt(rating) };
    }

    // Get total count for pagination
    const total = await Tutor.countDocuments(query);

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'name':
        sort = { 'user.name': 1 };
        break;
      default: // newest
        sort = { createdAt: -1 };
    }

    // Get tutors with pagination
    const tutors = await Tutor.find(query)
      .populate('user', 'name email profileImage')
      .populate({
        path: 'subjects.subject',
        select: 'name category'
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // Ensure we're sending a proper JSON response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      tutors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTutors: total
    });
  } catch (error) {
    console.error('Error in getAllTutors:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      message: 'Error fetching tutors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get total tutors
    const totalTutors = await Tutor.countDocuments();

    // Get total students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Get active subjects
    const activeSubjects = await Subject.countDocuments({ isActive: true });

    // Get pending verifications
    const pendingVerifications = await Tutor.countDocuments({ verificationStatus: 'pending' });

    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get total revenue (sum of all completed bookings)
    const bookings = await Booking.find({ status: 'completed' });
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);

    res.json({
      totalTutors,
      totalStudents,
      activeSubjects,
      pendingVerifications,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve tutor
// @route   PATCH /api/admin/tutors/:id/approve
// @access  Private/Admin
export const approveTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).populate('user', 'email name');
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.isVerified) {
      return res.status(400).json({ message: 'Tutor is already verified' });
    }

    // Update tutor verification status
    tutor.isVerified = true;
    tutor.verificationStatus = 'approved';
    tutor.verificationDate = new Date();
    tutor.verifiedBy = req.user._id;
    tutor.verificationChecks = {
      documents: true,
      education: true,
      experience: true,
      background: true,
      interview: true
    };

    await tutor.save();

    // Send approval email to tutor
    try {
      await sendEmail({
        to: tutor.user.email,
        subject: 'Tutor Profile Approved',
        template: 'tutorApproved',
        context: {
          name: tutor.user.name,
          loginUrl: `${process.env.FRONTEND_URL}/login`
        }
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the verification if email fails
    }

    res.json({
      message: 'Tutor approved successfully',
      tutor
    });
  } catch (error) {
    console.error('Error in approveTutor:', error);
    res.status(500).json({ 
      message: 'Failed to approve tutor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reject tutor
// @route   PATCH /api/admin/tutors/:id/reject
// @access  Private/Admin
export const rejectTutor = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const tutor = await Tutor.findById(req.params.id).populate('user', 'email name');
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Update tutor verification status
    tutor.isVerified = false;
    tutor.verificationStatus = 'rejected';
    tutor.verificationDate = new Date();
    tutor.verifiedBy = req.user._id;
    tutor.rejectionReason = reason;
    tutor.verificationChecks = {
      documents: false,
      education: false,
      experience: false,
      background: false,
      interview: false
    };

    await tutor.save();

    // Send rejection email to tutor
    await sendEmail({
      to: tutor.user.email,
      subject: 'Tutor Profile Rejected',
      template: 'tutorRejected',
      context: {
        name: tutor.user.name,
        reason: reason,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    });

    res.json({
      message: 'Tutor rejected successfully',
      tutor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tutor verification details
// @route   GET /api/admin/tutors/:id/verification
// @access  Private/Admin
export const getTutorVerificationDetails = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('user', 'name email profileImage')
      .populate('subjects', 'name category')
      .select('+verificationChecks +rejectionReason +verificationDate +verifiedBy');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';
    const sortBy = req.query.sortBy || 'newest';

    // Build query
    let query = {};

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'startTime':
        sort = { startTime: 1 };
        break;
      default: // newest
        sort = { createdAt: -1 };
    }

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('student', 'name email profileImage')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .populate('subject', 'name category')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Notify tutor about booking
// @route   POST /api/admin/bookings/:id/notify
// @access  Private/Admin
export const notifyTutorAboutBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name email')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('subject', 'name');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status to 'notified'
    booking.status = 'notified';
    await booking.save();

    // Send email notification to tutor
    try {
      await sendEmail({
        to: booking.tutor.user.email,
        subject: 'New Tutoring Session Booking',
        template: 'bookingNotification',
        context: {
          tutorName: booking.tutor.user.name,
          studentName: booking.student.name,
          subject: booking.subject.name,
          startTime: new Date(booking.startTime).toLocaleString(),
          endTime: new Date(booking.endTime).toLocaleString(),
          amount: booking.amount,
          notes: booking.notes || 'No additional notes',
          dashboardUrl: `${process.env.FRONTEND_URL}/tutor/dashboard`
        }
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      return res.status(500).json({ 
        message: 'Failed to send notification email',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    res.json({
      message: 'Tutor notified successfully',
      booking
    });
  } catch (error) {
    console.error('Error in notifyTutorAboutBooking:', error);
    res.status(500).json({ 
      message: 'Failed to notify tutor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 