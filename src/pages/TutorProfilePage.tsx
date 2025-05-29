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
        await fetchReviews();
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
      await fetchReviews();
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
    comment: review.comment,
    createdAt: review.createdAt,
    user: {
      name: review.studentName,
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.studentName)}`
    }
  }));

  if (loading) {
    return (
        <div className=" bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tutor Not Found</h2>
          <p className="text-gray-600">The tutor profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tutors')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Tutors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {profile.user.profileImage ? (
                  <img
                    src={profile.user.profileImage}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-4xl text-blue-600 font-semibold">
                      {profile.user.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.user.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-blue-100 ml-1">({profile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-100 mr-1" />
                  <span>{profile.totalStudents} students</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-100 mr-1" />
                  <span>{profile.locations.map(loc => loc.name).join(', ')}</span>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-3xl">{profile.bio}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
            </div>

            {/* Subjects & Rates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Subjects & Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.subjects.map((subject, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{subject.subject.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Online</span>
                        </div>
                        <span className="font-medium">${subject.rates.online}/hr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Home Visit</span>
                        </div>
                        <span className="font-medium">${subject.rates.individual}/hr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Group</span>
                        </div>
                        <span className="font-medium">${subject.rates.group}/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex items-start">
                    <GraduationCap className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Experience</h2>
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="flex items-start">
                    <Briefcase className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">{exp.position}</h3>
                      <p className="text-gray-600">{exp.institution}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      <p className="text-gray-600 mt-1">{exp.description}</p>
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
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{profile.user.email}</span>
                </div>
                <button 
                  onClick={handleBookSession}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Tutor
                </button>
              </div>
            </div>

            {/* Teaching Locations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Teaching Locations</h2>
              <div className="flex flex-wrap gap-2">
                {profile.locations.map((location, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {location.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Documents */}
            {profile.documents && profile.documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold mb-4">Documents</h2>
                <div className="space-y-2">
                  {profile.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      <span>{doc.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Book a Session */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Book a Session</h2>
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Please login to book a session with this tutor.</p>
                </div>
              )}
              <button 
                onClick={handleBookSession}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                {isAuthenticated ? 'Schedule Now' : 'Login to Book'}
              </button>
            </div>

            {/* Write a Review */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Write a Review</h2>
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Please login to write a review for this tutor.</p>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleWriteReview}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
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
              <div className="mb-4">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewData.rating < 1 || reviewData.comment.length < 10}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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