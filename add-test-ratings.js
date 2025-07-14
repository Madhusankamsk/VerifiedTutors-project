// Script to add test ratings to tutors for testing the rating filter
import mongoose from 'mongoose';
import Tutor from './backend/models/tutor.model.js';
import Rating from './backend/models/rating.model.js';
import User from './backend/models/user.model.js';
import Subject from './backend/models/subject.model.js';

const MONGODB_URI = 'mongodb://localhost:27017/verifiedtutors';

async function addTestRatings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all tutors
    const tutors = await Tutor.find({}).populate('user');
    console.log(`Found ${tutors.length} tutors`);

    if (tutors.length === 0) {
      console.log('No tutors found. Please create some tutors first.');
      return;
    }

    // Get a subject for ratings
    const subject = await Subject.findOne({});
    if (!subject) {
      console.log('No subjects found. Please create subjects first.');
      return;
    }

    // Get some users to act as students
    const students = await User.find({ role: 'student' }).limit(5);
    if (students.length === 0) {
      console.log('No students found. Please create some student users first.');
      return;
    }

    // Add ratings to first 3 tutors
    for (let i = 0; i < Math.min(3, tutors.length); i++) {
      const tutor = tutors[i];
      
      // Skip if tutor already has ratings
      const existingRatings = await Rating.find({ tutor: tutor._id });
      if (existingRatings.length > 0) {
        console.log(`Tutor ${tutor.user.name} already has ${existingRatings.length} ratings`);
        continue;
      }

      // Add 2-4 ratings per tutor with different ratings
      const numRatings = Math.floor(Math.random() * 3) + 2; // 2-4 ratings
      const ratings = [4.0, 4.5, 4.8, 3.5, 4.2]; // Different rating values
      
      for (let j = 0; j < numRatings; j++) {
        const student = students[j % students.length];
        const rating = ratings[j % ratings.length];
        
        await Rating.create({
          tutor: tutor._id,
          student: student._id,
          subject: subject._id,
          topics: [], // Empty for now
          booking: new mongoose.Types.ObjectId(), // Dummy booking ID
          rating: rating,
          review: `Test review ${j + 1} for ${tutor.user.name} with rating ${rating}`,
          isVerified: true
        });
      }

      // Update tutor's average rating
      const tutorRatings = await Rating.find({ tutor: tutor._id });
      const totalRatings = tutorRatings.length;
      const sumRatings = tutorRatings.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = sumRatings / totalRatings;

      await Tutor.findByIdAndUpdate(tutor._id, {
        rating: averageRating,
        totalReviews: totalRatings
      });

      console.log(`Added ${numRatings} ratings to ${tutor.user.name}. Average rating: ${averageRating.toFixed(1)}`);
    }

    console.log('Test ratings added successfully!');
    
    // Show summary
    const tutorsWithRatings = await Tutor.find({ rating: { $gt: 0 } });
    console.log(`\nSummary:`);
    console.log(`Tutors with ratings > 0: ${tutorsWithRatings.length}`);
    tutorsWithRatings.forEach(tutor => {
      console.log(`- ${tutor.user.name}: ${tutor.rating.toFixed(1)} stars (${tutor.totalReviews} reviews)`);
    });

  } catch (error) {
    console.error('Error adding test ratings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addTestRatings(); 