import React, { useEffect } from 'react';
import { Calendar, Clock, BookOpen, MessageSquare, ChevronRight, TrendingUp, Award, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudent } from '../../contexts/StudentContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { bookings, favorites, loading, error, fetchBookings, fetchFavorites } = useStudent();

  useEffect(() => {
    fetchBookings();
    fetchFavorites();
  }, []);

  // Calculate stats
  const upcomingBookings = bookings.filter(booking => 
    ['pending', 'notified', 'confirmed'].includes(booking.status) && 
    new Date(booking.startTime) > new Date()
  );
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

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
            onClick={() => {
              fetchBookings();
              fetchFavorites();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden shadow-md">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user?.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Progress</h2>
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-6">
              <div className="bg-primary-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-medium">Upcoming Sessions</p>
                  <Clock className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {upcomingBookings.length}
                </p>
              </div>
              <div className="bg-green-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-medium">Completed Sessions</p>
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {completedBookings.length}
                </p>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-medium">Favorite Tutors</p>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {favorites.length}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
              <BookOpen className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="bg-gray-50/50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-800 font-medium">
                          {booking.subject.name} with {booking.tutor.user.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(booking.createdAt)}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <Link to="/student/bookings">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No recent bookings</p>
                </div>
              )}
              
              {bookings.length > 3 && (
                <div className="text-center mt-2">
                  <Link 
                    to="/student/bookings"
                    className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                  >
                    View all {bookings.length} bookings
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
              <Users className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              <Link 
                to="/tutors"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book New Session</span>
              </Link>
              <Link
                to="/student/bookings"
                className="w-full bg-white/50 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 border border-gray-200"
              >
                <Clock className="w-5 h-5 text-gray-500" />
                <span>View My Bookings</span>
              </Link>
              <button className="w-full bg-white/50 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 border border-gray-200">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <span>Message Tutor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;