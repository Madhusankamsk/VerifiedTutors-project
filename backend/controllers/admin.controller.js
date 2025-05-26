import Tutor from '../models/tutor.model.js';

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

// @desc    Approve a tutor
// @route   PATCH /api/admin/tutors/:id/approve
// @access  Private/Admin
export const approveTutor = async (req, res) => {
  const { id } = req.params;
  try {
    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { isVerified: true, verificationStatus: 'approved', verificationDate: new Date(), verifiedBy: req.user._id },
      { new: true }
    );
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    res.json(tutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reject a tutor
// @route   PATCH /api/admin/tutors/:id/reject
// @access  Private/Admin
export const rejectTutor = async (req, res) => {
  const { id } = req.params;
  try {
    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { isVerified: false, verificationStatus: 'rejected', verificationDate: new Date(), verifiedBy: req.user._id },
      { new: true }
    );
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    res.json(tutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 