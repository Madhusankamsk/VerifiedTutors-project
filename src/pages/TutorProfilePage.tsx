import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutor, TutorProfile, TutorReview } from '../contexts/TutorContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Star, MapPin, BookOpen, GraduationCap, Briefcase, FileText, User, Clock, Video, Home, Users, MessageCircle, Calendar, CheckCircle, Phone, Mail, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { ReviewList } from '../components/ReviewList';
import { Rating } from '../components/Rating';

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
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!id) return;
      try {
        const tutorProfile = await fetchTutorById(id);
        setProfile(tutorProfile);
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
    navigate(`/booking/${id}`);
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
      await addReview(id, reviewData.rating, reviewData.comment);
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      // Refresh profile and reviews
      const tutorProfile = await fetchTutorById(id);
      setProfile(tutorProfile);
      await fetchReviews(id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      if (error.response?.data?.existingRating) {
        toast.error('You have already reviewed this tutor');
        setShowReviewForm(false);
      } else {
        toast.error(errorMessage);
      }
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Tutor Not Found</h2>
          <p className="text-gray-600 mb-4">The tutor profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tutors')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Browse Tutors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 sm:pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-10">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-xl transform hover:scale-105 transition-transform duration-300">
                {profile.user.profileImage ? (
                  <img
                    src={profile.user.profileImage}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl text-primary-600 font-semibold">
                      {profile.user.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1.5 shadow-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
                {profile.user.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-primary-100 ml-1">({profile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Users className="h-5 w-5 text-primary-100 mr-2" />
                  <span>{profile.totalStudents} students</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary-100 mr-2" />
                  <span>{profile.locations.map(loc => loc.name).join(', ')}</span>
                </div>
              </div>
              <p className="text-primary-100 text-lg sm:text-xl max-w-3xl leading-relaxed">{profile.bio}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </div>

            {/* Subjects & Rates */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Subjects & Rates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {profile.subjects.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-200">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">{subject.subject.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 text-primary-500 mr-2" />
                          <span className="text-gray-600">Online</span>
                        </div>
                        <span className="font-semibold text-primary-600">${subject.rates.online}/hr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 text-primary-500 mr-2" />
                          <span className="text-gray-600">Home Visit</span>
                        </div>
                        <span className="font-semibold text-primary-600">${subject.rates.individual}/hr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-primary-500 mr-2" />
                          <span className="text-gray-600">Group</span>
                        </div>
                        <span className="font-semibold text-primary-600">${subject.rates.group}/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Education</h2>
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <GraduationCap className="h-5 w-5 text-primary-600 mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Experience</h2>
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <Briefcase className="h-5 w-5 text-primary-600 mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{exp.position}</h3>
                      <p className="text-gray-600">{exp.institution}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      <p className="text-gray-600 mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewList
              reviews={mappedReviews}
              averageRating={profile.rating}
              totalReviews={profile.totalReviews}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Phone className="h-5 w-5 text-primary-500 mr-3" />
                  <span className="text-gray-600">{profile.phone}</span>
                </div>
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Mail className="h-5 w-5 text-primary-500 mr-3" />
                  <span className="text-gray-600">{profile.user.email}</span>
                </div>
                <button 
                  onClick={handleBookSession}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contact Tutor
                </button>
              </div>
            </div>

            {/* Teaching Locations */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Teaching Locations</h2>
              <div className="flex flex-wrap gap-2">
                {profile.locations.map((location, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors duration-200"
                  >
                    {location.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Documents */}
            {profile.documents && profile.documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Documents</h2>
                <div className="space-y-3">
                  {profile.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      <span className="font-medium">{doc.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Book a Session */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Book a Session</h2>
              {!isAuthenticated && (
                <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-xl flex items-start">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Please login to book a session with this tutor.</p>
                </div>
              )}
              <button 
                onClick={handleBookSession}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                {isAuthenticated ? 'Schedule Now' : 'Login to Book'}
              </button>
            </div>

            {/* Write a Review */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900">Write a Review</h2>
              {!isAuthenticated && (
                <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-xl flex items-start">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Please login to write a review for this tutor.</p>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleWriteReview}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  Write a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating
                </label>
                <Rating
                  rating={reviewData.rating}
                  size="lg"
                  onChange={(newRating) => setReviewData({ ...reviewData, rating: newRating })}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  placeholder="Share your experience with this tutor..."
                  required
                  minLength={10}
                />
                {reviewData.comment.length > 0 && reviewData.comment.length < 10 && (
                  <p className="mt-2 text-sm text-red-600">
                    Comment must be at least 10 characters long
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewData.rating < 1 || reviewData.comment.length < 10}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfilePage;