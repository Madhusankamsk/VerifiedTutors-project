import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: [true, 'Please add a review']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per booking
ratingSchema.index({ booking: 1 }, { unique: true });

// Allow multiple reviews per tutor but prevent duplicate reviews for same tutor-topic combination
ratingSchema.index({ tutor: 1, student: 1, topics: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating; 