import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, DollarSign, User, Book, Filter, Search, ChevronLeft, ChevronRight, Hash, BookOpen } from 'lucide-react';

const ManageBookings = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { 
    bookings, 
    bookingLoading: loading, 
    bookingError: error, 
    bookingTotalPages: totalPages, 
    bookingCurrentPage: currentPage,
    fetchBookings
  } = useAdmin();

  useEffect(() => {
    fetchBookings(currentPage, statusFilter, sortBy);
  }, [currentPage, statusFilter, sortBy]);

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

  if (loading) {
    return (
      <div className="relative">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-xl w-1/4 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 border border-gray-100">
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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => fetchBookings(currentPage, statusFilter, sortBy)}
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
          Manage Bookings
        </h1>
        <p className="text-gray-600">
          Monitor and manage all booking activities across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h2>
          <p className="text-gray-500">
            {statusFilter === 'all' 
              ? "No bookings have been made yet." 
              : `No ${statusFilter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
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
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{booking.student.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>→</span>
                          <span>{booking.tutor.user?.name || 'Unknown Tutor'}</span>
                        </div>
                      </div>
                      
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
                          <Clock className="w-4 h-4" />
                          <span className="capitalize">{booking.paymentStatus}</span>
                        </div>
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

                {/* Booking ID */}
                <div className="text-right">
                  <p className="text-xs text-gray-500">Booking ID</p>
                  <p className="text-sm font-mono text-gray-700">#{booking._id.slice(-8)}</p>
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
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => fetchBookings(currentPage - 1, statusFilter, sortBy)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => fetchBookings(currentPage + 1, statusFilter, sortBy)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageBookings; 