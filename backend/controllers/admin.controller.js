import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Subject from '../models/subject.model.js';
import Booking from '../models/booking.model.js';

// @desc    Get all tutors
// @route   GET /api/admin/tutors
// @access  Private/Admin
export const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().populate('user', 'name email profileImage');
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const tutor = await Tutor.findById(req.params.id);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    tutor.isVerified = true;
    tutor.verificationStatus = 'approved';
    tutor.verificationDate = new Date();
    tutor.verifiedBy = req.user._id;

    await tutor.save();
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject tutor
// @route   PATCH /api/admin/tutors/:id/reject
// @access  Private/Admin
export const rejectTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    tutor.isVerified = false;
    tutor.verificationStatus = 'rejected';
    tutor.verificationDate = new Date();
    tutor.verifiedBy = req.user._id;
    tutor.rejectionReason = req.body.reason;

    await tutor.save();
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 