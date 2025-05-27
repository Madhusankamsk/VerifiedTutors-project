import Tutor from '../models/tutor.model.js';
import User from '../models/user.model.js';
import Blog from '../models/blog.model.js';
import Subject from '../models/subject.model.js';

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Public
export const getTutors = async (req, res) => {
  try {
    const { subject, rating, price, search } = req.query;
    let query = {};

    // Filter by subject
    if (subject) {
      query.subjects = subject;
    }

    // Filter by minimum rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Filter by maximum price
    if (price) {
      query.hourlyRate = { $lte: Number(price) };
    }

    // Search by name or bio
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const tutors = await Tutor.find(query)
      .populate('user', 'name email profileImage')
      .populate('subjects', 'name category')
      .sort({ rating: -1 });

    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Define allowed fields for update
    const allowedFields = [
      'gender',
      'mobileNumber',
      'bio',
      'subjects',
      'locations',
      'education',
      'experience',
      'hourlyRate',
      'availability',
      'documents'
    ];

    // Filter out any fields that are not allowed
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Validate specific fields if they are being updated
    if (updates.mobileNumber && !/^[0-9]{10}$/.test(updates.mobileNumber)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    if (updates.hourlyRate && updates.hourlyRate < 0) {
      return res.status(400).json({ message: 'Hourly rate cannot be negative' });
    }

    if (updates.availability) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      for (const slot of updates.availability) {
        if (!validDays.includes(slot.day)) {
          return res.status(400).json({ message: `Invalid day: ${slot.day}` });
        }

        for (const timeSlot of slot.slots) {
          if (!timeRegex.test(timeSlot.start) || !timeRegex.test(timeSlot.end)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:mm format' });
          }
        }
      }
    }

    // Update the tutor profile
    Object.assign(tutor, updates);
    await tutor.save();

    // Populate the response with related data
    const updatedTutor = await Tutor.findById(tutor._id)
      .populate('user', 'name email profileImage')
      .populate('subjects', 'name category')
      .populate('locations', 'name');

    res.json(updatedTutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    const tutor = await Tutor.findById(req.params.id).select('availability');
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor.availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
// @route   GET /api/tutors/user/:userId
// @access  Private
export const getTutorByUserId = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id })
      .populate('user', 'name email profileImage')
      .populate('subjects')
      .populate('locations');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }

    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 