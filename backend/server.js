import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Route imports
import authRoutes from './routes/auth.routes.js';
import tutorRoutes from './routes/tutor.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';
import blogRoutes from './routes/blog.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import locationRoutes from './routes/location.routes.js';
import ratingRoutes from './routes/rating.routes.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';

// Initialize app
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ratings', ratingRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('VerifiedTutors API is running');
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // For development, can use MongoDB locally or MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/verifiedtutors');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});