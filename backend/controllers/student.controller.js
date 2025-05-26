import Favorite from '../models/favorite.model.js';
import Tutor from '../models/tutor.model.js';

// @desc    Get all favorite tutors for the student
// @route   GET /api/students/favorites
// @access  Private/Student
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ student: req.user._id }).populate({
      path: 'tutor',
      populate: { path: 'user', select: 'name email profileImage' },
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a tutor to favorites
// @route   POST /api/students/favorites/:tutorId
// @access  Private/Student
export const addFavorite = async (req, res) => {
  const { tutorId } = req.params;
  try {
    // Prevent duplicate favorites
    const exists = await Favorite.findOne({ student: req.user._id, tutor: tutorId });
    if (exists) return res.status(400).json({ message: 'Already favorited' });
    const favorite = await Favorite.create({ student: req.user._id, tutor: tutorId });
    // Optionally increment tutor's totalFavorites
    await Tutor.findByIdAndUpdate(tutorId, { $inc: { totalFavorites: 1 } });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove a tutor from favorites
// @route   DELETE /api/students/favorites/:tutorId
// @access  Private/Student
export const removeFavorite = async (req, res) => {
  const { tutorId } = req.params;
  try {
    const favorite = await Favorite.findOneAndDelete({ student: req.user._id, tutor: tutorId });
    if (!favorite) return res.status(404).json({ message: 'Favorite not found' });
    // Optionally decrement tutor's totalFavorites
    await Tutor.findByIdAndUpdate(tutorId, { $inc: { totalFavorites: -1 } });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 