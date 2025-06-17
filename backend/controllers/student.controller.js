import Favorite from '../models/favorite.model.js';
import Tutor from '../models/tutor.model.js';
import Booking from '../models/booking.model.js';
import Subject from '../models/subject.model.js';

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

// @desc    Create a new booking
// @route   POST /api/students/bookings
// @access  Private/Student
export const createBooking = async (req, res) => {
  try {
    const { tutorId, subjectId, startTime, endTime, notes } = req.body;
    
    // Validate required fields
    if (!tutorId || !subjectId || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Please provide tutor, subject, start time and end time' 
      });
    }
    
    // Find tutor and subject to calculate amount
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Calculate duration in hours
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    // Find the tutor's rate for this subject
    const tutorSubject = tutor.subjects.find(
      s => s.subject.toString() === subjectId
    );
    
    if (!tutorSubject) {
      return res.status(400).json({ 
        message: 'Tutor does not teach this subject' 
      });
    }
    
    // Use online rate by default
    const hourlyRate = tutorSubject.rates.online || 0;
    
    // Calculate total amount
    const amount = hourlyRate * durationHours;
    
    // Create the booking
    const booking = await Booking.create({
      student: req.user._id,
      tutor: tutorId,
      subject: subjectId,
      startTime: start,
      endTime: end,
      status: 'pending',
      amount,
      paymentStatus: 'pending',
      notes
    });
    
    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('student', 'name email profileImage')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .populate('subject', 'name category');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for the student
// @route   GET /api/students/bookings
// @access  Private/Student
export const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('student', 'name email profileImage')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .populate('subject', 'name category')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message });
  }
}; 