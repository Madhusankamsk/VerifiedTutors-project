import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutor, TutorProfile } from '../contexts/TutorContext';
import { useAuth } from '../contexts/AuthContext';
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
  TutorProfileSidebar,
  TutorReviewForm
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
    addReview,
    createBooking
  } = useTutor();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedSubjectForBooking, setSelectedSubjectForBooking] = useState<string>('');

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
    day: string; 
    timeSlot: string; 
    contactNumber: string; 
    learningMethod: 'online' | 'individual' | 'group' 
  }) => {
    if (!id || !profile) return;
    
    try {
      const selectedSubject = profile.subjects.find(s => s.subject.name === data.subject);
      if (!selectedSubject) {
        toast.error('Selected subject not found');
        return;
      }

      const selectedSubjectForBooking = selectedSubject.subject._id;
      
      // Parse time slot
      const [startTime, endTime] = data.timeSlot.split(' - ');
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      // Parse date
      const bookingDate = new Date(data.day);
      
      const startTimeObj = new Date(bookingDate);
      startTimeObj.setHours(startHours, startMinutes, 0, 0);
      
      const endTimeObj = new Date(bookingDate);
      endTimeObj.setHours(endHours, endMinutes, 0, 0);
      
      // Get the rate based on learning method
      const rates = getRatesFromTeachingModes(selectedSubject.teachingModes);
      const rate = rates[data.learningMethod];
      
      // Create booking
      await createBooking({
        tutorId: id,
        subjectId: selectedSubjectForBooking,
        startTime: startTimeObj,
        endTime: endTimeObj,
        notes: `Contact number: ${data.contactNumber}`,
        learningMethod: data.learningMethod
      });
      
      toast.success(`Session for ${selectedSubject.subject.name} booked successfully!`);
      setShowBookingModal(false);
      
      // Redirect to student bookings page
      navigate('/student/bookings');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book session. Please try again.');
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.info('Please login to write a review');
      navigate('/login', { state: { from: `/tutors/${id}` } });
      return;
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id) return;
    
    try {
      await addReview(id, rating, comment);
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      
      // Refresh profile and reviews
      const tutorProfile = await fetchTutorById(id);
      setProfile(tutorProfile);
      await fetchReviews(id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
      console.error('Review submission error:', error);
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
    }
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutor Not Found</h3>
            <p className="text-gray-600 text-sm mb-4">The tutor profile you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/tutors')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Tutors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TutorProfileBackground>
      {/* Breadcrumb Navigation */}
      <TutorProfileBreadcrumb tutorName={profile.user.name} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8">
        {/* Header Section */}
        <TutorProfileHeader profile={profile} />
        
        {/* Tabs Navigation */}
        <TutorProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBookSession={handleBookSession}
          onWriteReview={handleWriteReview}
        />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Tab Content */}
            {activeTab === 'about' && <TutorProfileAbout profile={profile} />}
            {activeTab === 'subjects' && <TutorProfileSubjects profile={profile} />}
            {activeTab === 'education' && <TutorProfileEducation profile={profile} />}
            {activeTab === 'experience' && <TutorProfileExperience profile={profile} />}
            {activeTab === 'reviews' && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                <ReviewList
                  reviews={mappedReviews}
                  averageRating={profile.rating}
                  totalReviews={profile.totalReviews}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <TutorProfileSidebar profile={profile} />
        </div>
      </div>

      {/* Review Form Modal */}
      <TutorReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleSubmitReview}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSubmit={handleBookingSubmit}
        tutorAvailability={{
          subject: profile.subjects[0].subject.name,
          availability: profile.subjects[0].availability.reduce((acc, day) => {
            acc[day.day] = day.slots;
            return acc;
          }, {} as { [key: string]: { start: string; end: string; }[] })
        }}
        selectedSubject={profile.subjects[0].subject.name}
        availableMethods={{
          online: getRatesFromTeachingModes(profile.subjects[0].teachingModes).online > 0,
          individual: getRatesFromTeachingModes(profile.subjects[0].teachingModes).individual > 0,
          group: getRatesFromTeachingModes(profile.subjects[0].teachingModes).group > 0
        }}
        subjects={profile.subjects.map(subject => ({
          _id: subject.subject._id,
          name: subject.subject.name,
          rates: getRatesFromTeachingModes(subject.teachingModes),
          availability: subject.availability
        }))}
      />
    </TutorProfileBackground>
  );
};

export default TutorProfilePage; 