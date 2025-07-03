import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Blog from '../models/blog.model.js';
import Subject from '../models/subject.model.js';
import Rating from '../models/rating.model.js';
import Session from '../models/session.model.js';
import Booking from '../models/booking.model.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Public
export const getTutors = async (req, res) => {
  try {
    const {
      subject,
      topic,
      teachingMode,
      location,
      minRating,
      priceRange,
      femaleOnly,
      search,
      page = 1,
      limit = 24,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    console.log('getTutors called with query params:', req.query);
    console.log('Search parameter:', search);
    console.log('Sort parameters:', { sortBy, sortOrder });

    let query = {};
    let sortOptions = {};
    let shouldSortAfterPopulation = false;
    
    // Import Topic model once
    const Topic = (await import('../models/topic.model.js')).default;

    // Search functionality
    if (search) {
      try {
        // Create a comprehensive search query
        const searchConditions = [];
        
        // 1. Search by tutor name and email (via User collection)
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        if (users.length > 0) {
          const userIds = users.map(user => user._id);
          searchConditions.push({ user: { $in: userIds } });
        }
        
        // 2. Search by location
        searchConditions.push({ availableLocations: { $regex: search, $options: 'i' } });
        
        // 3. Search by subject name
        const subjects = await Subject.find({
          name: { $regex: search, $options: 'i' }
        }).select('_id');
        
        if (subjects.length > 0) {
          const subjectIds = subjects.map(subject => subject._id);
          searchConditions.push({ 'subjects.subject': { $in: subjectIds } });
        }
        
        // 4. Search by topic name (both new Topic objects and legacy strings)
        const topics = await Topic.find({
          name: { $regex: search, $options: 'i' },
          isActive: true
        }).select('_id');
        
        if (topics.length > 0) {
          const topicIds = topics.map(topic => topic._id);
          searchConditions.push({ 'subjects.selectedTopics': { $in: topicIds } });
        }
        
        // Also search in legacy bestTopics field
        searchConditions.push({ 'subjects.bestTopics': { $regex: search, $options: 'i' } });
        
        // Combine all search conditions with OR
        if (searchConditions.length > 0) {
          if (Object.keys(query).length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ $or: searchConditions });
          } else {
            query.$or = searchConditions;
          }
        } else {
          // If no search conditions found, return empty result
          query._id = { $in: [] };
        }
        
        console.log('Enhanced search filter applied:', search);
        console.log('Search conditions:', searchConditions);
        console.log('Final search query structure:', JSON.stringify(query, null, 2));
      } catch (err) {
        console.error('Error in search filtering:', err);
        // Fallback to basic search
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        if (users.length > 0) {
          const userIds = users.map(user => user._id);
          query.user = { $in: userIds };
        } else {
          query.user = { $in: [] };
        }
      }
    }

    // Filter by subject
    if (subject) {
      try {
        // Find subject by name
        const subjectDoc = await Subject.findOne({
          name: { $regex: new RegExp(subject, 'i') }
        }).select('_id');
        
        if (subjectDoc) {
          query['subjects.subject'] = subjectDoc._id;
          console.log('Subject filter applied:', subject);
        }
      } catch (err) {
        console.error('Error finding subject:', err);
      }
    }

    // Filter by topic (both legacy string topics and new Topic objects)
    if (topic) {
      try {
        // First try to find Topic object by name
        const topicDoc = await Topic.findOne({
          name: { $regex: new RegExp(topic, 'i') },
          isActive: true
        });

        if (topicDoc) {
          // Use Topic object ID for filtering - check both new and legacy fields
          const topicConditions = [
            { 'subjects.selectedTopics': topicDoc._id },
            { 'subjects.bestTopics': { $regex: new RegExp(topic, 'i') } }
          ];
          
          // Combine with existing query using $and
          if (Object.keys(query).length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ $or: topicConditions });
          } else {
            query.$or = topicConditions;
          }
        } else {
          // Fallback to string-based filtering for legacy topics
          if (Object.keys(query).length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ 'subjects.bestTopics': { $regex: new RegExp(topic, 'i') } });
          } else {
            query['subjects.bestTopics'] = { $regex: new RegExp(topic, 'i') };
          }
        }
        console.log('Topic filter applied:', topic);
      } catch (err) {
        console.error('Error in topic filtering:', err);
        // Fallback to legacy filtering
        if (Object.keys(query).length > 0) {
          query.$and = query.$and || [];
          query.$and.push({ 'subjects.bestTopics': { $regex: new RegExp(topic, 'i') } });
        } else {
          query['subjects.bestTopics'] = { $regex: new RegExp(topic, 'i') };
        }
      }
    }

    // Filter by teaching mode and rates
    const teachingModeConditions = [];
    if (teachingMode) {
      if (teachingMode === 'ONLINE') {
        teachingModeConditions.push(
          { 'subjects.teachingModes': { $elemMatch: { type: 'online', enabled: true, rate: { $gt: 0 } } } },
          { 'subjects.rates.online': { $gt: 0 } } // Legacy support
        );
      } else if (teachingMode === 'INDIVIDUAL') {
        teachingModeConditions.push(
          { 'subjects.teachingModes': { $elemMatch: { type: 'home-visit', enabled: true, rate: { $gt: 0 } } } },
          { 'subjects.rates.individual': { $gt: 0 } } // Legacy support
        );
      } else if (teachingMode === 'GROUP') {
        teachingModeConditions.push(
          { 'subjects.teachingModes': { $elemMatch: { type: 'group', enabled: true, rate: { $gt: 0 } } } },
          { 'subjects.rates.group': { $gt: 0 } } // Legacy support
        );
      }
    }

    // Combine teaching mode conditions with existing query
    if (teachingModeConditions.length > 0) {
      if (Object.keys(query).length > 0) {
        query.$and = query.$and || [];
        query.$and.push({ $or: teachingModeConditions });
      } else {
        query.$or = teachingModeConditions;
      }
    }

    // Filter by price range
    if (priceRange) {
      try {
        const [minPrice, maxPrice] = JSON.parse(priceRange);
        const priceConditions = [];
        
        if (minPrice > 0) {
          priceConditions.push(
            { 'subjects.teachingModes': { $elemMatch: { enabled: true, rate: { $gte: minPrice } } } },
            { 'subjects.rates.online': { $gte: minPrice } }, // Legacy support
            { 'subjects.rates.individual': { $gte: minPrice } }, // Legacy support
            { 'subjects.rates.group': { $gte: minPrice } } // Legacy support
          );
        }
        
        if (maxPrice < 10000) {
          priceConditions.push(
            { 'subjects.teachingModes': { $elemMatch: { enabled: true, rate: { $lte: maxPrice } } } },
            { 'subjects.rates.online': { $lte: maxPrice } }, // Legacy support
            { 'subjects.rates.individual': { $lte: maxPrice } }, // Legacy support
            { 'subjects.rates.group': { $lte: maxPrice } } // Legacy support
          );
        }
        
        if (priceConditions.length > 0) {
          if (Object.keys(query).length > 0) {
            query.$and = query.$and || [];
            query.$and.push({ $or: priceConditions });
          } else {
            query.$or = priceConditions;
          }
        }
        console.log('Price range filter applied:', priceRange);
      } catch (err) {
        console.error('Error in price range filtering:', err);
      }
    }

    // Filter by location
    if (location) {
      try {
        // Search in availableLocations field for the location string
        query.availableLocations = { $regex: new RegExp(location, 'i') };
        console.log('Location filter applied:', location);
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
    switch (sortBy) {
      case 'rating':
        sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'price':
        // For price sorting, we'll sort by the minimum rate across all teaching modes
        // We'll use the online rate as the primary sort, then individual, then group
        sortOptions['subjects.rates.online'] = sortOrder === 'desc' ? -1 : 1;
        sortOptions['subjects.rates.individual'] = sortOrder === 'desc' ? -1 : 1;
        sortOptions['subjects.rates.group'] = sortOrder === 'desc' ? -1 : 1;
        // Fallback to rating if no rates available
        sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'experience':
        // Sort by the number of experience entries (more experience = higher priority)
        // We'll use the length of the experience array
        sortOptions['experience'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'name':
        // For name sorting, we need to sort after population
        shouldSortAfterPopulation = true;
        break;
      case 'createdAt':
        sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        // Default to rating descending
        sortOptions.rating = -1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Log the final query for debugging
    console.log('Final Query:', JSON.stringify(query, null, 2));
    console.log('Search parameter received:', search);
    console.log('Sort options:', sortOptions);
    console.log('Should sort after population:', shouldSortAfterPopulation);

    // Execute query with pagination and sorting
    let tutors;
    
    if (shouldSortAfterPopulation) {
      // For name sorting, we need to fetch all tutors and sort in memory
      // This is less efficient but necessary for name sorting
      tutors = await Tutor.find(query)
        .populate('user', 'name email profileImage')
        .populate('subjects.subject', 'name topics')
        .populate('subjects.selectedTopics', 'name description');
      
      // Sort by name
      tutors = tutors.sort((a, b) => {
        const nameA = a.user?.name || '';
        const nameB = b.user?.name || '';
        if (sortOrder === 'desc') {
          return nameB.localeCompare(nameA);
        } else {
          return nameA.localeCompare(nameB);
        }
      });
      
      // Apply pagination after sorting
      tutors = tutors.slice(skip, skip + Number(limit));
    } else {
      // Apply database-level sorting for other fields
      tutors = await Tutor.find(query)
        .populate('user', 'name email profileImage')
        .populate('subjects.subject', 'name topics')
        .populate('subjects.selectedTopics', 'name description')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));
    }

    // Get total count for pagination
    const total = await Tutor.countDocuments(query);

    // Log the results for debugging
    console.log('Query Results:', {
      totalTutors: total,
      returnedTutors: tutors.length,
      firstTutor: tutors[0] ? {
        id: tutors[0]._id,
        availableLocations: tutors[0].availableLocations,
        subjects: tutors[0].subjects.map(s => ({
          name: s.subject?.name,
          topics: s.subject?.topics,
          bestTopics: s.bestTopics,
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
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      .populate('subjects.subject', 'name category educationLevel');

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
      // Ensure only one subject is selected
      if (req.body.subjects.length > 1) {
        return res.status(400).json({ 
          message: 'You can only select one subject. Please remove additional subjects.' 
        });
      }

      for (const subject of req.body.subjects) {
        if (!subject.subject || !subject.subject._id) {
          return res.status(400).json({ 
            message: 'Each subject must include a valid subject ID' 
          });
        }

        // Handle both new and legacy structures
        const hasNewStructure = subject.selectedTopics !== undefined && subject.teachingModes !== undefined;
        const hasLegacyStructure = subject.rates !== undefined;

        if (hasNewStructure) {
          // Validate selectedTopics
          if (!Array.isArray(subject.selectedTopics)) {
            return res.status(400).json({ 
              message: 'selectedTopics must be an array for each subject' 
            });
          }

          // Validate that no more than 5 topics are selected
          if (subject.selectedTopics.length > 5) {
            return res.status(400).json({ 
              message: 'Maximum 5 topics can be selected per subject' 
            });
          }

          // Validate teachingModes
          if (!Array.isArray(subject.teachingModes)) {
            return res.status(400).json({ 
              message: 'teachingModes must be an array for each subject' 
            });
          }

          // Validate each teaching mode
          let hasEnabledMode = false;
          for (const mode of subject.teachingModes) {
            if (!mode.type || !['online', 'home-visit', 'group'].includes(mode.type)) {
              return res.status(400).json({ 
                message: 'Invalid teaching mode type. Must be online, home-visit, or group' 
              });
            }

            if (typeof mode.rate !== 'number' || mode.rate < 0) {
              return res.status(400).json({ 
                message: 'Teaching mode rate must be a non-negative number' 
              });
            }

            if (mode.enabled && mode.rate > 0) {
              hasEnabledMode = true;
            }
          }

          // Ensure at least one teaching mode is enabled with a rate > 0
          if (!hasEnabledMode) {
            return res.status(400).json({ 
              message: 'At least one teaching mode must be enabled with a rate greater than 0' 
            });
          }
        } else if (hasLegacyStructure) {
          // Legacy validation for rates structure
          const { individual, group, online } = subject.rates;
          const teachingModes = [];

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

          if (teachingModes.length === 0) {
            return res.status(400).json({ 
              message: 'At least one teaching mode (Individual, Group, or Online) must be selected with a rate greater than 0' 
            });
          }

          // Convert legacy structure to new structure
          subject.selectedTopics = subject.selectedTopics || [];
          subject.teachingModes = [
            { type: 'online', rate: online || 0, enabled: online > 0 },
            { type: 'home-visit', rate: individual || 0, enabled: individual > 0 },
            { type: 'group', rate: group || 0, enabled: group > 0 }
          ];
        } else {
          return res.status(400).json({ 
            message: 'Subject must have either selectedTopics/teachingModes (new structure) or rates (legacy structure)' 
          });
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
    const updatedTutor = await Tutor.findOneAndUpdate(
      { user: req.user.id },
      { $set: {
        phone: req.body.phone,
        bio: req.body.bio,
        gender: req.body.gender,
        socialMedia: req.body.socialMedia,
        teachingMediums: req.body.teachingMediums,
        education: req.body.education,
        experience: req.body.experience,
        subjects: req.body.subjects,
        availableLocations: req.body.availableLocations,
        documents: req.body.documents,
        updatedAt: new Date()
      } },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email profileImage')
    .populate('subjects.subject', 'name category educationLevel');

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
      .populate('subjects.subject', 'name category educationLevel');

    if (!tutor) {
      // If user is a tutor but profile doesn't exist, create one
      if (req.user.role === 'tutor') {
        const newTutor = await Tutor.create({
          user: req.user.id,
          status: 'active'
        });
        
        const populatedTutor = await Tutor.findById(newTutor._id)
          .populate('user', 'name email profileImage')
          .populate('subjects.subject', 'name category educationLevel');
          
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
      .populate('subject', 'name category')
      .populate('topics', 'name description')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      student: {
        _id: review.student._id,
        name: review.student.name,
        profileImage: review.student.profileImage
      },
      subject: {
        _id: review.subject._id,
        name: review.subject.name,
        category: review.subject.category
      },
      topics: review.topics.map(topic => ({
        _id: topic._id,
        name: topic.name,
        description: topic.description
      })),
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

// @desc    Get tutor's bookings
// @route   GET /api/tutors/bookings
// @access  Private/Tutor
export const getTutorBookings = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    const bookings = await Booking.find({ tutor: tutor._id })
      .populate('student', 'name email profileImage')
      .populate('subject', 'name category')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error in getTutorBookings:', error);
    res.status(500).json({ 
      message: 'Error fetching tutor bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/tutors/bookings/:id
// @access  Private/Tutor
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }
    
    const booking = await Booking.findOne({ 
      _id: req.params.id,
      tutor: tutor._id
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Allow updating from 'pending' to 'confirmed' or 'cancelled'
    // Allow updating from 'confirmed' to 'completed'
    if (status === 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only confirm pending bookings' });
    }
    
    if (status === 'cancelled' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending bookings' });
    }
    
    if (status === 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only complete confirmed bookings' });
    }
    
    booking.status = status;
    await booking.save();
    
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('student', 'name email profileImage')
      .populate('subject', 'name category');
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ 
      message: 'Error updating booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload document
// @route   POST /api/tutors/documents
// @access  Private (Tutor only)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    // Add the document to the tutor's documents array
    const document = {
      id: req.file.filename,
      url: req.file.path,
      type: req.body.type || 'other',
      uploadedAt: new Date()
    };

    tutor.documents.push(document);
    await tutor.save();

    res.status(200).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/tutors/documents/:id
// @access  Private (Tutor only)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    // Find the document
    const documentIndex = tutor.documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = tutor.documents[documentIndex];

    // Delete the file from Cloudinary
    try {
      await cloudinary.uploader.destroy(id);
    } catch (cloudinaryError) {
      console.error('Error deleting file from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Remove the document from the array
    tutor.documents.splice(documentIndex, 1);
    await tutor.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Document delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
}; 