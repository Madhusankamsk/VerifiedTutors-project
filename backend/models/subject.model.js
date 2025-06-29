import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    unique: true,
    trim: true
  },
  // Legacy topics array for backward compatibility
  topics: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for search
subjectSchema.index({ name: 'text', description: 'text' });

// Virtual to populate topics as objects
subjectSchema.virtual('topicObjects', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'subject'
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;