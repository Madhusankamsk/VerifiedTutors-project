import Subject from '../models/subject.model.js';
import { SUBJECT_CATEGORIES } from '../config/constants.js';

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = async (req, res) => {
  try {
    const { category, educationLevel, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (educationLevel) {
      query.educationLevel = educationLevel;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const subjects = await Subject.find(query).sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
export const createSubject = async (req, res) => {
  try {
    const { name, category, educationLevel, description, level } = req.body;

    // Validate education level
    if (!educationLevel || !['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'ADVANCED_LEVEL', 'HIGHER_EDUCATION'].includes(educationLevel)) {
      return res.status(400).json({ message: 'Invalid education level' });
    }

    // Validate category based on education level
    let validCategories = [];
    if (educationLevel === 'ADVANCED_LEVEL') {
      validCategories = [
        ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.ARTS,
        ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.COMMERCE,
        ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.SCIENCE
      ];
    } else if (educationLevel === 'HIGHER_EDUCATION') {
      validCategories = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts & Humanities'];
    } else {
      validCategories = SUBJECT_CATEGORIES[educationLevel];
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: `Invalid category for ${educationLevel}. Valid categories are: ${validCategories.join(', ')}` 
      });
    }

    const subject = await Subject.create({
      name,
      category,
      educationLevel,
      description,
      level
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
export const updateSubject = async (req, res) => {
  try {
    const { category, educationLevel } = req.body;

    // If updating category or education level, validate them
    if (category || educationLevel) {
      const currentSubject = await Subject.findById(req.params.id);
      if (!currentSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      const levelToValidate = educationLevel || currentSubject.educationLevel;
      const categoryToValidate = category || currentSubject.category;

      // Validate education level
      if (levelToValidate && !['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'ADVANCED_LEVEL', 'HIGHER_EDUCATION'].includes(levelToValidate)) {
        return res.status(400).json({ message: 'Invalid education level' });
      }

      // Validate category based on education level
      let validCategories = [];
      if (levelToValidate === 'ADVANCED_LEVEL') {
        validCategories = [
          ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.ARTS,
          ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.COMMERCE,
          ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.SCIENCE
        ];
      } else if (levelToValidate === 'HIGHER_EDUCATION') {
        validCategories = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts & Humanities'];
      } else {
        validCategories = SUBJECT_CATEGORIES[levelToValidate];
      }

      if (!validCategories.includes(categoryToValidate)) {
        return res.status(400).json({ 
          message: `Invalid category for ${levelToValidate}. Valid categories are: ${validCategories.join(', ')}` 
        });
      }
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 