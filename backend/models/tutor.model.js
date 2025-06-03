import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number'],
   // required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
   // required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  socialMedia: {
    instagram: {
      type: String,
      default: '',
    },
    youtube: {
      type: String,
      default: '',
    },
    facebook: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    }
  },
  education: [{
    degree: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  }],
  experience: [{
    position: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  }],
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    rates: {
      individual: {
        type: Number,
        required: false,
        min: 0,
      },
      group: {
        type: Number,
        required: false,
        min: 0,
      },
      online: {
        type: Number,
        required: false,
        min: 0,
      }
    },
    availability: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      },
      slots: [{
        start: {
          type: String,
          required: true,
        },
        end: {
          type: String,
          required: true,
        },
      }],
    }],
  }],
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  }],
  documents: [{
    url: {
      type: String,
      required: true,
    }
  }],
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
tutorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;