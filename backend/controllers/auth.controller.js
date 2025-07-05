import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Tutor from '../models/tutor.model.js';
import passport from 'passport';
import { sendEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    console.log(`👤 User registration attempt: ${email} (${role})`);
    
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`❌ Registration failed: User already exists - ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log(`✅ Creating new user account: ${email}`);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: ['admin', 'tutor', 'student'].includes(role) ? role : 'student',
    });

    console.log(`✅ User account created successfully: ${user._id}`);

    // If user is a tutor, create a tutor profile
    if (user.role === 'tutor') {
      console.log(`👨‍🏫 Creating tutor profile for: ${user._id}`);
      await Tutor.create({
        user: user._id,
        phone: phone || '',
      });
      console.log(`✅ Tutor profile created successfully`);
    }

    // Generate token
    const token = generateToken(user._id);
    console.log(`🔑 JWT token generated for user: ${user._id}`);

    // Send welcome notifications
    console.log(`📧 Sending welcome notifications to: ${email}`);
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      
      // Send email notification
      console.log(`📧 Sending registration email to: ${email}`);
      const emailResult = await sendEmail({
        to: user.email,
        template: user.role === 'tutor' ? 'tutorRegistration' : 'studentRegistration',
        context: {
          name: user.name,
          loginUrl
        }
      });

      if (emailResult.success) {
        console.log(`✅ Registration email sent successfully to ${email}`);
      } else {
        console.log(`❌ Registration email failed: ${emailResult.reason}`);
      }

      // Send SMS notification if phone number is provided
      if (phone) {
        console.log(`📱 Sending registration SMS to: ${phone}`);
        const smsResult = await sendSMS({
          to: phone,
          template: user.role === 'tutor' ? 'tutorRegistration' : 'studentRegistration',
          context: {
            name: user.name,
            loginUrl
          }
        });

        if (smsResult.success) {
          console.log(`✅ Registration SMS sent successfully to ${phone}`);
        } else {
          console.log(`❌ Registration SMS failed: ${smsResult.reason}`);
        }
      } else {
        console.log(`📱 No phone number provided, skipping SMS notification`);
      }
    } catch (notificationError) {
      console.error(`❌ Failed to send welcome notifications:`, notificationError);
      // Don't fail the registration if notifications fail
    }

    console.log(`🎉 User registration completed successfully: ${email}`);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(`❌ User registration error:`, error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only allowed fields
    const { name, profileImage } = req.body;

    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, data) => {
    if (err) {
      return res.redirect(`http://localhost:5173/login?error=${err.message}`);
    }

    const { user, token, isNewUser } = data;
    
    if (isNewUser || user.role === null) {
      // For new users or users without a role, redirect to role selection with temporary token
      res.redirect(
        `http://localhost:5173/register?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}&isGoogleAuth=true`
      );
    } else {
      // For existing users with a role, proceed with normal login
      res.redirect(
        `http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
      );
    }
  })(req, res, next);
};

// @desc    Update Google user's role
// @route   PUT /api/auth/google/update-role
// @access  Private
export const updateGoogleUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user._id;

    console.log(`🔄 Updating Google user role: ${userId} to ${role}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.socialProvider !== 'google') {
      console.log(`❌ Not a Google user: ${userId}`);
      return res.status(400).json({ message: 'This endpoint is only for Google users' });
    }

    user.role = role;
    await user.save();
    console.log(`✅ Google user role updated successfully: ${userId} -> ${role}`);

    // If user is a tutor, create a tutor profile
    if (user.role === 'tutor') {
      console.log(`👨‍🏫 Creating tutor profile for Google user: ${user._id}`);
      await Tutor.create({
        user: user._id,
        phone: '', // Google users don't have phone initially
      });
      console.log(`✅ Tutor profile created for Google user`);
    }

    // Send role confirmation notifications
    console.log(`📧 Sending role confirmation notifications to: ${user.email}`);
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      
      // Send email notification
      console.log(`📧 Sending role confirmation email to: ${user.email}`);
      const emailResult = await sendEmail({
        to: user.email,
        template: user.role === 'tutor' ? 'tutorRegistration' : 'studentRegistration',
        context: {
          name: user.name,
          loginUrl,
          email: user.email
        }
      });

      if (emailResult.success) {
        console.log(`✅ Role confirmation email sent successfully to ${user.email}`);
      } else {
        console.log(`❌ Role confirmation email failed: ${emailResult.reason}`);
      }

      // Note: SMS not sent for Google users since we don't have phone number
      console.log(`📱 No phone number available for Google user, skipping SMS notification`);
      
    } catch (notificationError) {
      console.error(`❌ Failed to send role confirmation notifications:`, notificationError);
      // Don't fail the role update if notifications fail
    }

    console.log(`🎉 Google user role update completed successfully: ${user.email} -> ${role}`);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        socialProvider: user.socialProvider
      }
    });
  } catch (error) {
    console.error(`❌ Google user role update error:`, error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send password reset notification
    try {
      await sendEmail({
        to: user.email,
        template: 'passwordReset',
        context: {
          name: user.name,
          resetUrl
        }
      });

      // Send SMS if phone number exists
      if (user.phone) {
        await sendSMS({
          to: user.phone,
          template: 'passwordReset',
          context: {
            name: user.name,
            resetUrl
          }
        });
      }
    } catch (notificationError) {
      console.error('Failed to send password reset notification:', notificationError);
      return res.status(500).json({ message: 'Failed to send password reset notification' });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};