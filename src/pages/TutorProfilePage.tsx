import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutor, TutorProfile, TutorReview } from '../contexts/TutorContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Star, MapPin, BookOpen, GraduationCap, Briefcase, FileText, User, Clock, Video, Home, Users, MessageCircle, Calendar, CheckCircle, Phone, Mail, AlertCircle, X, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { ReviewList } from '../components/ReviewList';
import { Rating } from '../components/Rating';
import BookingModal from '../components/booking/BookingModal';

const TutorProfilePage: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { 
    fetchTutorById, 
    loading, 
    error,
    reviews,
    fetchReviews,
    addReview
  } = useTutor();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [activeTab, setActiveTab] = useState('about');
  const [selectedSubjectForBooking, setSelectedSubjectForBooking] = useState<string>('');

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

  const handleBookingSubmit = (data: { 
    subject: string;
    day: string; 
    timeSlot: string; 
    contactNumber: string; 
    learningMethod: 'online' | 'individual' | 'group' 
  }) => {
    // Here you would typically make an API call to create the booking
    console.log('Booking submitted:', data);
    toast.success(`Session for ${data.subject} booked successfully!`);
    setShowBookingModal(false);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.info('Please login to write a review');
      navigate('/login', { state: { from: `/tutors/${id}` } });
      return;
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const response = await addReview(id, reviewData.rating, reviewData.comment);
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Tutor Not Found</h2>
          <p className="text-gray-600 mb-4">The tutor profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tutors')}
            className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all duration-200"
          >
            Browse Tutors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Section - modernized with gradient background */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image - enhanced */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                {profile.user.profileImage ? (
                  <img
                    src={profile.user.profileImage}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-white font-bold">
                      {profile.user.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1.5 shadow-md border-2 border-white">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info - improved typography and layout */}
            <div className="flex-1 text-center md:text-left pt-4">
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                  {profile.user.name}
                </h1>
                {profile.isVerified && (
                  <span className="mt-2 md:mt-0 md:ml-3 px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-100 rounded-full shadow-sm">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 my-4 text-gray-600">
                <div className="flex items-center text-base">
                  <Star className="h-5 w-5 text-yellow-500 mr-1.5" />
                  <span className="font-semibold text-gray-800">{profile.rating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({profile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center text-base">
                  <Users className="h-5 w-5 text-gray-500 mr-1.5" />
                  <span>{profile.totalStudents} students</span>
                </div>
                <div className="flex items-center text-base">
                  <MapPin className="h-5 w-5 text-gray-500 mr-1.5" />
                  <span>{profile.locations.map(loc => loc.name).join(', ')}</span>
                </div>
              </div>
              <p className="text-gray-700 text-base leading-relaxed max-w-2xl mx-auto md:mx-0">
                {profile.bio.split('.')[0]}.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-2">
            <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
              <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'about' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => setActiveTab('subjects')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'subjects' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Subjects & Rates
              </button>
              <button 
                onClick={() => setActiveTab('education')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'education' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Education
              </button>
              <button 
                onClick={() => setActiveTab('experience')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'experience' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Experience
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'reviews' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Reviews
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button 
                onClick={handleBookSession}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors"
              >
                Book Session
              </button>
              <button 
                onClick={handleWriteReview}
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Write Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* About Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">About</h2>
                  <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
                </div>

                {/* Teaching Mediums */}
                {profile.teachingMediums && profile.teachingMediums.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Teaching Mediums</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.teachingMediums.map((medium) => {
                        const mediumMap = {
                          english: { name: 'English', flag: '🇬🇧' },
                          sinhala: { name: 'Sinhala', flag: '🇱🇰' },
                          tamil: { name: 'Tamil', flag: '🇱🇰' }
                        } as const;
                        
                        const mediumInfo = mediumMap[medium as keyof typeof mediumMap] || { name: medium, flag: '🌐' };
                        
                        return (
                          <div
                            key={medium}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                          >
                            <span className="mr-1">{mediumInfo.flag}</span>
                            {mediumInfo.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Teaching Locations */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Teaching Locations</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.locations.map((location, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {location.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Media Links */}
                {profile.socialMedia && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Social Media</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.socialMedia.instagram && (
                        <a
                          href={`https://instagram.com/${profile.socialMedia.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          @{profile.socialMedia.instagram}
                        </a>
                      )}
                      {profile.socialMedia.youtube && (
                        <a
                          href={`https://youtube.com/${profile.socialMedia.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                          @{profile.socialMedia.youtube}
                        </a>
                      )}
                      {profile.socialMedia.facebook && (
                        <a
                          href={`https://facebook.com/${profile.socialMedia.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                          </svg>
                          @{profile.socialMedia.facebook}
                        </a>
                      )}
                      {profile.socialMedia.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${profile.socialMedia.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-3 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                          </svg>
                          @{profile.socialMedia.linkedin}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subjects & Rates Tab */}
            {activeTab === 'subjects' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Subjects & Rates</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {profile.subjects.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                      <h3 className="font-medium text-lg mb-3 text-gray-900">{subject.subject.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Video className="h-4 w-4 text-primary-500 mr-2" />
                            <span className="text-sm text-gray-600">Online</span>
                          </div>
                          <span className="font-medium text-primary-600">${subject.rates.online}/hr</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Home className="h-4 w-4 text-primary-500 mr-2" />
                            <span className="text-sm text-gray-600">Home Visit</span>
                          </div>
                          <span className="font-medium text-primary-600">${subject.rates.individual}/hr</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-primary-500 mr-2" />
                            <span className="text-sm text-gray-600">Group</span>
                          </div>
                          <span className="font-medium text-primary-600">${subject.rates.group}/hr</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Education</h2>
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <GraduationCap className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Experience</h2>
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Briefcase className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                        <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <ReviewList
                  reviews={mappedReviews}
                  averageRating={profile.rating}
                  totalReviews={profile.totalReviews}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4 text-gray-900">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-gray-600 text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-gray-600 text-sm">{profile.user.email}</span>
                </div>
              </div>
              {/* <div className="mt-4 space-y-3">
                <button 
                  onClick={handleBookSession}
                  className="w-full py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Book a Session
                </button>
                <button
                  onClick={handleWriteReview}
                  className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <Star className="h-4 w-4" />
                  Write a Review
                </button>
              </div> */}
            </div>

            {/* Availability Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4 text-gray-900">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Teaching Experience</span>
                  <span className="font-medium text-gray-900">{profile.experience.length > 0 ? `${profile.experience.length} years` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Students Taught</span>
                  <span className="font-medium text-gray-900">{profile.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Average Rating</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-1">{profile.rating.toFixed(1)}</span>
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Subjects</span>
                  <span className="font-medium text-gray-900">{profile.subjects.length}</span>
                </div>
              </div>
            </div>

            {/* Other Tutors You May Like */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4 text-gray-900">Verification Status</h2>
              <div className={`flex items-center p-3 rounded-lg ${profile.isVerified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                {profile.isVerified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-green-700">Verified Tutor</p>
                      <p className="text-sm text-green-600">This tutor has been verified by our team</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-700">Verification Pending</p>
                      <p className="text-sm text-yellow-600">This tutor is in the process of being verified</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <Rating
                  rating={reviewData.rating}
                  size="lg"
                  onChange={(newRating) => setReviewData({ ...reviewData, rating: newRating })}
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  placeholder="Share your experience with this tutor..."
                  required
                  minLength={10}
                />
                {reviewData.comment.length > 0 && reviewData.comment.length < 10 && (
                  <p className="mt-1 text-sm text-red-600">
                    Comment must be at least 10 characters long
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewData.rating < 1 || reviewData.comment.length < 10}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          online: profile.subjects[0].rates.online > 0,
          individual: profile.subjects[0].rates.individual > 0,
          group: profile.subjects[0].rates.group > 0
        }}
        subjects={profile.subjects.map(subject => ({
          _id: subject.subject._id,
          name: subject.subject.name,
          rates: subject.rates,
          availability: subject.availability
        }))}
      />
    </div>
  );
};

export default TutorProfilePage;