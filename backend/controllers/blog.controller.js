import Blog from '../models/blog.model.js';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const query = { status: 'published' };
    
    // If user is authenticated, include their draft posts
    if (req.user) {
      query.$or = [
        { status: 'published' },
        { status: 'draft', author: req.user._id }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id).populate('author', 'name profileImage');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const likeBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment likes count
    blog.likes = (blog.likes || 0) + 1;
    await blog.save();

    res.json({ likes: blog.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 