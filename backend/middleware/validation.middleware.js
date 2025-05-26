import Joi from 'joi';

// Tutor profile validation schema
export const validateTutorProfile = (req, res, next) => {
  const schema = Joi.object({
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    bio: Joi.string().max(1000),
    hourlyRate: Joi.number().min(0).required(),
    locations: Joi.array().items(
      Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        province: Joi.string().required()
      })
    ).min(1).required(),
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().min(1900).max(new Date().getFullYear()).required()
      })
    ),
    experience: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        company: Joi.string().required(),
        duration: Joi.string().required(),
        description: Joi.string().required()
      })
    )
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Education update validation schema
export const validateEducation = (req, res, next) => {
  const schema = Joi.object({
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().min(1900).max(new Date().getFullYear()).required()
      })
    ).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Experience update validation schema
export const validateExperience = (req, res, next) => {
  const schema = Joi.object({
    experience: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        company: Joi.string().required(),
        duration: Joi.string().required(),
        description: Joi.string().required()
      })
    ).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Hourly rate validation schema
export const validateHourlyRate = (req, res, next) => {
  const schema = Joi.object({
    hourlyRate: Joi.number().min(0).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Bio validation schema
export const validateBio = (req, res, next) => {
  const schema = Joi.object({
    bio: Joi.string().max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}; 