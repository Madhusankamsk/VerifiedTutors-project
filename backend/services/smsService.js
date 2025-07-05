import twilio from 'twilio';

// Initialize Twilio client only if credentials are available
let client = null;
let isTwilioConfigured = false;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    isTwilioConfigured = true;
    console.log('Twilio SMS service configured successfully');
  } else {
    console.log('Twilio credentials not found. SMS service will be disabled.');
  }
} catch (error) {
  console.log('Failed to initialize Twilio client. SMS service will be disabled.');
}

/**
 * SMS templates
 */
const smsTemplates = {
  // Registration templates
  tutorRegistration: (context) => ({
    body: `Welcome to VerifiedTutors! Your tutor account has been created successfully. Complete your profile at ${context.loginUrl} to start accepting students.`
  }),

  studentRegistration: (context) => ({
    body: `Welcome to VerifiedTutors! Your student account is ready. Start learning at ${context.loginUrl}`
  }),

  googleRegistration: (context) => ({
    body: `Welcome to VerifiedTutors! Your Google account (${context.email}) is ready. Complete your profile at ${context.loginUrl} to get started.`
  }),

  // Verification templates
  tutorApproved: (context) => ({
    body: `🎉 Congratulations! Your tutor profile has been approved. You can now start accepting students and earning money. Login at ${context.loginUrl}`
  }),

  tutorRejected: (context) => ({
    body: `Your tutor profile needs updates. Reason: ${context.reason}. Please update your profile at ${context.loginUrl}`
  }),

  // Booking templates
  bookingConfirmation: (context) => ({
    body: `✅ Booking confirmed! Session with ${context.tutorName} on ${context.date} at ${context.time}. Subject: ${context.subject}. Amount: $${context.amount}`
  }),

  bookingReminder: (context) => ({
    body: `⏰ Reminder: Your session with ${context.tutorName} is tomorrow at ${context.time}. Subject: ${context.subject}. Mode: ${context.mode}`
  }),

  bookingCancelled: (context) => ({
    body: `❌ Your session with ${context.tutorName} on ${context.date} has been cancelled. You'll receive a refund within 3-5 business days.`
  }),

  // Password reset
  passwordReset: (context) => ({
    body: `Reset your VerifiedTutors password: ${context.resetUrl} (expires in 1 hour). If you didn't request this, please ignore.`
  }),

  // General notifications
  sessionStarting: (context) => ({
    body: `🚀 Your session with ${context.tutorName} starts in 15 minutes. Get ready for your ${context.subject} lesson!`
  }),

  paymentReceived: (context) => ({
    body: `💰 Payment received! $${context.amount} for your ${context.subject} session. Thank you for using VerifiedTutors!`
  }),

  newReview: (context) => ({
    body: `⭐ New review from ${context.studentName}: "${context.reviewText}". Check your dashboard for details.`
  }),

  // Admin notifications
  newTutorApplication: (context) => ({
    body: `📝 New tutor application from ${context.tutorName}. Review at ${context.adminUrl}`
  }),

  systemAlert: (context) => ({
    body: `⚠️ System Alert: ${context.message}. Please check the admin dashboard.`
  })
};

/**
 * Send an SMS
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number (with country code)
 * @param {string} options.template - Template name
 * @param {Object} options.context - Template context
 * @param {string} options.body - Custom message body (optional)
 */
export const sendSMS = async ({ to, template, context, body }) => {
  try {
    console.log(`📱 Attempting to send SMS to: ${to}`);
    console.log(`📱 SMS template: ${template}`);
    
    // Check if Twilio is configured
    if (!isTwilioConfigured || !client) {
      console.log(`❌ SMS NOT sent to ${to} - Twilio not configured`);
      console.log(`💡 To enable SMS, add Twilio credentials to .env file`);
      const messagePreview = body || smsTemplates[template]?.(context)?.body || 'No message';
      console.log(`📱 Message preview: ${messagePreview}`);
      return { success: false, reason: 'Twilio not configured' };
    }

    let messageBody;
    
    // Get template content
    if (smsTemplates[template]) {
      messageBody = smsTemplates[template](context).body;
      console.log(`📱 SMS template found: ${template}`);
    } else if (body) {
      messageBody = body;
      console.log(`📱 Using custom SMS body`);
    } else {
      console.log(`❌ SMS template not found: ${template}`);
      throw new Error(`SMS template '${template}' not found and no custom body provided`);
    }

    console.log(`📱 SMS message: ${messageBody}`);

    // Send SMS using Twilio
    console.log(`📱 Sending SMS via Twilio...`);
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`✅ SMS sent successfully to ${to}`);
    console.log(`📱 SMS message ID: ${message.sid}`);
    console.log(`📱 SMS status: ${message.status}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    console.error(`📱 SMS error details:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send multiple SMS messages
 * @param {Array} messages - Array of SMS objects
 */
export const sendBulkSMS = async (messages) => {
  const results = [];
  
  for (const message of messages) {
    try {
      const result = await sendSMS(message);
      results.push({ success: result.success, messageId: result.messageId, to: message.to });
    } catch (error) {
      results.push({ success: false, error: error.message, to: message.to });
    }
  }
  
  return results;
};

/**
 * Verify phone number using Twilio
 * @param {string} phoneNumber - Phone number to verify
 */
export const verifyPhoneNumber = async (phoneNumber) => {
  try {
    if (!isTwilioConfigured || !client) {
      console.log(`Phone verification not available - Twilio not configured`);
      return { success: false, reason: 'Twilio not configured' };
    }

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });

    return { success: true, verification };
  } catch (error) {
    console.error('Error verifying phone number:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check verification code
 * @param {string} phoneNumber - Phone number
 * @param {string} code - Verification code
 */
export const checkVerificationCode = async (phoneNumber, code) => {
  try {
    if (!isTwilioConfigured || !client) {
      console.log(`Phone verification not available - Twilio not configured`);
      return { success: false, reason: 'Twilio not configured' };
    }

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code: code
      });

    return { success: true, verificationCheck };
  } catch (error) {
    console.error('Error checking verification code:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to both email and SMS
 * @param {Object} options - Notification options
 * @param {string} options.email - Recipient email
 * @param {string} options.phone - Recipient phone number
 * @param {string} options.emailTemplate - Email template name
 * @param {string} options.smsTemplate - SMS template name
 * @param {Object} options.context - Template context
 */
export const sendNotification = async ({ email, phone, emailTemplate, smsTemplate, context }) => {
  const results = {
    email: null,
    sms: null
  };

  // Send email if email template is provided
  if (email && emailTemplate) {
    try {
      const { sendEmail } = await import('./emailService.js');
      results.email = await sendEmail({
        to: email,
        template: emailTemplate,
        context
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      results.email = { error: error.message };
    }
  }

  // Send SMS if SMS template is provided
  if (phone && smsTemplate) {
    try {
      results.sms = await sendSMS({
        to: phone,
        template: smsTemplate,
        context
      });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      results.sms = { error: error.message };
    }
  }

  return results;
};

/**
 * Check if SMS service is available
 */
export const isSMSAvailable = () => {
  return isTwilioConfigured && client !== null;
}; 