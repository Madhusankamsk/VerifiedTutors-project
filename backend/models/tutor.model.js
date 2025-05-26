import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please specify your gender'],
  },
  mobileNumber: {
    type: String,
    required: [true, 'Please add a mobile number'],
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
  },
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  }],
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