import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  selectedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 8 // Maximum 8 hours per session
  },
  learningMethod: {
    type: String,
    enum: ['online', 'individual', 'group'],
    required: true,
    default: 'online'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  meetingLink: {
    type: String
  },
  notes: {
    type: String
  },
  contactNumber: {
    type: String,
    required: true
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
bookingSchema.index({ student: 1, status: 1 });
bookingSchema.index({ tutor: 1, status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ subject: 1 });
bookingSchema.index({ learningMethod: 1 });

// Virtual for formatted duration
bookingSchema.virtual('formattedDuration').get(function() {
  return `${this.duration} hour${this.duration > 1 ? 's' : ''}`;
});

// Virtual for session date
bookingSchema.virtual('sessionDate').get(function() {
  return this.startTime.toLocaleDateString();
});

// Virtual for session time
bookingSchema.virtual('sessionTime').get(function() {
  const start = this.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = this.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${start} - ${end}`;
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 