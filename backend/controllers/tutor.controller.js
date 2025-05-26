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
    const { bio, subjects, education, experience, hourlyRate, availability } = req.body;

    // Check if tutor profile already exists
    const existingTutor = await Tutor.findOne({ user: req.user._id });
    if (existingTutor) {
      return res.status(400).json({ message: 'Tutor profile already exists' });
    }

    const tutor = await Tutor.create({
      user: req.user._id,
      bio,
      subjects,
      education,
      experience,
      hourlyRate,
      availability
    });

    res.status(201).json(tutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update tutor profile
// @route   PUT /api/tutors/:id
// @access  Private/Tutor
export const updateTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if user is the tutor
    if (tutor.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if user is the tutor
    if (tutor.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await tutor.deleteOne();
    res.json({ message: 'Tutor profile removed' });
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

// @desc    Update tutor availability
// @route   PUT /api/tutors/:id/availability
// @access  Private/Tutor
export const updateTutorAvailability = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if user is the tutor
    if (tutor.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    tutor.availability = req.body.availability;
    await tutor.save();

    res.json(tutor.availability);
  } catch (error) {
    res.status(400).json({ message: error.message });
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