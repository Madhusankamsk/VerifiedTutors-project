import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  educationLevel: {
    type: String,
    required: [true, 'Please add an education level'],
    enum: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'ADVANCED_LEVEL', 'HIGHER_EDUCATION']
  },
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
});

// Add compound index for category and educationLevel
subjectSchema.index({ category: 1, educationLevel: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;