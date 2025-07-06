import Rating from '../models/rating.model.js';
import Tutor from '../models/tutor.model.js';
import Booking from '../models/booking.model.js';

// @desc    Get all ratings for a tutor
// @route   GET /api/ratings/tutor/:tutorId
// @access  Public
export const getTutorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ tutor: req.params.tutorId })
      .populate('student', 'name profileImage')
      .populate('subject', 'name category')
      .populate('topics', 'name description')
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
    const { bookingId, rating, review } = req.body;

    // Validate input
    if (!bookingId || !rating || !review) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: bookingId, rating, and review' 
      });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be a number between 1 and 5' 
      });
    }

    if (typeof review !== 'string' || review.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Review must be at least 10 characters long' 
      });
    }

    // Check if booking exists and belongs to the student
    const booking = await Booking.findById(bookingId)
      .populate('tutor')
      .populate('subject')
      .populate('selectedTopics');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Check if student has already rated this booking
    let existingRating = await Rating.findOne({ booking: bookingId });

    if (existingRating) {
      // Update the existing rating
      existingRating.rating = rating;
      existingRating.review = review.trim();
      await existingRating.save();
    } else {
      // Use topics from the booking automatically
      const topicsFromBooking = booking.selectedTopics ? booking.selectedTopics.map(topic => topic._id) : [];
      
      // Allow review submission even if no topics are selected
      // This handles legacy bookings or bookings where topics weren't selected
      
      // Create new rating
      existingRating = await Rating.create({
        tutor: booking.tutor._id,
        student: req.user._id,
        subject: booking.subject._id,
        topics: topicsFromBooking,
        booking: bookingId,
        rating,
        review: review.trim()
      });
    }

    // Update tutor's average rating
    const tutorRatings = await Rating.find({ tutor: booking.tutor._id });
    const totalRatings = tutorRatings.length;
    const sumRatings = tutorRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = sumRatings / totalRatings;

    // Update tutor's rating in the Tutor model
    await Tutor.findByIdAndUpdate(booking.tutor._id, {
      rating: averageRating,
      totalReviews: totalRatings
    });

    // Populate the response
    const populatedRating = await Rating.findById(existingRating._id)
      .populate('student', 'name profileImage')
      .populate('subject', 'name category')
      .populate('topics', 'name description');

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: populatedRating
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'booking') {
        return res.status(400).json({ 
          success: false,
          message: 'You have already reviewed this booking' 
        });
      } else if (error.message.includes('tutor_1_student_1_topics_1')) {
        return res.status(400).json({ 
          success: false,
          message: 'You have already reviewed these topics for this tutor. You can only submit one review per topic combination.' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get rating for a specific booking
// @route   GET /api/ratings/booking/:bookingId
// @access  Private/Student
export const getBookingRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ booking: req.params.bookingId })
      .populate('student', 'name profileImage')
      .populate('subject', 'name category')
      .populate('topics', 'name description');

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found for this booking' });
    }

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    tutor.totalReviews = totalRatings;
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
    tutor.totalReviews = totalRatings;
    await tutor.save();

    res.json({ message: 'Rating removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 