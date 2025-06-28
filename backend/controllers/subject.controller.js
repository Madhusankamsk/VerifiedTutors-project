import Subject from '../models/subject.model.js';

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

    if (!name || !topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ 
        message: 'Subject name and at least one topic are required' 
      });
    }

    const subject = await Subject.create({
      name,
      description: description || '',
      topics
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