import Topic from '../models/topic.model.js';
import Subject from '../models/subject.model.js';

// Get all topics
export const getTopics = async (req, res) => {
  try {
    const { subjectId, search } = req.query;
    
    let query = { isActive: true };
    
    if (subjectId) {
      query.subject = subjectId;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const topics = await Topic.find(query)
      .populate('subject', 'name')
      .sort({ name: 1 });
    
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
};

// Get topics by subject
export const getTopicsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const topics = await Topic.find({ 
      subject: subjectId, 
      isActive: true 
    }).sort({ name: 1 });
    
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics by subject:', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
};

// Create topic
export const createTopic = async (req, res) => {
  try {
    const { name, description, subject } = req.body;
    
    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check if topic already exists for this subject
    const existingTopic = await Topic.findOne({ name, subject });
    if (existingTopic) {
      return res.status(400).json({ message: 'Topic already exists for this subject' });
    }
    
    const topic = new Topic({
      name,
      description,
      subject
    });
    
    await topic.save();
    await topic.populate('subject', 'name');
    
    res.status(201).json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Error creating topic' });
  }
};

// Update topic
export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const topic = await Topic.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    ).populate('subject', 'name');
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Error updating topic' });
  }
};

// Delete topic
export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    
    const topic = await Topic.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Error deleting topic' });
  }
}; 