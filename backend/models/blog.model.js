import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: [true, 'Please specify the author'],
  },
  featuredImage: {
    type: String,
    default: '',
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: {
      values: ['draft', 'published'],
      message: '{VALUE} is not a valid status'
    },
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt timestamp before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create text index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Add virtual for reading time (assuming average reading speed of 200 words per minute)
blogSchema.virtual('readingTime').get(function() {
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;