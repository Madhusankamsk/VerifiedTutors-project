# VerifiedTutors

A platform for connecting students with verified tutors.

## Project Overview

VerifiedTutors is a full-stack application built with:
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB

## Deploying to Vercel

This project is configured for deployment as a single application on Vercel, with both frontend and backend components.

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database
3. [Cloudinary](https://cloudinary.com) account for image storage (optional)

### Environment Variables

Create the following environment variables in your Vercel project settings:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=https://your-vercel-url.vercel.app/api/auth/google/callback
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Deployment Steps

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Configure the environment variables
4. Deploy!

Vercel will automatically:
1. Install dependencies
2. Build the frontend (React/TypeScript)
3. Set up the serverless API functions
4. Deploy everything to a global CDN

### Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:5173 and will proxy API requests to the backend.

## Project Structure

```
/
├── src/                  # Frontend React application
├── backend/              # Backend Express application
├── dist/                 # Built frontend (generated)
│   └── api/              # Serverless API functions (generated)
├── scripts/              # Build scripts
└── vercel.json           # Vercel configuration
```

## License

[MIT](LICENSE)

## Enhanced Booking System

The booking system has been completely redesigned to provide a comprehensive booking experience with the following features:

### 🎯 Key Features

#### 1. **Duration Selection**
- Choose from 1, 2, or 3-hour sessions
- Dynamic pricing based on duration
- Smart time slot filtering based on selected duration

#### 2. **Available Topics Selection**
- View tutor's available topics for the selected subject
- Optional topic selection for focused learning
- Topics are displayed with descriptions where available

#### 3. **Learning Methods**
- **Online**: Video call sessions
- **Home Visit**: Tutor visits student's location
- **Group**: Group learning sessions
- Method availability based on tutor preferences

#### 4. **Time Slot Management**
- View available time slots for each day
- Slots filtered by duration to ensure adequate time
- Visual feedback for unavailable slots

#### 5. **Smart Pricing**
- Real-time price calculation based on duration and learning method
- Price breakdown showing hourly rate × duration
- Support for both new teaching modes and legacy rates

#### 6. **Enhanced Booking Modal**
- Clean, modern UI with better UX
- Step-by-step booking process
- Real-time validation and feedback
- Mobile-responsive design

### 📋 Booking Process

1. **Select Subject** (if tutor teaches multiple subjects)
2. **Choose Available Topics** (optional, for focused learning)
3. **Select Duration** (1h, 2h, or 3h)
4. **Choose Learning Method** (Online, Home Visit, or Group)
5. **Pick a Day** (shows availability)
6. **Select Time Slot** (filtered by duration)
7. **Enter Contact Number**
8. **Review Price Summary**
9. **Submit Booking**

### 🛠 Technical Implementation

#### Frontend (React + TypeScript)
```typescript
// Enhanced BookingModal with new features
interface BookingModalProps {
  subjects?: Subject[];
  tutorName?: string;
  onSubmit: (data: {
    subject: string;
    topics: string[];
    duration: 1 | 2 | 3;
    learningMethod: 'online' | 'home-visit' | 'group';
    totalPrice: number;
    // ... other fields
  }) => void;
}
```

#### Backend (Node.js + MongoDB)
```javascript
// Enhanced Booking Model
const bookingSchema = new mongoose.Schema({
  selectedTopics: [{ type: ObjectId, ref: 'Topic' }],
  duration: { type: Number, required: true, min: 1, max: 8 },
  learningMethod: { 
    type: String, 
    enum: ['online', 'individual', 'group'],
    required: true 
  },
  contactNumber: { type: String, required: true },
  // ... other fields
});
```

### 🎨 UI/UX Enhancements

- **Modern Design**: Clean, card-based layout with proper spacing
- **Visual Feedback**: Icons for different learning methods and states
- **Responsive**: Works perfectly on mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Smooth transitions and loading indicators

### 💡 Usage Example

```typescript
// In TutorProfilePage.tsx
const handleBookingSubmit = async (data) => {
  await createBooking({
    tutorId: id,
    subjectId: selectedSubject._id,
    startTime: calculatedStartTime,
    endTime: calculatedEndTime, // startTime + duration
    duration: data.duration,
    learningMethod: data.learningMethod,
    selectedTopics: data.topics,
    contactNumber: data.contactNumber,
    notes: formattedNotes
  });
};
```

### 🔧 API Endpoints

#### Create Booking
```http
POST /api/students/bookings
Content-Type: application/json

{
  "tutorId": "tutor_id",
  "subjectId": "subject_id",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "duration": 2,
  "learningMethod": "online",
  "selectedTopics": ["topic_id_1", "topic_id_2"],
  "contactNumber": "+1234567890",
  "notes": "Additional notes"
}
```

#### Get Student Bookings
```http
GET /api/students/bookings?status=all&page=1&limit=10
```

### 📱 Mobile Experience

The booking modal is fully responsive and provides an excellent mobile experience:
- Touch-friendly buttons and inputs
- Optimized layout for small screens
- Smooth scrolling and navigation
- Proper input types for mobile keyboards

### 🚀 Future Enhancements

- **Calendar Integration**: Sync with Google Calendar, Outlook
- **Video Call Integration**: Built-in video calling
- **Payment Gateway**: Integrated payment processing
- **Notifications**: Real-time booking updates
- **Recurring Bookings**: Schedule regular sessions
- **Booking Templates**: Save preferred booking settings

---

## Installation & Setup

[Rest of existing README content...] 