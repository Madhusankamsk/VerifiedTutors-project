import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { Calendar, Clock, DollarSign, User, Book, ChevronLeft, ChevronRight, Filter, Search, Video, Home, Users, Hash, Phone, Star, Check, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import BookingReviewForm from '../../components/booking/BookingReviewForm';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useNotifications } from '../../contexts/NotificationContext';
import TutorReviewForm from '../../components/tutor-profile/TutorReviewForm';

const StudentBookings = () => {
  const { bookings, loading, error, fetchBookings } = useStudent();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingReviews, setBookingReviews] = useState<{[key: string]: any}>({});
  const { addNotification } = useNotifications();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLearningMethodIcon = (method: string) => {
    switch (method) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'individual':
        return <Home className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getLearningMethodLabel = (method: string) => {
    switch (method) {
      case 'online':
        return 'Online';
      case 'individual':
        return 'Home Visit';
      case 'group':
        return 'Group';
      default:
        return 'Online';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    return `${duration} hour${duration > 1 ? 's' : ''}`;
  };

  // Check if a booking has a review
  const checkBookingReview = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/ratings/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No review exists
      }
      console.error('Error checking booking review:', error);
      return null;
    }
  };

  // Load reviews for completed bookings
  const loadBookingReviews = async () => {
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    const reviews: {[key: string]: any} = {};
    
    for (const booking of completedBookings) {
      const review = await checkBookingReview(booking._id);
      if (review) {
        reviews[booking._id] = review;
      }
    }
    
    setBookingReviews(reviews);
  };

  useEffect(() => {
    if (bookings.length > 0) {
      loadBookingReviews();
    }
  }, [bookings]);

  const handleReviewClick = (booking: any) => {
    setSelectedBooking(booking);
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (rating: number, review: string) => {
    if (!selectedBooking) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/ratings`,
        { 
          bookingId: selectedBooking._id, 
          rating, 
          review
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Review Submitted',
          message: 'Your review has been submitted successfully!'
        });

        // Close the review modal
        setShowReviewForm(false);
        setSelectedBooking(null);

        // Refresh bookings to show the new review
        await fetchBookings();
        await loadBookingReviews();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Review Submission Failed',
        message: error.response?.data?.message || 'Failed to submit review. Please try again.'
      });
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchBookings}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="relative">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          My Bookings
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <div className="flex justify-center mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't booked any sessions yet.
            </p>
            <Link 
              to="/tutors"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
            >
              Find a Tutor
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition hover:shadow-lg">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      {booking.subject?.name || 'Unnamed Subject'}
                    </h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tutor</p>
                      <p className="font-medium text-gray-800">
                        {booking.tutor?.user?.name || 'Unknown Tutor'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Start Time</p>
                      <p className="font-medium text-gray-800">{formatDate(booking.startTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-800">{formatDuration(booking.duration)}</p>
                    </div>
                  </div>

                  {booking.learningMethod && (
                    <div className="flex items-start">
                      {getLearningMethodIcon(booking.learningMethod)}
                      <div className="ml-2">
                        <p className="text-sm text-gray-500">Learning Method</p>
                        <p className="font-medium text-gray-800">{getLearningMethodLabel(booking.learningMethod)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-800">Rs. {booking.amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Book className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className="font-medium text-gray-800">
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </p>
                    </div>
                  </div>

                  {booking.contactNumber && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium text-gray-800">{booking.contactNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Topics */}
                {booking.selectedTopics && booking.selectedTopics.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">Selected Topics</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.selectedTopics.map((topic) => (
                        <span 
                          key={topic._id}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Notes:</p>
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                )}

                {booking.meetingLink && (
                  <div className="mt-4">
                    <a 
                      href={booking.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
                    >
                      Join Session
                    </a>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="mt-4">
                    {bookingReviews[booking._id] ? (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => handleReviewClick(booking)}
                        title="Click to edit your review"
                      >
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Review Submitted</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < bookingReviews[booking._id].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">
                            {bookingReviews[booking._id].rating}/5
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">(Click to edit)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReviewClick(booking)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-flex items-center"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showReviewForm && selectedBooking && (
        <BookingReviewForm
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
          subject={selectedBooking.subject}
          topics={selectedBooking.selectedTopics || []}
          tutorName={selectedBooking.tutor?.user?.name || 'Unknown Tutor'}
          existingReview={bookingReviews[selectedBooking._id] ? {
            rating: bookingReviews[selectedBooking._id].rating,
            review: bookingReviews[selectedBooking._id].review
          } : undefined}
        />
      )}
    </div>
  );
};

export default StudentBookings; 