import Joi from 'joi';

// Common validation patterns
const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const phonePattern = /^[0-9]{10}$/;
const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Tutor profile validation schema
export const validateTutorProfile = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(phonePattern).required().messages({
      'string.pattern.base': 'Please provide a valid 10-digit phone number',
      'any.required': 'Phone number is required'
    }),
    gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
      'any.only': 'Gender must be either Male, Female, or Other',
      'any.required': 'Gender is required'
    }),
    bio: Joi.string().max(1000).allow('').messages({
      'string.max': 'Bio cannot exceed 1000 characters'
    }),
    socialMedia: Joi.object({
      instagram: Joi.string().allow('').messages({
        'string.base': 'Instagram username must be a string'
      }),
      youtube: Joi.string().allow('').messages({
        'string.base': 'YouTube channel must be a string'
      }),
      facebook: Joi.string().allow('').messages({
        'string.base': 'Facebook username must be a string'
      }),
      linkedin: Joi.string().allow('').messages({
        'string.base': 'LinkedIn username must be a string'
      })
    }).default({}),
    teachingMediums: Joi.array().items(
      Joi.string().valid('english', 'sinhala', 'tamil')
    ).messages({
      'array.base': 'Teaching mediums must be an array',
      'any.only': 'Invalid teaching medium'
    }),
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().required().messages({
          'string.empty': 'Degree is required',
          'any.required': 'Degree is required'
        }),
        institution: Joi.string().required().messages({
          'string.empty': 'Institution is required',
          'any.required': 'Institution is required'
        }),
        year: Joi.number().min(1900).max(new Date().getFullYear()).required().messages({
          'number.min': 'Year must be after 1900',
          'number.max': 'Year cannot be in the future',
          'any.required': 'Year is required'
        })
      })
    ).messages({
      'array.base': 'Education must be an array'
    }),
    experience: Joi.array().items(
      Joi.object({
        position: Joi.string().required().messages({
          'string.empty': 'Position is required',
          'any.required': 'Position is required'
        }),
        institution: Joi.string().required().messages({
          'string.empty': 'Institution is required',
          'any.required': 'Institution is required'
        }),
        duration: Joi.string().required().messages({
          'string.empty': 'Duration is required',
          'any.required': 'Duration is required'
        }),
        description: Joi.string().required().messages({
          'string.empty': 'Description is required',
          'any.required': 'Description is required'
        })
      })
    ).messages({
      'array.base': 'Experience must be an array'
    }),
    subjects: Joi.array().items(
      Joi.object({
        subject: Joi.object({
          _id: Joi.string().required().messages({
            'string.empty': 'Subject ID is required',
            'any.required': 'Subject ID is required'
          }),
          name: Joi.string().required().messages({
            'string.empty': 'Subject name is required',
            'any.required': 'Subject name is required'
          }),
          category: Joi.string().required().messages({
            'string.empty': 'Subject category is required',
            'any.required': 'Subject category is required'
          }),
          educationLevel: Joi.string().required().messages({
            'string.empty': 'Education level is required',
            'any.required': 'Education level is required'
          })
        }).required(),
        hourlyRate: Joi.number().min(0).required().messages({
          'number.min': 'Hourly rate must be a positive number',
          'any.required': 'Hourly rate is required'
        }),
        availability: Joi.array().items(
          Joi.object({
            day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required().messages({
              'any.only': 'Invalid day of the week',
              'any.required': 'Day is required'
            }),
            slots: Joi.array().items(
              Joi.object({
                start: Joi.string().pattern(timePattern).required().messages({
                  'string.pattern.base': 'Start time must be in HH:MM format',
                  'any.required': 'Start time is required'
                }),
                end: Joi.string().pattern(timePattern).required().messages({
                  'string.pattern.base': 'End time must be in HH:MM format',
                  'any.required': 'End time is required'
                })
              }).custom((obj, helpers) => {
                const start = new Date(`2000-01-01T${obj.start}`);
                const end = new Date(`2000-01-01T${obj.end}`);
                if (start >= end) {
                  return helpers.error('any.invalid', { message: 'End time must be after start time' });
                }
                return obj;
              })
            ).min(1).required().messages({
              'array.min': 'At least one time slot is required',
              'any.required': 'Time slots are required'
            })
          })
        ).required().messages({
          'array.base': 'Availability must be an array',
          'any.required': 'Availability is required'
        })
      })
    ).min(1).required().messages({
      'array.min': 'At least one subject is required',
      'any.required': 'Subjects are required'
    }),
    locations: Joi.array().items(
      Joi.object({
        _id: Joi.string().required().messages({
          'string.empty': 'Location ID is required',
          'any.required': 'Location ID is required'
        }),
        name: Joi.string().required().messages({
          'string.empty': 'Location name is required',
          'any.required': 'Location name is required'
        })
      })
    ).min(1).required().messages({
      'array.min': 'At least one location is required',
      'any.required': 'Locations are required'
    }),
    documents: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('qualification', 'identity', 'other').required().messages({
          'any.only': 'Document type must be qualification, identity, or other',
          'any.required': 'Document type is required'
        }),
        url: Joi.string().uri().required().messages({
          'string.uri': 'Document URL must be a valid URI',
          'any.required': 'Document URL is required'
        }),
        verified: Joi.boolean().default(false)
      })
    ).messages({
      'array.base': 'Documents must be an array'
    }),
    rating: Joi.number().min(0).max(5).default(0).messages({
      'number.min': 'Rating must be at least 0',
      'number.max': 'Rating cannot exceed 5'
    }),
    totalReviews: Joi.number().min(0).default(0).messages({
      'number.min': 'Total reviews cannot be negative'
    }),
    isVerified: Joi.boolean().default(false),
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active').messages({
      'any.only': 'Status must be active, inactive, or suspended'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Education update validation schema
export const validateEducation = (req, res, next) => {
  const schema = Joi.object({
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().required().messages({
          'string.empty': 'Degree is required',
          'any.required': 'Degree is required'
        }),
        institution: Joi.string().required().messages({
          'string.empty': 'Institution is required',
          'any.required': 'Institution is required'
        }),
        year: Joi.number().min(1900).max(new Date().getFullYear()).required().messages({
          'number.min': 'Year must be after 1900',
          'number.max': 'Year cannot be in the future',
          'any.required': 'Year is required'
        })
      })
    ).required().messages({
      'array.base': 'Education must be an array',
      'any.required': 'Education is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Experience update validation schema
export const validateExperience = (req, res, next) => {
  const schema = Joi.object({
    experience: Joi.array().items(
      Joi.object({
        position: Joi.string().required().messages({
          'string.empty': 'Position is required',
          'any.required': 'Position is required'
        }),
        institution: Joi.string().required().messages({
          'string.empty': 'Institution is required',
          'any.required': 'Institution is required'
        }),
        duration: Joi.string().required().messages({
          'string.empty': 'Duration is required',
          'any.required': 'Duration is required'
        }),
        description: Joi.string().required().messages({
          'string.empty': 'Description is required',
          'any.required': 'Description is required'
        })
      })
    ).required().messages({
      'array.base': 'Experience must be an array',
      'any.required': 'Experience is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Hourly rate validation schema
export const validateHourlyRate = (req, res, next) => {
  const schema = Joi.object({
    hourlyRate: Joi.number().min(0).required().messages({
      'number.min': 'Hourly rate must be a positive number',
      'any.required': 'Hourly rate is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Bio validation schema
export const validateBio = (req, res, next) => {
  const schema = Joi.object({
    bio: Joi.string().max(1000).required().messages({
      'string.max': 'Bio cannot exceed 1000 characters',
      'any.required': 'Bio is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Availability validation schema
export const validateAvailability = (req, res, next) => {
  const schema = Joi.object({
    availability: Joi.array().items(
      Joi.object({
        day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required().messages({
          'any.only': 'Invalid day of the week',
          'any.required': 'Day is required'
        }),
        slots: Joi.array().items(
          Joi.object({
            start: Joi.string().pattern(timePattern).required().messages({
              'string.pattern.base': 'Start time must be in HH:MM format',
              'any.required': 'Start time is required'
            }),
            end: Joi.string().pattern(timePattern).required().messages({
              'string.pattern.base': 'End time must be in HH:MM format',
              'any.required': 'End time is required'
            })
          }).custom((obj, helpers) => {
            const start = new Date(`2000-01-01T${obj.start}`);
            const end = new Date(`2000-01-01T${obj.end}`);
            if (start >= end) {
              return helpers.error('any.invalid', { message: 'End time must be after start time' });
            }
            return obj;
          })
        ).min(1).required().messages({
          'array.min': 'At least one time slot is required',
          'any.required': 'Time slots are required'
        })
      })
    ).required().messages({
      'array.base': 'Availability must be an array',
      'any.required': 'Availability is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Subjects validation schema
export const validateSubjects = (req, res, next) => {
  const schema = Joi.object({
    subjects: Joi.array().items(
      Joi.object({
        subject: Joi.object({
          _id: Joi.string().required().messages({
            'string.empty': 'Subject ID is required',
            'any.required': 'Subject ID is required'
          }),
          name: Joi.string().required().messages({
            'string.empty': 'Subject name is required',
            'any.required': 'Subject name is required'
          }),
          category: Joi.string().required().messages({
            'string.empty': 'Subject category is required',
            'any.required': 'Subject category is required'
          }),
          educationLevel: Joi.string().required().messages({
            'string.empty': 'Education level is required',
            'any.required': 'Education level is required'
          })
        }).required(),
        hourlyRate: Joi.number().min(0).required().messages({
          'number.min': 'Hourly rate must be a positive number',
          'any.required': 'Hourly rate is required'
        })
      })
    ).min(1).required().messages({
      'array.min': 'At least one subject is required',
      'any.required': 'Subjects are required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Documents validation schema
export const validateDocuments = (req, res, next) => {
  const schema = Joi.object({
    documents: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('qualification', 'identity', 'other').required().messages({
          'any.only': 'Document type must be qualification, identity, or other',
          'any.required': 'Document type is required'
        }),
        url: Joi.string().uri().required().messages({
          'string.uri': 'Document URL must be a valid URI',
          'any.required': 'Document URL is required'
        }),
        verified: Joi.boolean().default(false)
      })
    ).required().messages({
      'array.base': 'Documents must be an array',
      'any.required': 'Documents are required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// User profile validation schema
export const validateUserProfile = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Name is required',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    profileImage: Joi.string().uri().allow('').messages({
      'string.uri': 'Profile image must be a valid URI'
    }),
    role: Joi.string().valid('admin', 'tutor', 'student').required().messages({
      'any.only': 'Role must be admin, tutor, or student',
      'any.required': 'Role is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
}; 