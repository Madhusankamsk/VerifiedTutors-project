import Subject from '../models/subject.model.js';
import Tutor from '../models/tutor.model.js'; // Added import for Tutor

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    console.log('Fetching subjects with query:', query);
    
    const subjects = await Subject.find(query).sort({ name: 1 });
    console.log(`Found ${subjects.length} subjects`);
    
    res.json(subjects);
  } catch (error) {
    console.error('Error in getSubjects:', error);
    res.status(500).json({ 
      message: 'Error fetching subjects',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    const { name, description, topics } = req.body;

    if (!name) {
      return res.status(400).json({ 
        message: 'Subject name is required' 
      });
    }

    const subject = await Subject.create({
      name,
      description: description || '',
      topics: topics || [] // Make topics optional
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
    const { name, description, topics, isActive } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (topics !== undefined) updateData.topics = topics;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedSubject);
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

    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle subject status
// @route   PATCH /api/subjects/:id/toggle
// @access  Private/Admin
export const toggleSubjectStatus = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.isActive = !subject.isActive;
    await subject.save();

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

// @desc    Get tutor count for a subject
// @route   GET /api/subjects/:id/tutor-count
// @access  Public
export const getSubjectTutorCount = async (req, res) => {
  try {
    const subjectId = req.params.id;
    
    // Count tutors who teach this subject and are verified and active
    const tutorCount = await Tutor.countDocuments({
      'subjects.subject': subjectId,
      isVerified: true,
      status: 'active'
    });

    res.json({ tutorCount });
  } catch (error) {
    console.error('Error getting subject tutor count:', error);
    res.status(500).json({ message: 'Error getting tutor count' });
  }
};

// @desc    Get tutor count for all subjects
// @route   GET /api/subjects/tutor-counts
// @access  Public
export const getAllSubjectsTutorCounts = async (req, res) => {
  try {
    // Get all active subjects
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    
    // Get tutor counts for each subject
    const subjectCounts = await Promise.all(
      subjects.map(async (subject) => {
        const tutorCount = await Tutor.countDocuments({
          'subjects.subject': subject._id,
          isVerified: true,
          status: 'active'
        });
        
        return {
          subjectId: subject._id,
          subjectName: subject.name,
          tutorCount
        };
      })
    );

    res.json(subjectCounts);
  } catch (error) {
    console.error('Error getting all subjects tutor counts:', error);
    res.status(500).json({ message: 'Error getting tutor counts' });
  }
}; 