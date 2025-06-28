import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    unique: true,
    trim: true
  },
  topics: [{
    type: String,
    trim: true,
    required: true
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

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;