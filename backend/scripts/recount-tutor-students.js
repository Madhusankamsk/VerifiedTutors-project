import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/booking.model.js';
import Tutor from '../models/tutor.model.js';

dotenv.config();

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/verifiedtutors';
    await mongoose.connect(mongoUri, { autoIndex: false });
    console.log('Connected to MongoDB');

    // Find unique tutor IDs from bookings
    const pipeline = [
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: { tutor: '$tutor', student: '$student' } } },
      { $group: { _id: '$_id.tutor', uniqueStudents: { $sum: 1 } } }
    ];

    const results = await Booking.aggregate(pipeline);
    const tutorIdToCount = new Map(results.map(r => [String(r._id), r.uniqueStudents]));

    const cursor = Tutor.find().cursor();
    let updated = 0;
    for await (const tutor of cursor) {
      const count = tutorIdToCount.get(String(tutor._id)) || 0;
      if (tutor.totalStudents !== count) {
        tutor.totalStudents = count;
        await tutor.save();
        updated++;
        console.log(`Updated tutor ${tutor._id} totalStudents => ${count}`);
      }
    }

    console.log(`Done. Updated ${updated} tutors.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Recount script failed:', err);
    process.exitCode = 1;
  }
}

main();


