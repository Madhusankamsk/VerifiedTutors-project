import mongoose from 'mongoose';
import Subject from '../backend/models/subject.model.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verifiedtutors');
    console.log('MongoDB connected for cleanup');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cleanup function to remove legacy topics array
const cleanupLegacyTopics = async () => {
  try {
    console.log('Starting cleanup of legacy topics array...');

    // Remove topics array from all subjects
    const result = await Subject.updateMany(
      { topics: { $exists: true } },
      { $unset: { topics: "" } }
    );
    
    console.log(`✓ Removed legacy topics array from ${result.modifiedCount} subjects`);

    // Verify cleanup
    const subjectsWithLegacyTopics = await Subject.countDocuments({ topics: { $exists: true } });
    console.log(`✓ Subjects still with legacy topics: ${subjectsWithLegacyTopics}`);

    // Show summary
    const totalSubjects = await Subject.countDocuments();
    console.log(`✓ Total subjects in database: ${totalSubjects}`);

    console.log('\n🎉 Legacy topics cleanup completed successfully!');
    console.log('The new Topic object system is now fully active.');

  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await cleanupLegacyTopics();
  process.exit(0);
};

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { cleanupLegacyTopics }; 