import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        let isNewUser = false;

        if (!user) {
          // Create new user if doesn't exist, but without a role
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            profileImage: profile.photos[0].value,
            socialProvider: 'google',
            password: Math.random().toString(36).slice(-8), // Generate random password
            role: null // Don't set a default role
          });
          isNewUser = true;
        }

        // Generate JWT token
        const token = generateToken(user._id);

        return done(null, { user, token, isNewUser });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport; 