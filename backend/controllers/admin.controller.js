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
    const limit = parseInt(req.query.limit) || 24;
    const search = req.query.search || '';
    const verified = req.query.verified || 'all';
    const rating = req.query.rating || 'all';
    const sortBy = req.query.sortBy || 'newest';

    // Build query
    let query = {};

    // Search by name or email
    if (search) {
      // First, find users with matching name or email
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      // Then, filter tutors by these user IDs
      if (users.length > 0) {
        const userIds = users.map(user => user._id);
        query.user = { $in: userIds };
      } else {
        // If no matching users, return empty result
        query.user = { $in: [] };
      }
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

    // Map the tutor data
    const mappedTutors = tutors.map(tutor => {
      const tutorObj = {
        _id: tutor._id,
        user: {
          _id: tutor.user._id,
          name: tutor.user.name,
          email: tutor.user.email,
          profileImage: tutor.user.profileImage
        },
        phone: tutor.phone,
        gender: tutor.gender,
        bio: tutor.bio,
        education: tutor.education || [],
        experience: tutor.experience || [],
        subjects: tutor.subjects,
        availableLocations: tutor.availableLocations,
        documents: tutor.documents || [],
        isVerified: tutor.isVerified,
        verificationStatus: tutor.verificationStatus,
        status: tutor.status,
        createdAt: tutor.createdAt,
        rating: tutor.rating || 0,
        totalReviews: tutor.totalReviews || 0,
        totalStudents: tutor.totalStudents || 0,
        totalEarnings: tutor.totalEarnings || 0,
        totalRatings: tutor.totalReviews || 0 // Use totalReviews as totalRatings for backward compatibility
      };
      return tutorObj;
    });

    // Ensure we're sending a proper JSON response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      tutors: mappedTutors,
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
    const limit = parseInt(req.query.limit) || 24;
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

// @desc    Toggle tutor verification status
// @route   PATCH /api/admin/tutors/:id/toggle-verification
// @access  Private/Admin
export const toggleTutorVerification = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).populate('user', 'email name');
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Toggle verification status
    tutor.isVerified = !tutor.isVerified;
    
    // Update verification status based on isVerified flag
    if (tutor.isVerified) {
      tutor.verificationStatus = 'approved';
      tutor.verificationDate = new Date();
      tutor.verifiedBy = req.user._id;
    } else {
      tutor.verificationStatus = 'pending';
      // We don't remove verificationDate or verifiedBy to keep the history
    }

    await tutor.save();

    // Send email notification based on new status
    try {
      if (tutor.isVerified) {
        await sendEmail({
          to: tutor.user.email,
          subject: 'Tutor Profile Verified',
          template: 'tutorApproved',
          context: {
            name: tutor.user.name,
            loginUrl: `${process.env.FRONTEND_URL}/login`
          }
        });
      } else {
        await sendEmail({
          to: tutor.user.email,
          subject: 'Tutor Verification Status Changed',
          template: 'tutorStatusChanged',
          context: {
            name: tutor.user.name,
            message: 'Your verification status has been changed to unverified. Please contact support for more information.'
          }
        });
      }
    } catch (emailError) {
      console.error('Failed to send status change email:', emailError);
      // Don't fail the verification toggle if email fails
    }

    res.json({
      message: `Tutor ${tutor.isVerified ? 'verified' : 'unverified'} successfully`,
      tutor
    });
  } catch (error) {
    console.error('Error in toggleTutorVerification:', error);
    res.status(500).json({ 
      message: 'Failed to toggle tutor verification status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 