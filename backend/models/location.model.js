import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true
  },
  town: {
    type: String,
    required: true,
    trim: true
  },
  hometown: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
locationSchema.index({ city: 1, town: 1, hometown: 1 }, { unique: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;