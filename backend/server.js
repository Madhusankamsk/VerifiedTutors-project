import './config/env.config.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import './config/passport.js'; // Import passport configuration

// Route imports
import authRoutes from './routes/auth.routes.js';
import tutorRoutes from './routes/tutor.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';
import blogRoutes from './routes/blog.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import locationRoutes from './routes/location.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import bookingRoutes from './routes/booking.routes.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://100.81.203.23:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookings', bookingRoutes);

// Base API route
app.get('/api', (req, res) => {
  res.send('VerifiedTutors API is running');
});

// All other routes should serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // For development, can use MongoDB locally or MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});