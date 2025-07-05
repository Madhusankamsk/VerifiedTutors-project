import nodemailer from 'nodemailer';

// Initialize transporter only if credentials are available
let transporter = null;
let isEmailConfigured = false;

try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    isEmailConfigured = true;
    console.log('Email service configured successfully');
  } else {
    console.log('SMTP credentials not found. Email service will be disabled.');
  }
} catch (error) {
  console.log('Failed to initialize email transporter. Email service will be disabled.');
}

/**
 * Email templates
 */
const emailTemplates = {
  // Registration templates
  tutorRegistration: (context) => ({
    subject: 'Welcome to VerifiedTutors - Registration Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to VerifiedTutors!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your tutor registration is complete</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering as a tutor on VerifiedTutors! Your account has been successfully created.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Complete your profile with education and experience details</li>
              <li>Upload required documents for verification</li>
              <li>Set your teaching subjects and topics</li>
              <li>Configure your availability and rates</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.loginUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Complete Your Profile
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Our verification team will review your profile within 24-48 hours. You'll receive an email notification once your account is verified.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              If you have any questions, please contact our support team at 
              <a href="mailto:support@verifiedtutors.com" style="color: #667eea;">support@verifiedtutors.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  studentRegistration: (context) => ({
    subject: 'Welcome to VerifiedTutors - Student Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to VerifiedTutors!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your student account is ready</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to VerifiedTutors! Your student account has been successfully created and you're ready to start learning.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Get Started:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Browse verified tutors by subject and topic</li>
              <li>Read tutor profiles and reviews</li>
              <li>Book sessions with your preferred tutors</li>
              <li>Track your learning progress</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.loginUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Start Learning
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We're excited to help you achieve your learning goals with our verified and experienced tutors.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Need help? Contact us at 
              <a href="mailto:support@verifiedtutors.com" style="color: #667eea;">support@verifiedtutors.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  googleRegistration: (context) => ({
    subject: 'Welcome to VerifiedTutors - Google Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to VerifiedTutors!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Google account is ready</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to VerifiedTutors! Your account has been successfully created using your Google account (${context.email}).
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Complete your profile by selecting your role (Student or Tutor)</li>
              <li>If you're a tutor, complete your verification process</li>
              <li>If you're a student, start browsing tutors</li>
              <li>Set up your preferences and availability</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-bottom: 10px;">🔐 Account Security:</h3>
            <p style="color: #1976d2; margin: 0; font-size: 14px;">
              Your account is secured through Google authentication. You can sign in anytime using your Google account.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.loginUrl}" style="background: #4285f4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Complete Your Profile
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We're excited to have you join our community of learners and educators!
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Questions? Contact us at 
              <a href="mailto:support@verifiedtutors.com" style="color: #4285f4;">support@verifiedtutors.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Verification templates
  tutorApproved: (context) => ({
    subject: 'Congratulations! Your Tutor Profile is Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Profile Approved!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You can now start accepting students</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${context.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your tutor profile has been verified and approved. You can now start accepting students and earning money.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">What's Next:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Students can now find and book sessions with you</li>
              <li>You'll receive booking notifications</li>
              <li>Start earning from your expertise</li>
              <li>Build your reputation through reviews</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.loginUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for choosing VerifiedTutors. We're excited to have you as part of our community!
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Questions? Contact us at 
              <a href="mailto:support@verifiedtutors.com" style="color: #667eea;">support@verifiedtutors.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  tutorRejected: (context) => ({
    subject: 'Tutor Profile Update Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Profile Update Required</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Please review and update your profile</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We regret to inform you that your tutor profile has been rejected for the following reason:
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-bottom: 10px;">Reason for Rejection:</h3>
            <p style="color: #856404; margin: 0; font-weight: bold;">${context.reason}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Review the rejection reason above</li>
              <li>Update your profile accordingly</li>
              <li>Ensure all required documents are uploaded</li>
              <li>Resubmit your profile for review</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.loginUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Update Profile
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions about the rejection or need assistance updating your profile, please don't hesitate to contact our support team.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Contact support at 
              <a href="mailto:${context.supportEmail}" style="color: #667eea;">${context.supportEmail}</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Booking templates
  bookingConfirmation: (context) => ({
    subject: 'Booking Confirmed - Session Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your session is scheduled</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.studentName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your booking has been confirmed! Here are the session details:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Session Details:</h3>
            <div style="color: #666; line-height: 1.8;">
              <p><strong>Tutor:</strong> ${context.tutorName}</p>
              <p><strong>Subject:</strong> ${context.subject}</p>
              <p><strong>Topic:</strong> ${context.topic}</p>
              <p><strong>Date:</strong> ${context.date}</p>
              <p><strong>Time:</strong> ${context.time}</p>
              <p><strong>Duration:</strong> ${context.duration} hours</p>
              <p><strong>Mode:</strong> ${context.mode}</p>
              <p><strong>Amount:</strong> $${context.amount}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.dashboardUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Booking Details
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your tutor will contact you shortly with further instructions. Please ensure you're available at the scheduled time.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Need to reschedule? Contact your tutor or our support team.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  bookingReminder: (context) => ({
    subject: 'Reminder: Your Session is Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⏰ Session Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your session is scheduled for tomorrow</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.studentName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder that your tutoring session is scheduled for tomorrow.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Session Details:</h3>
            <div style="color: #666; line-height: 1.8;">
              <p><strong>Tutor:</strong> ${context.tutorName}</p>
              <p><strong>Subject:</strong> ${context.subject}</p>
              <p><strong>Date:</strong> ${context.date}</p>
              <p><strong>Time:</strong> ${context.time}</p>
              <p><strong>Mode:</strong> ${context.mode}</p>
            </div>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-bottom: 10px;">Preparation Tips:</h3>
            <ul style="color: #856404; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Have your study materials ready</li>
              <li>Test your internet connection (for online sessions)</li>
              <li>Prepare any questions you want to ask</li>
              <li>Find a quiet, comfortable study space</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.dashboardUrl}" style="background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Session Details
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you need to reschedule, please contact your tutor as soon as possible.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Have a great learning session!
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Password reset
  passwordReset: (context) => ({
    subject: 'Password Reset Request - VerifiedTutors',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset your account password</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${context.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Important:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>For security, don't share this link with anyone</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          
          <p style="color: #667eea; word-break: break-all; font-size: 14px; margin: 20px 0;">
            ${context.resetUrl}
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Questions? Contact us at 
              <a href="mailto:support@verifiedtutors.com" style="color: #667eea;">support@verifiedtutors.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  })
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.template - Template name
 * @param {Object} options.context - Template context
 * @param {string} options.subject - Custom subject (optional)
 */
export const sendEmail = async ({ to, template, context, subject }) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Email template: ${template}`);
    
    // Check if email service is configured
    if (!isEmailConfigured || !transporter) {
      console.log(`❌ Email NOT sent to ${to} - SMTP not configured`);
      console.log(`💡 To enable email, add SMTP credentials to .env file`);
      return { success: false, reason: 'SMTP not configured' };
    }

    let emailContent;
    
    // Get template content
    if (emailTemplates[template]) {
      emailContent = emailTemplates[template](context);
      console.log(`📧 Email template found: ${template}`);
    } else {
      console.log(`❌ Email template not found: ${template}`);
      throw new Error(`Email template '${template}' not found`);
    }

    // Use custom subject if provided, otherwise use template subject
    const emailSubject = subject || emailContent.subject;
    console.log(`📧 Email subject: ${emailSubject}`);

    // Send mail with defined transport object
    console.log(`📧 Sending email via SMTP...`);
    const info = await transporter.sendMail({
      from: `"VerifiedTutors" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: emailSubject,
      html: emailContent.html
    });

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Email message ID: ${info.messageId}`);
    console.log(`📧 Email response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    console.error(`📧 Email error details:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send multiple emails
 * @param {Array} emails - Array of email objects
 */
export const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: result.success, messageId: result.messageId, to: email.to });
    } catch (error) {
      results.push({ success: false, error: error.message, to: email.to });
    }
  }
  
  return results;
};

/**
 * Check if email service is available
 */
export const isEmailAvailable = () => {
  return isEmailConfigured && transporter !== null;
}; 