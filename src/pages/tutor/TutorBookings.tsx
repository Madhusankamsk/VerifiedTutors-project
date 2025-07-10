import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, DollarSign, User, Book, Check, X, AlertCircle, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Booking {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  subject: {
    _id: string;
    name: string;
    category: string;
  };
  selectedTopics?: {
    _id: string;
    name: string;
    description?: string;
  }[];
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
  paymentStatus: string;
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

const TutorBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/tutors/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_URL}/api/tutors/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Booking ${newStatus} successfully`);
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update booking status`);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-3 sm:p-4 lg:p-6 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          My Bookingss
        </h1> */}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto min-w-[120px]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 w-full sm:w-auto">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center border border-gray-100">
            <div className="flex justify-center mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h2>
            <p className="text-sm sm:text-base text-gray-500">
              There are no bookings matching your current filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 transition hover:shadow-lg">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {booking.subject?.name || 'Unnamed Subject'}
                      </h2>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border self-start sm:self-center ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        {booking.student?.profileImage ? (
                          <img 
                            src={booking.student.profileImage} 
                            alt={booking.student.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{booking.student?.name || 'Unknown Student'}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{booking.student?.email || 'No email'}</p>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Start Time</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(booking.startTime)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">End Time</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(booking.endTime)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Amount</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Rs. {booking.amount || 0}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Payment Status</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base capitalize">{booking.paymentStatus || 'pending'}</p>
                        </div>
                      </div>
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

                    {/* Notes */}
                    {booking.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Notes:</p>
                        <p className="text-sm sm:text-base text-gray-800">{booking.notes}</p>
                      </div>
                    )}

                    {/* Cancellation Reason */}
                    {booking.cancellationReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs sm:text-sm text-red-600 mb-1">Cancellation Reason:</p>
                        <p className="text-sm sm:text-base text-red-800">{booking.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:gap-2 w-full sm:w-auto lg:w-auto">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                          className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm font-medium"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center text-sm font-medium"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'completed')}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center text-sm font-medium"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Complete
                      </button>
                    )}
                    {booking.meetingLink && booking.status === 'confirmed' && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center text-sm font-medium"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Booking Timeline */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Created: {formatDate(booking.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorBookings; 