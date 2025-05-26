import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String,
  }],
  hourlyRate: {
    type: Number,
    default: 0,
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    slots: [{
      start: String,
      end: String,
    }],
  }],
  rating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  documents: [{
    type: String, // URLs to stored documents
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;