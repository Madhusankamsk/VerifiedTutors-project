# Email and SMS Notification System

This document describes the comprehensive email and SMS notification system implemented for the VerifiedTutors platform.

## Overview

The notification system provides automated email and SMS notifications for various events throughout the application, including user registration, tutor verification, booking confirmations, and more.

## Features

### Email Notifications
- **Registration Welcome**: Sent to new tutors and students
- **Tutor Verification**: Approval and rejection notifications
- **Booking Confirmations**: Session details and confirmations
- **Booking Reminders**: Session reminders sent before scheduled sessions
- **Password Reset**: Secure password reset links
- **Payment Confirmations**: Payment received notifications
- **Review Notifications**: New review alerts for tutors

### SMS Notifications
- **Registration Confirmations**: Welcome messages via SMS
- **Verification Status**: Approval/rejection notifications
- **Booking Updates**: Session confirmations and reminders
- **Password Reset**: Secure reset links via SMS
- **Payment Confirmations**: Payment received notifications
- **Session Reminders**: Pre-session reminders

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=noreply@verifiedtutors.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid

# Application URLs
FRONTEND_URL=http://localhost:3000
SUPPORT_EMAIL=support@verifiedtutors.com
ADMIN_EMAIL=admin@verifiedtutors.com
```

### Dependencies

Install the required dependencies:

```bash
npm install nodemailer twilio
```

## Email Templates

### Registration Templates

#### Tutor Registration
- **Subject**: "Welcome to VerifiedTutors - Registration Successful"
- **Content**: Welcome message with next steps for profile completion
- **Actions**: Complete profile, upload documents, set subjects

#### Student Registration
- **Subject**: "Welcome to VerifiedTutors - Student Registration"
- **Content**: Welcome message with learning platform introduction
- **Actions**: Browse tutors, book sessions, track progress

### Verification Templates

#### Tutor Approved
- **Subject**: "Congratulations! Your Tutor Profile is Approved"
- **Content**: Approval notification with next steps
- **Actions**: Start accepting students, view dashboard

#### Tutor Rejected
- **Subject**: "Tutor Profile Update Required"
- **Content**: Rejection reason with improvement suggestions
- **Actions**: Update profile, resubmit for review

### Booking Templates

#### Booking Confirmation
- **Subject**: "Booking Confirmed - Session Details"
- **Content**: Complete session details including tutor, subject, date, time
- **Actions**: View booking details, contact tutor

#### Booking Reminder
- **Subject**: "Reminder: Your Session is Tomorrow"
- **Content**: Session reminder with preparation tips
- **Actions**: View session details, prepare materials

### Password Reset

#### Password Reset Request
- **Subject**: "Password Reset Request - VerifiedTutors"
- **Content**: Secure reset link with expiration notice
- **Actions**: Reset password, security tips

## SMS Templates

### Registration SMS
```
Welcome to VerifiedTutors! Your [tutor/student] account has been created successfully. Complete your profile at [loginUrl] to get started.
```

### Verification SMS
```
🎉 Congratulations! Your tutor profile has been approved. You can now start accepting students and earning money. Login at [loginUrl]
```

### Booking SMS
```
✅ Booking confirmed! Session with [tutorName] on [date] at [time]. Subject: [subject]. Amount: $[amount]
```

### Password Reset SMS
```
Reset your VerifiedTutors password: [resetUrl] (expires in 1 hour). If you didn't request this, please ignore.
```

## API Endpoints

### Authentication Notifications

#### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "tutor",
  "phone": "+1234567890"
}
```

#### Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Booking Notifications

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "tutorId": "tutor_id",
  "subjectId": "subject_id",
  "topicId": "topic_id",
  "date": "2024-01-15",
  "time": "14:00",
  "duration": 2,
  "teachingMode": "online",
  "amount": 50,
  "notes": "Additional notes"
}
```

#### Send Reminder
```http
POST /api/bookings/:id/reminder
Authorization: Bearer <token>
```

### Admin Notifications

#### Approve Tutor
```http
PATCH /api/admin/tutors/:id/approve
Authorization: Bearer <admin_token>
```

#### Reject Tutor
```http
PATCH /api/admin/tutors/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```

## Usage Examples

### Sending Email Notifications

```javascript
import { sendEmail } from '../services/emailService.js';

// Send registration email
await sendEmail({
  to: 'user@example.com',
  template: 'tutorRegistration',
  context: {
    name: 'John Doe',
    loginUrl: 'http://localhost:3000/login'
  }
});
```

### Sending SMS Notifications

```javascript
import { sendSMS } from '../services/smsService.js';

// Send booking confirmation SMS
await sendSMS({
  to: '+1234567890',
  template: 'bookingConfirmation',
  context: {
    studentName: 'Jane Smith',
    tutorName: 'John Doe',
    subject: 'Mathematics',
    date: '2024-01-15',
    time: '14:00',
    amount: 50
  }
});
```

### Using Notification Service

```javascript
import NotificationService from '../services/notificationService.js';

// Send registration notification
await NotificationService.sendRegistrationNotification({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'tutor'
});

// Send booking notification
await NotificationService.sendBookingNotification(booking, 'confirmation');
```

## Error Handling

The notification system includes comprehensive error handling:

- **Graceful Degradation**: If email/SMS fails, the main operation continues
- **Logging**: All notification errors are logged for debugging
- **Retry Logic**: Failed notifications can be retried
- **Fallback**: Multiple notification channels ensure delivery

## Security Considerations

### Email Security
- **SMTP Authentication**: Secure SMTP with username/password
- **TLS Encryption**: All emails sent over encrypted connections
- **Rate Limiting**: Prevents email spam and abuse

### SMS Security
- **Twilio Verification**: Phone number verification service
- **Secure Tokens**: JWT tokens for password reset
- **Rate Limiting**: SMS rate limiting to prevent abuse

## Testing

### Email Testing
```javascript
// Test email service
const testEmail = await sendEmail({
  to: 'test@example.com',
  template: 'tutorRegistration',
  context: {
    name: 'Test User',
    loginUrl: 'http://localhost:3000/login'
  }
});
console.log('Email sent:', testEmail.messageId);
```

### SMS Testing
```javascript
// Test SMS service
const testSMS = await sendSMS({
  to: '+1234567890',
  template: 'bookingConfirmation',
  context: {
    studentName: 'Test Student',
    tutorName: 'Test Tutor',
    subject: 'Test Subject',
    date: '2024-01-15',
    time: '14:00',
    amount: 50
  }
});
console.log('SMS sent:', testSMS.sid);
```

## Monitoring and Analytics

### Email Metrics
- **Delivery Rate**: Track successful email deliveries
- **Open Rate**: Monitor email open rates
- **Click Rate**: Track link clicks in emails
- **Bounce Rate**: Monitor failed deliveries

### SMS Metrics
- **Delivery Rate**: Track successful SMS deliveries
- **Response Rate**: Monitor user responses
- **Error Rate**: Track failed SMS deliveries

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP credentials
   - Verify email server settings
   - Check firewall/network settings

2. **SMS Not Sending**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient Twilio credits

3. **Template Errors**
   - Check template syntax
   - Verify context variables
   - Test with sample data

### Debug Mode

Enable debug logging:

```javascript
// In your environment
NODE_ENV=development

// In your code
console.log('Notification debug:', {
  template,
  context,
  recipient
});
```

## Future Enhancements

### Planned Features
- **Push Notifications**: Mobile app notifications
- **In-App Notifications**: Real-time notifications
- **Notification Preferences**: User-customizable settings
- **Advanced Templates**: Dynamic content generation
- **Analytics Dashboard**: Notification performance metrics

### Integration Opportunities
- **Slack Integration**: Admin notifications to Slack
- **Webhook Support**: Third-party integrations
- **Multi-language Support**: Internationalization
- **Template Editor**: Visual template builder

## Support

For technical support with the notification system:

- **Email**: support@verifiedtutors.com
- **Documentation**: This README and inline code comments
- **Logs**: Check application logs for detailed error information

---

*This notification system provides a robust foundation for user communication and engagement in the VerifiedTutors platform.* 