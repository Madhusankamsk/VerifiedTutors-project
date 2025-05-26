import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Location level is required'],
      enum: [1, 2, 3], // 1: City, 2: Level 1 town, 3: Home town
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique names within the same parent
locationSchema.index({ name: 1, parent: 1 }, { unique: true });

// Virtual for getting children
locationSchema.virtual('children', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'parent'
});

// Ensure virtuals are included in JSON output
locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;