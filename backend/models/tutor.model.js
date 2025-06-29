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
  mobileNumber: {
    type: String,
   // required: true,
  },
  bio: {
    type: String,
   // required: true,
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
  teachingMediums: [{
    type: String,
    enum: ['english', 'sinhala', 'tamil'],
    default: []
  }],
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
    title: {
      type: String,
     // required: true,
    },
    company: {
      type: String,
     // required: true,
    },
    duration: {
      type: String,
     // required: true,
    },
    description: {
      type: String,
     // required: true,
    },
  }],
  hourlyRate: {
    type: Number,
  //  required: true,
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    // Legacy string topics for backward compatibility
    bestTopics: [{
      type: String,
      validate: {
        validator: function(topics) {
          return topics.length <= 5;
        },
        message: 'A tutor can have at most 5 best topics per subject'
      }
    }],
    // New topic objects
    topicObjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      validate: {
        validator: function(topics) {
          return topics.length <= 5;
        },
        message: 'A tutor can have at most 5 best topics per subject'
      }
    }],
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
  availableLocations: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
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
  totalRatings: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationDate: {
    type: Date,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationChecks: {
    documents: {
      type: Boolean,
      default: false,
    },
    education: {
      type: Boolean,
      default: false,
    },
    experience: {
      type: Boolean,
      default: false,
    },
    background: {
      type: Boolean,
      default: false,
    },
    interview: {
      type: Boolean,
      default: false,
    },
  },
  rejectionReason: {
    type: String,
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
}, {
  timestamps: true,
});

// Update the updatedAt timestamp before saving
tutorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
tutorSchema.index({ isVerified: 1 });
tutorSchema.index({ verificationStatus: 1 });
tutorSchema.index({ rating: -1 });
tutorSchema.index({ 'user.name': 1 });
tutorSchema.index({ 'user.email': 1 });
tutorSchema.index({ 'subjects.subject': 1 });
tutorSchema.index({ 'subjects.topicObjects': 1 });

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;