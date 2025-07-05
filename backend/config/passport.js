import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import Tutor from '../models/tutor.model.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';

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
        console.log(`🔍 Checking for existing Google user: ${profile.emails[0].value}`);
        
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        let isNewUser = false;

        if (!user) {
          console.log(`✅ Creating new Google user: ${profile.emails[0].value}`);
          
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
          console.log(`✅ Google user created successfully: ${user._id}`);

          // Send welcome notifications for new Google users
          console.log(`📧 Sending welcome notifications to new Google user: ${user.email}`);
          try {
            const loginUrl = `${process.env.FRONTEND_URL}/login`;
            
            // Send email notification
            console.log(`📧 Sending Google registration email to: ${user.email}`);
            const emailResult = await sendEmail({
              to: user.email,
              template: 'googleRegistration',
              context: {
                name: user.name,
                loginUrl,
                email: user.email
              }
            });

            if (emailResult.success) {
              console.log(`✅ Google registration email sent successfully to ${user.email}`);
            } else {
              console.log(`❌ Google registration email failed: ${emailResult.reason}`);
            }

            // Note: SMS not sent for Google users since we don't have phone number from Google OAuth
            console.log(`📱 No phone number available for Google user, skipping SMS notification`);
            
          } catch (notificationError) {
            console.error(`❌ Failed to send Google welcome notifications:`, notificationError);
            // Don't fail the Google auth if notifications fail
          }
        } else {
          console.log(`✅ Existing Google user found: ${user.email}`);
        }

        // Generate JWT token
        const token = generateToken(user._id);
        console.log(`🔑 JWT token generated for Google user: ${user._id}`);

        return done(null, { user, token, isNewUser });
      } catch (error) {
        console.error(`❌ Google authentication error:`, error);
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