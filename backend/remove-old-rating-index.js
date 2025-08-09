// Script to remove old rating index that's causing duplicate key errors
// Run this script to fix the "E11000 duplicate key error collection: test.ratings index: tutor_1_student_1_topics_1"

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/verifiedtutors';

async function removeOldRatingIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check if the old index exists
    const indexes = await db.collection('ratings').indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    // Look for the problematic index
    const oldIndex = indexes.find(idx => idx.name === 'tutor_1_student_1_topics_1');
    
    if (oldIndex) {
      console.log('Found old index, removing it...');
      await db.collection('ratings').dropIndex('tutor_1_student_1_topics_1');
      console.log('✅ Old index removed successfully');
    } else {
      console.log('✅ Old index not found, no action needed');
    }

    // Verify the current indexes
    const updatedIndexes = await db.collection('ratings').indexes();
    console.log('Updated indexes:', updatedIndexes.map(idx => idx.name));

  } catch (error) {
    console.error('Error removing old index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

removeOldRatingIndex();
