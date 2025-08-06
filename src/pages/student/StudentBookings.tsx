import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Book,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Video,
  Home,
  Users,
  Hash,
  Phone,
  Star,
  Check,
  MessageSquare,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import BookingReviewForm from '../../components/booking/BookingReviewForm';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'react-toastify';

const StudentBookings = () => {
  const { bookings, loading, error, fetchBookings } = useStudent();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingReviews, setBookingReviews] = useState<{ [key: string]: any }>(
    {}
  );
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
      const response = await axios.get(
        `${API_URL}/api/ratings/booking/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No review exists
      }

      console.error('Error checking booking review:', error);
      toast.error('Error checking booking review.');
      return null;
    }
  };

  // Load reviews for completed bookings
  const loadBookingReviews = async () => {
    const completedBookings = bookings.filter(
      (booking) => booking.status === 'completed'
    );
    const reviews: { [key: string]: any } = {};

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
          review,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Review Submitted',
          message: 'Your review has been submitted successfully!',
        });

        toast.success('Your review has been submitted successfully.');

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
        message:
          error.response?.data?.message ||
          'Failed to submit review. Please try again.',
      });

      toast.error('Failed to submit review. Please try again.');
    }
  };

  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10"></div>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          My Bookings
        </h1>
        <p className="text-gray-600">
          Manage and track all your tutoring sessions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Bookings Found
          </h2>
          <p className="text-gray-500 mb-6">
            {statusFilter === 'all'
              ? "You haven't booked any sessions yet."
              : `No ${statusFilter} bookings found.`}
          </p>
          <Link
            to="/tutors"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
          >
            Find Tutors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Tutor Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                      {booking.tutor.user?.profileImage ? (
                        <img
                          src={booking.tutor.user.profileImage}
                          alt={booking.tutor.user?.name || 'Tutor'}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        booking.tutor.user?.name?.charAt(0) || 'T'
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.subject.name}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">
                        with{' '}
                        <span className="font-medium">
                          {booking.tutor.user?.name || 'Unknown Tutor'}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                        {booking.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(booking.duration)}</span>
                          </div>
                        )}
                        {booking.learningMethod && (
                          <div className="flex items-center gap-1">
                            {getLearningMethodIcon(booking.learningMethod)}
                            <span>
                              {getLearningMethodLabel(booking.learningMethod)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${booking.amount}</span>
                        </div>
                      </div>

                      {booking.selectedTopics &&
                        booking.selectedTopics.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Topics:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {booking.selectedTopics.map((topic) => (
                                <span
                                  key={topic._id}
                                  className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs"
                                >
                                  {topic.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-fit">
                  {booking.status === 'completed' &&
                    !bookingReviews[booking._id] && (
                      <button
                        onClick={() => handleReviewClick(booking)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    )}

                  {booking.status === 'confirmed' && booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join</span>
                    </a>
                  )}

                  {booking.contactNumber && (
                    <a
                      href={`tel:${booking.contactNumber}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && selectedBooking && (
        <BookingReviewForm
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedBooking(null);
          }}
          onSubmit={handleReviewSubmit}
          subject={selectedBooking.subject}
          topics={selectedBooking.selectedTopics || []}
          tutorName={selectedBooking.tutor?.user?.name || 'Unknown Tutor'}
          existingReview={
            bookingReviews[selectedBooking._id]
              ? {
                  rating: bookingReviews[selectedBooking._id].rating,
                  review: bookingReviews[selectedBooking._id].review,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default StudentBookings;
