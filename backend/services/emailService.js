import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.context - Template context
 */
export const sendEmail = async ({ to, subject, template, context }) => {
  try {
    let html = '';
    
    // Simple email templates
    if (template === 'tutorApproved') {
      html = `
        <h1>Congratulations ${context.name}!</h1>
        <p>Your tutor profile has been approved. You can now start accepting students.</p>
        <p>Login to your account to get started: <a href="${context.loginUrl}">${context.loginUrl}</a></p>
      `;
    } else if (template === 'tutorRejected') {
      html = `
        <h1>Profile Update Required</h1>
        <p>Dear ${context.name},</p>
        <p>We regret to inform you that your tutor profile has been rejected for the following reason:</p>
        <p><strong>${context.reason}</strong></p>
        <p>Please update your profile accordingly and submit it for review again.</p>
        <p>If you have any questions, please contact our support team at ${context.supportEmail}</p>
      `;
    }

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Verified Tutors" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 