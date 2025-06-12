import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Blog from '../models/blog.model.js';
import Subject from '../models/subject.model.js';
import Rating from '../models/rating.model.js';
import Session from '../models/session.model.js';
import Location from '../models/location.model.js';

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Public
export const getTutors = async (req, res) => {
  try {
    const {
      educationLevel,
      subjects,
      teachingMode,
      location,
      minRating,
      priceRange,
      femaleOnly,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    const sortOptions = {};

    // Filter by education level
    if (educationLevel) {
      // First find subjects with matching education level
      const subjectsWithLevel = await Subject.find({
        educationLevel: { $regex: new RegExp(educationLevel, 'i') }
      }).select('_id');

      if (subjectsWithLevel.length > 0) {
        query['subjects.subject'] = { 
          $in: subjectsWithLevel.map(subject => subject._id)
        };
      }
    }

    // Filter by subjects
    if (subjects) {
      try {
        const subjectArray = Array.isArray(subjects) ? subjects : [subjects];
        // Find subject IDs by name
        const subjectDocs = await Subject.find({
          name: { $in: subjectArray.map(s => new RegExp(s, 'i')) }
        }).select('_id');
        
        if (subjectDocs.length > 0) {
          // If we already have a subject filter, use $and to combine them
          if (query['subjects.subject']) {
            query.$and = query.$and || [];
            query.$and.push({
              'subjects.subject': { 
                $in: subjectDocs.map(doc => doc._id)
              }
            });
          } else {
            query['subjects.subject'] = { 
              $in: subjectDocs.map(doc => doc._id)
            };
          }
        }
      } catch (err) {
        console.error('Error finding subjects:', err);
      }
    }

    // Filter by teaching mode and rates
    const teachingModeConditions = [];
    if (teachingMode) {
      if (teachingMode === 'ONLINE') {
        teachingModeConditions.push({
          'subjects.rates.online': { $gt: 0 }
        });
      } else if (teachingMode === 'INDIVIDUAL') {
        teachingModeConditions.push({
          'subjects.rates.individual': { $gt: 0 }
        });
      } else if (teachingMode === 'GROUP') {
        teachingModeConditions.push({
          'subjects.rates.group': { $gt: 0 }
        });
      }
    }

    // Filter by price range
    if (priceRange) {
      try {
        const [min, max] = JSON.parse(priceRange);
        const priceConditions = [];

        // Only include price conditions for the selected teaching mode
        if (teachingMode === 'ONLINE') {
          priceConditions.push({
            'subjects.rates.online': { $gte: min || 0, $lte: max || Number.MAX_SAFE_INTEGER }
          });
        } else if (teachingMode === 'INDIVIDUAL') {
          priceConditions.push({
            'subjects.rates.individual': { $gte: min || 0, $lte: max || Number.MAX_SAFE_INTEGER }
          });
        } else if (teachingMode === 'GROUP') {
          priceConditions.push({
            'subjects.rates.group': { $gte: min || 0, $lte: max || Number.MAX_SAFE_INTEGER }
          });
        } else {
          // If no teaching mode specified, check all rates
          priceConditions.push(
            { 'subjects.rates.online': { $gte: min || 0, $lte: max || Number.MAX_SAFE_INTEGER } },
            { 'subjects.rates.individual': { $gte: min || 0, $lte: max || Number.MAX_SAFE_INTEGER } },
            { 'subjects.rates.group': { $gte: min || 0, $lte: max || Number.MAX_SAFE_INTEGER } }
          );
        }

        if (priceConditions.length > 0) {
          query.$or = query.$or || [];
          query.$or.push(...priceConditions);
        }
      } catch (err) {
        console.error('Error parsing price range:', err);
      }
    }

    // Combine teaching mode conditions with other filters
    if (teachingModeConditions.length > 0) {
      query.$and = query.$and || [];
      query.$and.push({ $or: teachingModeConditions });
    }

    // Filter by location
    if (location) {
      try {
        const locationObj = JSON.parse(location);
        console.log('Location filter object:', locationObj);
        
        // First find the location IDs that match the criteria
        const locationQuery = {};
        if (locationObj.city) locationQuery.city = locationObj.city;
        if (locationObj.town) locationQuery.town = locationObj.town;
        if (locationObj.hometown) locationQuery.hometown = locationObj.hometown;
        
        console.log('Location query:', locationQuery);
        
        const matchingLocations = await Location.find(locationQuery).select('_id');
        console.log('Matching locations:', matchingLocations);
        
        if (matchingLocations.length > 0) {
          const locationIds = matchingLocations.map(loc => loc._id);
          console.log('Location IDs to search for:', locationIds);
          query.locations = { $in: locationIds };
        } else {
          console.log('No matching locations found');
        }
      } catch (err) {
        console.error('Error in location filtering:', err);
      }
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by gender
    if (femaleOnly === 'true') {
      query.gender = 'Female';
    }

    // Set sort options
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Log the final query for debugging
    console.log('Final Query:', JSON.stringify(query, null, 2));

    // Execute query with pagination and sorting
    const tutors = await Tutor.find(query)
      .populate('user', 'name email profileImage')
      .populate('subjects.subject', 'name category educationLevel')
      .populate('locations', 'city town hometown')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Tutor.countDocuments(query);

    // Log the results for debugging
    console.log('Query Results:', {
      totalTutors: total,
      returnedTutors: tutors.length,
      firstTutor: tutors[0] ? {
        id: tutors[0]._id,
        locations: tutors[0].locations,
        subjects: tutors[0].subjects.map(s => ({
          name: s.subject?.name,
          educationLevel: s.subject?.educationLevel,
          rates: s.rates
        }))
      } : null
    });

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
      .populate('subjects.subject', 'name category educationLevel')
      .populate('locations', 'name');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (error) {
    console.error('Error in getTutor:', error);
    res.status(500).json({ 
      message: 'Error fetching tutor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    if (tutor.user.toString() !== req.user.id.toString()) {
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
        if (!exp.title || !exp.company || !exp.duration || !exp.description) {
          return res.status(400).json({ 
            message: 'Each experience entry must include title, company, duration, and description' 
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

        // Validate rates and teaching modes
        if (!subject.rates) {
          return res.status(400).json({ 
            message: 'Rates are required for each subject' 
          });
        }

        const { individual, group, online } = subject.rates;
        const teachingModes = [];

        // Check each teaching mode and its rate
        if (individual !== undefined && individual !== null) {
          if (individual < 0) {
            return res.status(400).json({ 
              message: 'Individual rate cannot be negative' 
            });
          }
          if (individual > 0) {
            teachingModes.push('INDIVIDUAL');
          }
        }

        if (group !== undefined && group !== null) {
          if (group < 0) {
            return res.status(400).json({ 
              message: 'Group rate cannot be negative' 
            });
          }
          if (group > 0) {
            teachingModes.push('GROUP');
          }
        }

        if (online !== undefined && online !== null) {
          if (online < 0) {
            return res.status(400).json({ 
              message: 'Online rate cannot be negative' 
            });
          }
          if (online > 0) {
            teachingModes.push('ONLINE');
          }
        }

        // Ensure at least one teaching mode is selected with a rate > 0
        if (teachingModes.length === 0) {
          return res.status(400).json({ 
            message: 'At least one teaching mode (Individual, Group, or Online) must be selected with a rate greater than 0' 
          });
        }

        // Store the teaching modes in the subject object
        subject.teachingModes = teachingModes;

        // Set undefined rates to 0
        subject.rates = {
          individual: individual || 0,
          group: group || 0,
          online: online || 0
        };

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
          socialMedia: req.body.socialMedia,
          teachingMediums: req.body.teachingMediums,
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

    const blogs = await Blog.find({ author: tutor._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
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
      // If user is a tutor but profile doesn't exist, create one
      if (req.user.role === 'tutor') {
        const newTutor = await Tutor.create({
          user: req.user.id,
          status: 'active'
        });
        
        const populatedTutor = await Tutor.findById(newTutor._id)
          .populate('user', 'name email profileImage')
          .populate('subjects.subject', 'name category educationLevel')
          .populate('locations', 'name');
          
        return res.json(populatedTutor);
      }
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

export const getTutorReviews = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    const reviews = await Rating.find({ tutor: tutor._id })
      .populate('student', 'name email profileImage')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      student: {
        _id: review.student._id,
        name: review.student.name,
        profileImage: review.student.profileImage
      },
      rating: review.rating,
      review: review.review,
      isVerified: review.isVerified,
      createdAt: review.createdAt
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error in getTutorReviews:', error);
    res.status(500).json({ 
      message: 'Error fetching tutor reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get tutor statistics
// @route   GET /api/tutors/:id/stats
// @access  Public
export const getTutorStats = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Get total earnings from completed sessions
    const totalEarnings = await Session.aggregate([
      { $match: { tutor: tutor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get total students count
    const totalStudents = await Session.distinct('student', {
      tutor: tutor._id,
      status: 'completed'
    });

    // Get total sessions count
    const totalSessions = await Session.countDocuments({
      tutor: tutor._id,
      status: 'completed'
    });

    // Get average rating
    const ratings = await Rating.aggregate([
      { $match: { tutor: tutor._id } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      totalStudents: totalStudents.length || 0,
      totalSessions: totalSessions || 0,
      averageRating: ratings[0]?.average || 0
    });
  } catch (error) {
    console.error('Error in getTutorStats:', error);
    res.status(500).json({ 
      message: 'Error fetching tutor statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get tutor's blog by ID
// @route   GET /api/tutors/blogs/:id
// @access  Private/Tutor
export const getTutorBlogById = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ 
        success: false,
        message: 'Tutor profile not found' 
      });
    }

    const blog = await Blog.findOne({ _id: req.params.id, author: tutor._id });
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}; 