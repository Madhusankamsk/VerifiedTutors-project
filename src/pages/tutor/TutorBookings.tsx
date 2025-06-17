import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, DollarSign, User, Book, Check, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
      case 'notified':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
              <option value="notified">Notified</option>
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
            <p className="text-gray-500">
              There are no bookings matching your current filters.
            </p>
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
                  
                  {/* Action buttons based on status */}
                  <div className="flex space-x-2">
                    {booking.status === 'notified' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Student</p>
                      <p className="font-medium text-gray-800">
                        {booking.student?.name || 'Unknown Student'}
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
                      <p className="text-sm text-gray-500">End Time</p>
                      <p className="font-medium text-gray-800">{formatDate(booking.endTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-gray-800">${booking.amount}</p>
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
                </div>

                {booking.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Notes:</p>
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorBookings; 