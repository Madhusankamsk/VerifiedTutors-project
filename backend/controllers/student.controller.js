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
    const { 
      tutorId, 
      subjectId, 
      startTime, 
      endTime, 
      notes,
      learningMethod = 'online',
      selectedTopics = [],
      contactNumber
    } = req.body;
    
    // Validate required fields
    if (!tutorId || !subjectId || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Please provide tutor, subject, start time and end time' 
      });
    }

    if (!contactNumber) {
      return res.status(400).json({ 
        message: 'Contact number is required' 
      });
    }
    
    // Find tutor and subject to calculate amount
    const tutor = await Tutor.findById(tutorId)
      .populate('subjects.subject')
      .populate('subjects.selectedTopics', 'name description');
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
    
    // Validate duration
    if (durationHours <= 0 || durationHours > 8) {
      return res.status(400).json({ 
        message: 'Session duration must be between 1 and 8 hours' 
      });
    }
    
    // Find the tutor's rate for this subject
    const tutorSubject = tutor.subjects.find(
      s => s.subject._id.toString() === subjectId
    );
    
    if (!tutorSubject) {
      return res.status(400).json({ 
        message: 'Tutor does not teach this subject' 
      });
    }
    
    // Get rate based on learning method and teaching modes
    let hourlyRate = 0;
    
    if (tutorSubject.teachingModes && tutorSubject.teachingModes.length > 0) {
      // Use new teaching modes structure
      const teachingMode = tutorSubject.teachingModes.find(
        mode => mode.type === learningMethod && mode.enabled
      );
      
      if (teachingMode) {
        hourlyRate = teachingMode.rate;
      } else {
        return res.status(400).json({ 
          message: `Tutor does not offer ${learningMethod} sessions for this subject` 
        });
      }
    } else if (tutorSubject.rates) {
      // Fallback to legacy rates structure
      switch (learningMethod) {
        case 'online':
          hourlyRate = tutorSubject.rates.online || 0;
          break;
        case 'individual':
          hourlyRate = tutorSubject.rates.individual || 0;
          break;
        case 'group':
          hourlyRate = tutorSubject.rates.group || 0;
          break;
        default:
          hourlyRate = tutorSubject.rates.online || 0;
      }
    }
    
    if (hourlyRate <= 0) {
      return res.status(400).json({ 
        message: 'No valid rate found for the selected learning method' 
      });
    }
    
    // Calculate total amount
    const amount = hourlyRate * durationHours;
    
    // Validate selected topics (optional)
    let validTopics = [];
    if (selectedTopics && selectedTopics.length > 0) {
      const tutorTopics = tutorSubject.selectedTopics || [];
      validTopics = selectedTopics.filter(topicId => 
        tutorTopics.includes(topicId)
      );
    }
    
    // Extract contact number from notes if provided there
    let extractedContactNumber = contactNumber;
    if (!extractedContactNumber && notes && notes.includes('Contact number:')) {
      const match = notes.match(/Contact number:\s*([+\-\s\d]+)/);
      if (match) {
        extractedContactNumber = match[1].trim();
      }
    }
    
    // Create the booking
    const booking = await Booking.create({
      student: req.user._id,
      tutor: tutorId,
      subject: subjectId,
      selectedTopics: validTopics,
      startTime: start,
      endTime: end,
      duration: durationHours,
      learningMethod,
      status: 'pending',
      amount,
      paymentStatus: 'pending',
      notes,
      contactNumber: extractedContactNumber
    });
    
    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('student', 'name email profileImage')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .populate('subject', 'name category')
      .populate('selectedTopics', 'name description');
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all bookings for the student
// @route   GET /api/students/bookings
// @access  Private/Student
export const getStudentBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = { student: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Count total documents
    const total = await Booking.countDocuments(query);
    
    const bookings = await Booking.find(query)
      .populate('student', 'name email profileImage')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'name email profileImage' }
      })
      .populate('subject', 'name category')
      .populate('selectedTopics', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasMore: skip + bookings.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 