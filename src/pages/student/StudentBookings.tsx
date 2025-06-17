import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, DollarSign, User, Book, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

interface BookingSubject {
  _id: string;
  name: string;
  category: string;
}

interface BookingTutorUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface BookingTutor {
  _id: string;
  user: BookingTutorUser;
}

interface Booking {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  tutor: BookingTutor;
  subject: BookingSubject;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
  paymentStatus: string;
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
}

const StudentBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/students/bookings');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-xl w-1/4 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <div className="flex justify-center mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't booked any sessions yet.
            </p>
            <a 
              href="/tutors"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
            >
              Find a Tutor
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBookings; 