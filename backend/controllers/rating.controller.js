import Rating from '../models/rating.model.js';
import Tutor from '../models/tutor.model.js';

// @desc    Get all ratings for a tutor
// @route   GET /api/ratings/tutor/:tutorId
// @access  Public
export const getTutorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ tutor: req.params.tutorId })
      .populate('student', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a rating
// @route   POST /api/ratings
// @access  Private/Student
export const createRating = async (req, res) => {
  try {
    const { tutorId, rating, review } = req.body;

    // Check if tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if student has already rated this tutor
    const existingRating = await Rating.findOne({
      tutor: tutorId,
      student: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this tutor' });
    }

    // Create rating
    const newRating = await Rating.create({
      tutor: tutorId,
      student: req.user._id,
      rating,
      review
    });

    // Update tutor's average rating
    const tutorRatings = await Rating.find({ tutor: tutorId });
    const totalRatings = tutorRatings.length;
    const sumRatings = tutorRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = sumRatings / totalRatings;

    tutor.rating = averageRating;
    tutor.totalRatings = totalRatings;
    await tutor.save();

    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a rating
// @route   PUT /api/ratings/:id
// @access  Private/Student
export const updateRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user is the one who created the rating
    if (rating.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update tutor's average rating
    const tutorRatings = await Rating.find({ tutor: rating.tutor });
    const totalRatings = tutorRatings.length;
    const sumRatings = tutorRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = sumRatings / totalRatings;

    const tutor = await Tutor.findById(rating.tutor);
    tutor.rating = averageRating;
    tutor.totalRatings = totalRatings;
    await tutor.save();

    res.json(updatedRating);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private/Student
export const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user is the one who created the rating
    if (rating.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await rating.deleteOne();

    // Update tutor's average rating
    const tutorRatings = await Rating.find({ tutor: rating.tutor });
    const totalRatings = tutorRatings.length;
    const sumRatings = tutorRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    const tutor = await Tutor.findById(rating.tutor);
    tutor.rating = averageRating;
    tutor.totalRatings = totalRatings;
    await tutor.save();

    res.json({ message: 'Rating removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 