import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTutor, TutorProfile, TutorReview } from '../contexts/TutorContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Star, MapPin, BookOpen, GraduationCap, Briefcase, FileText, User, Clock, Video, Home, Users, MessageCircle, Calendar, CheckCircle, Phone, Mail, AlertCircle, X, Eye } from 'lucide-react';
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
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-white shadow-xl transform hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-primary-500 to-primary-600">
                {profile.user.profileImage ? (
                  <img
                    src={profile.user.profileImage}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl text-white font-semibold">
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

            {/* Teaching Mediums */}
            {profile.teachingMediums && profile.teachingMediums.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">Teaching Mediums</h2>
                <div className="flex flex-wrap gap-3">
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
                        className="flex items-center px-4 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-700"
                      >
                        <span className="mr-2">{mediumInfo.flag}</span>
                        {mediumInfo.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {profile.socialMedia && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">Social Media</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.socialMedia.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialMedia.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center p-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                      </svg>
                      @{profile.socialMedia.linkedin}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {profile.documents && profile.documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900">Documents</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-md transition-all duration-200">
                      <FileText className="w-6 h-6 text-primary-600 mr-3" />
                      <span className="text-gray-700">Document {index + 1}</span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

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