import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { createBooking } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { User, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { ReviewList } from '../components/ReviewList';
import BookingModal from '../components/booking/BookingModal';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { getRatesFromTeachingModes } from '../utils/tutorUtils';

// Import the new components
import {
  TutorProfileBackground,
  TutorProfileBreadcrumb,
  TutorProfileHeader,
  TutorProfileTabs,
  TutorProfileAbout,
  TutorProfileSubjects,
  TutorProfileEducation,
  TutorProfileExperience,
  TutorProfileSidebar
} from '../components/tutor-profile';

const TutorProfilePage: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { 
    fetchTutorById, 
    loading, 
    error,
    reviews,
    fetchReviews,
    createBooking
  } = useTutor();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedSubjectForBooking, setSelectedSubjectForBooking] = useState<string>('');
  const { addNotification } = useNotifications();

  // Scroll to top when tutor ID changes
  useScrollToTop([id]);

  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!id) return;
      try {
        const tutorProfile = await fetchTutorById(id);
        setProfile(tutorProfile);
        console.log('tutorProfile', tutorProfile);
        await fetchReviews(id);
      } catch (err) {
        console.error('Failed to load tutor profile:', err);
        toast.error('Failed to load tutor profile. Please try again later.');
      }
    };

    loadTutorProfile();
  }, [id, fetchTutorById, fetchReviews]);

  const handleBookSession = () => {
    if (!isAuthenticated) {
      toast.info('Please login to book a session');
      navigate('/login', { state: { from: `/tutors/${id}` } });
      return;
    }
    
    // Set the default selected subject for booking
    if (profile && profile.subjects.length > 0) {
      setSelectedSubjectForBooking(profile.subjects[0].subject._id);
    }
    
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (data: { 
    subject: string;
    topics: string[];
    day: string; 
    timeSlot: string; 
    duration: 1 | 2 | 3;
    contactNumber: string; 
    learningMethod: 'online' | 'home-visit' | 'group';
    totalPrice: number;
  }) => {
    if (!id || !profile) return;
    
    try {
      const selectedSubject = profile.subjects.find(s => s.subject.name === data.subject);
      if (!selectedSubject) {
        toast.error('Selected subject not found');
        return;
      }

      const selectedSubjectForBooking = selectedSubject.subject._id;
      
      // Parse time slot to get start time
      const [startTime] = data.timeSlot.split(' - ');
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      
      // Create start and end times based on duration
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7); // Set to next week for booking
      
      // Find the selected day in the next week
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(data.day);
      const currentDayIndex = today.getDay();
      
      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Schedule for next week
      }
      
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() + daysToAdd);
      
      const startTimeObj = new Date(bookingDate);
      startTimeObj.setHours(startHours, startMinutes, 0, 0);
      
      const endTimeObj = new Date(startTimeObj);
      endTimeObj.setHours(startTimeObj.getHours() + data.duration); // Add duration
      
      // Prepare notes with contact number and selected topics
      let notes = `Contact number: ${data.contactNumber}`;
      if (data.topics.length > 0) {
        // Get topic names from the selected subject
        const topicNames = data.topics.map(topicId => {
          const topic = selectedSubject.selectedTopics.find(t => {
            // Handle both populated topic objects and string IDs
            if (typeof t === 'string') {
              return t === topicId;
            } else {
              return t._id === topicId;
            }
          });
          if (topic) {
            return typeof topic === 'string' ? topic : topic.name;
          }
          return topicId;
        });
        notes += `\nSelected topics: ${topicNames.join(', ')}`;
      }
      notes += `\nDuration: ${data.duration} hour${data.duration > 1 ? 's' : ''}`;
      notes += `\nTotal price: Rs. ${data.totalPrice}`;
      notes += `\nLearning method: ${data.learningMethod}`;
      
      // Map learning method to backend compatible format
      const backendLearningMethod = data.learningMethod === 'home-visit' ? 'individual' : data.learningMethod;
      
      // Create booking
      const bookingResult = await createBooking({
        tutorId: id,
        subjectId: selectedSubjectForBooking,
        startTime: startTimeObj,
        endTime: endTimeObj,
        notes,
        learningMethod: backendLearningMethod as 'online' | 'individual' | 'group',
        contactNumber: data.contactNumber,
        selectedTopics: data.topics,
        duration: data.duration
      });
      
      // Add notification for successful booking
      addNotification({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Your ${data.duration}-hour session for ${selectedSubject.subject.name} has been booked successfully.`,
        action: {
          label: 'View Bookings',
          url: '/student/bookings'
        }
      });
      
      toast.success(`${data.duration}-hour session for ${selectedSubject.subject.name} booked successfully!`);
      setShowBookingModal(false);
      
      // Redirect to student bookings page
      navigate('/student/bookings');
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Add error notification
      addNotification({
        type: 'error',
        title: 'Booking Failed',
        message: error.response?.data?.message || 'Failed to book session. Please try again.',
      });
      
      toast.error(error.response?.data?.message || 'Failed to book session. Please try again.');
    }
  };

  const mappedReviews = reviews.map(review => ({
    id: review._id,
    rating: review.rating,
    comment: review.review,
    createdAt: review.createdAt,
    user: {
      name: review.student.name,
      profileImage: review.student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.student.name)}`
    },
    subject: review.subject,
    topics: review.topics || []
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 px-4">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 px-4">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutor Not Found</h3>
              <p className="text-gray-600 text-sm mb-4">The tutor profile you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/tutors')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Tutors
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-8000"></div>

      <div className="relative z-10">
        {/* Breadcrumb Navigation */}
        <TutorProfileBreadcrumb tutorName={profile.user.name} />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8 lg:pb-12">
          {/* Header Section */}
          <TutorProfileHeader profile={profile} onBookSession={handleBookSession} />
          
          {/* Tabs Navigation */}
          <TutorProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main Content Area - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Tab Content */}
              {activeTab === 'about' && <TutorProfileAbout profile={profile} />}
              {activeTab === 'subjects' && <TutorProfileSubjects profile={profile} />}
              {activeTab === 'education' && <TutorProfileEducation profile={profile} />}
              {activeTab === 'experience' && <TutorProfileExperience profile={profile} />}
              {activeTab === 'reviews' && (
                <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                  <ReviewList
                    reviews={mappedReviews}
                    averageRating={profile.rating}
                    totalReviews={profile.totalReviews}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="order-first lg:order-last">
              <TutorProfileSidebar profile={profile} />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal - Rendered outside main content */}
      {showBookingModal && profile && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
          tutorAvailability={{
            subject: profile!.subjects[0]?.subject.name || '',
            availability: profile!.subjects[0]?.availability?.reduce((acc, avail) => {
              acc[avail.day] = avail.slots || [];
              return acc;
            }, {} as { [key: string]: { start: string; end: string; }[] }) || {}
          }}
          selectedSubject={selectedSubjectForBooking}
          availableMethods={{
            online: profile!.subjects[0]?.teachingModes?.some(mode => mode.type === 'online' && mode.enabled) || false,
            'home-visit': profile!.subjects[0]?.teachingModes?.some(mode => mode.type === 'home-visit' && mode.enabled) || false
          }}
          subjects={profile!.subjects.map(subj => ({
            _id: subj.subject._id,
            name: subj.subject.name,
            selectedTopics: (subj.selectedTopics || []).map(topic => {
              // Handle both populated topic objects and string IDs
              if (typeof topic === 'string') {
                return {
                  _id: topic,
                  name: topic, // Fallback to ID if not populated
                  description: ''
                };
              } else {
                return {
                  _id: topic._id,
                  name: topic.name,
                  description: topic.description || ''
                };
              }
            }),
              teachingModes: (subj.teachingModes || []).filter(mode => mode.type !== 'group') as { type: 'online' | 'home-visit'; rate: number; enabled: boolean; }[],
            availability: subj.availability || [],
            rates: subj.rates
          }))}
          tutorName={profile!.user.name}
        />
      )}
    </div>
  );
};

export default TutorProfilePage; 