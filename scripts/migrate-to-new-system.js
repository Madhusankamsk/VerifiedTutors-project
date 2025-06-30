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

// Migration function to convert string topics to Topic objects
const migrateToNewSystem = async () => {
  try {
    console.log('Starting migration to new subject-topic system...');

    // Step 1: Create Topic objects for all existing string topics
    console.log('\nStep 1: Creating Topic objects...');
    const subjects = await Subject.find({ topics: { $exists: true, $ne: [] } });
    console.log(`Found ${subjects.length} subjects with string topics to migrate`);

    for (let subject of subjects) {
      console.log(`\nMigrating topics for subject: ${subject.name}`);
      
      const createdTopicIds = [];
      
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
            description: `Topic under ${subject.name}`,
            isActive: true
          });
          
          const savedTopic = await newTopic.save();
          createdTopicIds.push(savedTopic._id);
          console.log(`  ✓ Created topic: ${topicName} (ID: ${savedTopic._id})`);
        } else {
          createdTopicIds.push(existingTopic._id);
          console.log(`  - Topic already exists: ${topicName} (ID: ${existingTopic._id})`);
        }
      }

      // Update subject with topic object references
      await Subject.findByIdAndUpdate(subject._id, {
        topicObjects: createdTopicIds
      });
      console.log(`  ✓ Updated subject with ${createdTopicIds.length} topic references`);
    }

    // Step 2: Update tutors to use Topic objects
    console.log('\nStep 2: Updating tutors...');
    const tutors = await Tutor.find({ 'subjects.bestTopics': { $exists: true, $ne: [] } })
      .populate('subjects.subject');

    let updatedTutors = 0;
    for (let tutor of tutors) {
      let tutorUpdated = false;
      
      for (let tutorSubject of tutor.subjects) {
        if (tutorSubject.bestTopics && tutorSubject.bestTopics.length > 0) {
          // Find the subject to get its topics
          const subject = await Subject.findById(tutorSubject.subject._id);
          if (subject && subject.topicObjects) {
            // Map string topics to topic object IDs
            const topicObjectIds = [];
            for (let topicName of tutorSubject.bestTopics) {
              const topic = await Topic.findOne({
                subject: subject._id,
                name: topicName
              });
              if (topic) {
                topicObjectIds.push(topic._id);
              }
            }
            
            // Update tutor subject with topic object IDs
            tutorSubject.topicObjects = topicObjectIds;
            tutorUpdated = true;
          }
        }
      }
      
      if (tutorUpdated) {
        await tutor.save();
        updatedTutors++;
        console.log(`  ✓ Updated tutor: ${tutor.user?.name || tutor._id}`);
      }
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`- Created Topic objects for ${subjects.length} subjects`);
    console.log(`- Updated ${updatedTutors} tutors with topic object references`);

    // Step 3: Generate summary report
    console.log('\nStep 3: Generating summary report...');
    const totalSubjects = await Subject.countDocuments();
    const totalTopics = await Topic.countDocuments();
    const subjectsWithTopics = await Subject.countDocuments({ topicObjects: { $exists: true, $ne: [] } });
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total Subjects: ${totalSubjects}`);
    console.log(`Total Topics: ${totalTopics}`);
    console.log(`Subjects with Topic Objects: ${subjectsWithTopics}`);
    console.log(`Tutors Updated: ${updatedTutors}`);

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Cleanup function to remove legacy string topics (optional)
const cleanupLegacyTopics = async () => {
  try {
    console.log('\nCleaning up legacy string topics...');
    
    // Remove topics array from subjects (keep topicObjects)
    const result = await Subject.updateMany(
      { topics: { $exists: true } },
      { $unset: { topics: "" } }
    );
    
    console.log(`Removed legacy topics array from ${result.modifiedCount} subjects`);
    
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const shouldCleanup = args.includes('--cleanup');
  
  await migrateToNewSystem();
  
  if (shouldCleanup) {
    await cleanupLegacyTopics();
  }
  
  console.log('\nMigration process completed!');
  process.exit(0);
};

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { migrateToNewSystem, cleanupLegacyTopics }; 