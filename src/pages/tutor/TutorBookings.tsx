import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, DollarSign, User, Book, Check, X, AlertCircle, ChevronLeft, ChevronRight, Hash, Play, Pause } from 'lucide-react';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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

  // Helper function to determine session status
  const getSessionStatus = (booking: Booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    if (booking.status === 'cancelled') {
      return 'cancelled';
    }
    
    if (booking.status === 'completed') {
      return 'completed';
    }
    
    if (currentTime < startTime) {
      return 'upcoming';
    }
    
    if (currentTime >= startTime && currentTime <= endTime) {
      return 'ongoing';
    }
    
    if (currentTime > endTime && booking.status === 'confirmed') {
      return 'ended';
    }
    
    return booking.status;
  };

  // Helper function to check if session has ended
  const hasSessionEnded = (booking: Booking) => {
    const endTime = new Date(booking.endTime);
    return currentTime > endTime;
  };

  // Helper function to check if session is ongoing
  const isSessionOngoing = (booking: Booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Helper function to get time remaining or elapsed
  const getTimeStatus = (booking: Booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    if (currentTime < startTime) {
      const diff = startTime.getTime() - currentTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Starts in ${hours}h ${minutes}m`;
    }
    
    if (currentTime >= startTime && currentTime <= endTime) {
      const diff = endTime.getTime() - currentTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Ends in ${hours}h ${minutes}m`;
    }
    
    if (currentTime > endTime) {
      const diff = currentTime.getTime() - endTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Ended ${hours}h ${minutes}m ago`;
    }
    
    return '';
  };

  // Helper function to check if booking is today
  const isBookingToday = (booking: Booking) => {
    const bookingDate = new Date(booking.startTime);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : statusFilter === 'upcoming'
    ? bookings.filter(booking => booking.status === 'confirmed' && !isSessionOngoing(booking) && !hasSessionEnded(booking))
    : statusFilter === 'ongoing'
    ? bookings.filter(booking => booking.status === 'confirmed' && isSessionOngoing(booking))
    : statusFilter === 'ended'
    ? bookings.filter(booking => booking.status === 'confirmed' && hasSessionEnded(booking))
    : statusFilter === 'today'
    ? bookings.filter(booking => isBookingToday(booking))
    : bookings.filter(booking => booking.status === statusFilter);

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
          Manage your student bookings and sessions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Book className="w-5 h-5 mr-2 text-blue-600" />
          Booking Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'confirmed' && !isSessionOngoing(b) && !hasSessionEnded(b)).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {bookings.filter(b => b.status === 'confirmed' && isSessionOngoing(b)).length}
            </div>
            <div className="text-sm text-gray-600">Ongoing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {bookings.filter(b => b.status === 'confirmed' && hasSessionEnded(b)).length}
            </div>
            <div className="text-sm text-gray-600">Ended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {bookings.filter(b => isBookingToday(b)).length}
            </div>
            <div className="text-sm text-gray-600">Today</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <label className="text-sm text-gray-600 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto min-w-[120px] bg-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h2>
          <p className="text-gray-500">
            {statusFilter === 'all' 
              ? "You don't have any bookings yet." 
              : statusFilter === 'upcoming'
              ? "No upcoming sessions found."
              : statusFilter === 'ongoing'
              ? "No ongoing sessions found."
              : statusFilter === 'ended'
              ? "No ended sessions found."
              : statusFilter === 'today'
              ? "No bookings found for today."
              : `No ${statusFilter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const sessionStatus = getSessionStatus(booking);
            const timeStatus = getTimeStatus(booking);
            const isOngoing = isSessionOngoing(booking);
            const hasEnded = hasSessionEnded(booking);
            
            return (
              <div key={booking._id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Student Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {booking.student.profileImage ? (
                          <img 
                            src={booking.student.profileImage} 
                            alt={booking.student.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          booking.student.name.charAt(0)
                        )}
                      </div>
                      
                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.subject.name}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          {/* Session Status Indicator */}
                          {booking.status === 'confirmed' && (
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                              isOngoing 
                                ? 'bg-orange-100 text-orange-800 border-orange-200' 
                                : hasEnded 
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {isOngoing ? 'Ongoing' : hasEnded ? 'Ended' : 'Upcoming'}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          with <span className="font-medium">{booking.student.name}</span>
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${booking.amount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{booking.student.email}</span>
                          </div>
                          {/* Time Status */}
                          {timeStatus && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className={isOngoing ? 'text-orange-600 font-medium' : hasEnded ? 'text-purple-600 font-medium' : 'text-blue-600 font-medium'}>
                                {timeStatus}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {booking.selectedTopics && booking.selectedTopics.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Topics:</p>
                            <div className="flex flex-wrap gap-2">
                              {booking.selectedTopics.map((topic) => (
                                <span key={topic._id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
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
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                    
                    {/* Complete button - only show when session has ended */}
                    {booking.status === 'confirmed' && hasSessionEnded(booking) && (
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Session</span>
                      </button>
                    )}

                    {/* Ongoing session indicator */}
                    {booking.status === 'confirmed' && isOngoing && (
                      <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-200 flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        <span>Session in Progress</span>
                      </div>
                    )}

                    {/* Upcoming session indicator */}
                    {booking.status === 'confirmed' && !isOngoing && !hasEnded && (
                      <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Session Upcoming</span>
                      </div>
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
                
                {booking.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">
                      <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TutorBookings; 