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
// This is the only unique constraint we need
ratingSchema.index({ booking: 1 }, { unique: true });

// Note: If you encounter "E11000 duplicate key error collection: test.ratings index: tutor_1_student_1_topics_1"
// This means there's an old index that needs to be dropped. Run this in MongoDB:
// db.ratings.dropIndex("tutor_1_student_1_topics_1")

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating; 