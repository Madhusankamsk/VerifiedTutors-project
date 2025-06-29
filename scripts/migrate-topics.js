import mongoose from 'mongoose';
import Subject from '../backend/models/subject.model.js';
import Topic from '../backend/models/topic.model.js';
import Tutor from '../backend/models/tutor.model.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verifiedtutors');
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateTopic = async () => {
  try {
    console.log('Starting topic migration...');

    // Get all subjects with string topics
    const subjects = await Subject.find({ topics: { $exists: true, $ne: [] } });
    console.log(`Found ${subjects.length} subjects with topics to migrate`);

    for (let subject of subjects) {
      console.log(`\nMigrating topics for subject: ${subject.name}`);
      
      // Create Topic objects for each string topic
      for (let topicName of subject.topics) {
        const existingTopic = await Topic.findOne({ 
          subject: subject._id, 
          name: topicName 
        });

        if (!existingTopic) {
          const newTopic = new Topic({
            name: topicName,
            subject: subject._id,
            description: `Topic under ${subject.name}`
          });
          
          await newTopic.save();
          console.log(`  ✓ Created topic: ${topicName}`);
        } else {
          console.log(`  - Topic already exists: ${topicName}`);
        }
      }
    }

    // Update tutors to use Topic objects instead of strings
    console.log('\nUpdating tutors...');
    const tutors = await Tutor.find({ 'subjects.bestTopics': { $exists: true, $ne: [] } })
      .populate('subjects.subject');

    for (let tutor of tutors) {
      let updated = false;
      
      for (let subjectInfo of tutor.subjects) {
        if (subjectInfo.bestTopics && subjectInfo.bestTopics.length > 0) {
          const topicObjects = [];
          
          for (let topicName of subjectInfo.bestTopics) {
            const topic = await Topic.findOne({
              subject: subjectInfo.subject._id,
              name: topicName
            });
            
            if (topic) {
              topicObjects.push(topic._id);
            }
          }
          
          subjectInfo.topicObjects = topicObjects;
          updated = true;
        }
      }
      
      if (updated) {
        await tutor.save();
        console.log(`  ✓ Updated tutor: ${tutor.user?.name || tutor._id}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Note: Original string topics are preserved for backward compatibility');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateTopic();
};

runMigration(); 