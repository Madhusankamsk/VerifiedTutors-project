import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a topic name'],
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
topicSchema.index({ subject: 1 });
topicSchema.index({ name: 'text', description: 'text' });
topicSchema.index({ isActive: 1 });

// Ensure unique topic names within a subject
topicSchema.index({ subject: 1, name: 1 }, { unique: true });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic; 