import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Blog from '../models/blog.model.js';
import Subject from '../models/subject.model.js';
import Rating from '../models/rating.model.js';

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Public
export const getTutors = async (req, res) => {
  try {
    const {
      subject,
      rating,
      price,
      search,
      location,
      educationLevel,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    const sortOptions = {};

    // Filter by subject
    if (subject) {
      query['subjects.subject'] = subject;
    }

    // Filter by minimum rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Filter by price range
    if (price) {
      const [minPrice, maxPrice] = price.split('-').map(Number);
      query['subjects.rates.individual'] = {
        $gte: minPrice || 0,
        $lte: maxPrice || Number.MAX_SAFE_INTEGER
      };
    }

    // Filter by location
    if (location) {
      query.locations = location;
    }

    // Filter by education level
    if (educationLevel) {
      query['subjects.subject.educationLevel'] = educationLevel;
    }

    // Search by name, bio, or subjects
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'subjects.subject.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Set sort options
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and sorting
    const tutors = await Tutor.find(query)
      .populate('user', 'name email profileImage')
      .populate('subjects.subject', 'name category educationLevel')
      .populate('locations', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Tutor.countDocuments(query);

    res.json({
      tutors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error in getTutors:', error);
    res.status(500).json({ 
      message: 'Error fetching tutors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single tutor
// @route   GET /api/tutors/:id
// @access  Public
export const getTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('user', 'name email profileImage')
      .populate('subjects', 'name category');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create tutor profile
// @route   POST /api/tutors
// @access  Private/Tutor
export const createTutorProfile = async (req, res) => {
  try {
    // Check if tutor profile already exists
    const existingTutor = await Tutor.findOne({ user: req.user.id });
    if (existingTutor) {
      return res.status(400).json({ message: 'Tutor profile already exists' });
    }

    const tutor = new Tutor({
      user: req.user.id,
      ...req.body
    });

    await tutor.save();
    res.status(201).json(tutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update tutor profile
// @route   PUT/PATCH /api/tutors/profile
// @access  Private/Tutor
export const updateTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    // Check if user is authorized
    if (tutor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Validate phone number if provided
    if (req.body.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(req.body.phone)) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
      }
    }

    // Validate education entries
    if (req.body.education) {
      for (const edu of req.body.education) {
        if (!edu.degree || !edu.institution || !edu.year) {
          return res.status(400).json({ 
            message: 'Each education entry must include degree, institution, and year' 
          });
        }
        if (edu.year < 1900 || edu.year > new Date().getFullYear()) {
          return res.status(400).json({ 
            message: 'Please provide a valid year for education' 
          });
        }
      }
    }

    // Validate experience entries
    if (req.body.experience) {
      for (const exp of req.body.experience) {
        if (!exp.position || !exp.institution || !exp.duration || !exp.description) {
          return res.status(400).json({ 
            message: 'Each experience entry must include position, institution, duration, and description' 
          });
        }
      }
    }

    // Process subjects with validation
    if (req.body.subjects) {
      for (const subject of req.body.subjects) {
        if (!subject.subject || !subject.subject._id) {
          return res.status(400).json({ 
            message: 'Each subject must include a valid subject ID' 
          });
        }

        // Validate rates if provided
        if (subject.rates) {
          const { individual, group, online } = subject.rates;
          if (individual && individual < 0) {
            return res.status(400).json({ 
              message: 'Individual rate cannot be negative' 
            });
          }
          if (group && group < 0) {
            return res.status(400).json({ 
              message: 'Group rate cannot be negative' 
            });
          }
          if (online && online < 0) {
            return res.status(400).json({ 
              message: 'Online rate cannot be negative' 
            });
          }
        }

        // Validate availability if provided
        if (subject.availability) {
          for (const slot of subject.availability) {
            if (!slot.day || !slot.slots || !Array.isArray(slot.slots)) {
              return res.status(400).json({ 
                message: 'Invalid availability format' 
              });
            }

            for (const timeSlot of slot.slots) {
              if (!timeSlot.start || !timeSlot.end) {
                return res.status(400).json({ 
                  message: 'Each time slot must have start and end times' 
                });
              }

              // Validate time format (HH:mm)
              const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
              if (!timeRegex.test(timeSlot.start) || !timeRegex.test(timeSlot.end)) {
                return res.status(400).json({ 
                  message: 'Invalid time format. Use HH:mm format' 
                });
              }
            }
          }
        }
      }
    }

    // Update the tutor profile
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutor._id,
      {
        $set: {
          phone: req.body.phone,
          bio: req.body.bio,
          gender: req.body.gender,
          education: req.body.education,
          experience: req.body.experience,
          subjects: req.body.subjects,
          locations: req.body.locations,
          documents: req.body.documents,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    )
    .populate('user', 'name email profileImage')
    .populate('subjects.subject', 'name category educationLevel')
    .populate('locations', 'name');

    if (!updatedTutor) {
      return res.status(404).json({ message: 'Failed to update tutor profile' });
    }

    res.json({
      message: 'Tutor profile updated successfully',
      tutor: updatedTutor
    });
  } catch (error) {
    console.error('Error in updateTutorProfile:', error);
    res.status(400).json({ 
      message: 'Error updating tutor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete tutor profile
// @route   DELETE /api/tutors/:id
// @access  Private/Tutor
export const deleteTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    // Check if user is authorized
    if (tutor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this profile' });
    }

    await tutor.remove();
    res.json({ message: 'Tutor profile deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tutor availability
// @route   GET /api/tutors/:id/availability
// @access  Public
export const getTutorAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const tutor = await Tutor.findById(req.params.id)
      .select('subjects.availability')
      .populate('subjects.subject', 'name');
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Validate date range if provided
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      if (start > end) {
        return res.status(400).json({ message: 'Start date must be before end date' });
      }
    }

    // Process availability for each subject
    const availability = tutor.subjects.map(subject => {
      const slots = subject.availability || [];
      
      // Group slots by day
      const slotsByDay = slots.reduce((acc, slot) => {
        if (!acc[slot.day]) {
          acc[slot.day] = [];
        }
        acc[slot.day].push(...slot.slots);
        return acc;
      }, {});

      // Sort slots by start time
      Object.keys(slotsByDay).forEach(day => {
        slotsByDay[day].sort((a, b) => {
          const [aHours, aMinutes] = a.start.split(':').map(Number);
          const [bHours, bMinutes] = b.start.split(':').map(Number);
          return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
        });
      });

      return {
        subject: subject.subject.name,
        availability: slotsByDay
      };
    });

    // Filter by date range if provided
    if (start && end) {
      const filteredAvailability = availability.map(subject => {
        const filteredSlots = {};
        Object.keys(subject.availability).forEach(day => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
          const currentDate = new Date(start);
          
          while (currentDate <= end) {
            if (currentDate.getDay() === dayIndex) {
              filteredSlots[day] = subject.availability[day];
              break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });
        return {
          subject: subject.subject,
          availability: filteredSlots
        };
      });

      return res.json({
        tutorId: tutor._id,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        availability: filteredAvailability
      });
    }

    res.json({
      tutorId: tutor._id,
      availability
    });
  } catch (error) {
    console.error('Error in getTutorAvailability:', error);
    res.status(500).json({ 
      message: 'Error fetching tutor availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get tutor's blogs
// @route   GET /api/tutors/blogs
// @access  Private/Tutor
export const getTutorBlogs = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const blogs = await Blog.find({ author: tutor._id });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create blog
// @route   POST /api/tutors/blogs
// @access  Private/Tutor
export const createBlog = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const blog = await Blog.create({
      ...req.body,
      author: tutor._id
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/tutors/blogs/:id
// @access  Private/Tutor
export const updateBlog = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const blog = await Blog.findOne({ _id: req.params.id, author: tutor._id });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/tutors/blogs/:id
// @access  Private/Tutor
export const deleteBlog = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const blog = await Blog.findOne({ _id: req.params.id, author: tutor._id });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tutor by user ID
// @route   GET /api/tutors/profile
// @access  Private
export const getTutorByUserId = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const tutor = await Tutor.findOne({ user: req.user.id })
      .populate('user', 'name email profileImage')
      .populate('subjects.subject', 'name category educationLevel')
      .populate('locations', 'name');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    res.json(tutor);
  } catch (error) {
    console.error('Error in getTutorByUserId:', error);
    res.status(500).json({ 
      message: 'Error fetching tutor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getTutorReviews = async (req, res, next) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const reviews = await Rating.find({ tutorId: tutor._id })
      .populate('studentId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      studentId: review.studentId._id,
      studentName: `${review.studentId.firstName} ${review.studentId.lastName}`,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.json(formattedReviews);
  } catch (error) {
    next(error);
  }
}; 