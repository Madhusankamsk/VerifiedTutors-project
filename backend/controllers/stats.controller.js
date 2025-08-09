import Tutor from '../models/tutor.model.js';
import Subject from '../models/subject.model.js';
import Rating from '../models/rating.model.js';

// @desc    Public platform stats
// @route   GET /api/stats/public
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    // Count only active, verified tutors with valid user reference
    const totalTutors = await Tutor.countDocuments({
      isVerified: true,
      status: 'active',
      user: { $exists: true, $ne: null },
    });

    // Count active subjects
    const activeSubjects = await Subject.countDocuments({ isActive: true });

    // Global average rating across all reviews
    const ratingAgg = await Rating.aggregate([
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);

    const averageRating = ratingAgg[0]?.averageRating || 0;
    const totalReviews = ratingAgg[0]?.totalReviews || 0;

    res.json({
      totalTutors,
      activeSubjects,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Error fetching public stats' });
  }
};


