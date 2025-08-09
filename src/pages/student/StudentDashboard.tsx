import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Calendar, Clock, BookOpen, MessageSquare, TrendingUp, Award, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudent } from '../../contexts/StudentContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { bookings, favorites, loading, error, fetchBookings, fetchFavorites } = useStudent();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoize the data fetching to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (user) {
      try {
        await Promise.all([fetchBookings(), fetchFavorites()]);
      } finally {
        setIsInitialLoad(false);
      }
    }
  }, [user, fetchBookings, fetchFavorites]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize expensive calculations
  const { upcomingBookings, completedBookings } = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter(
      booking => ['pending', 'confirmed'].includes(booking.status) &&
      new Date(booking.startTime) > now
    );
    const completed = bookings.filter(booking => booking.status === 'completed');
    
    return { upcomingBookings: upcoming, completedBookings: completed };
  }, [bookings]);

  // Memoize the error retry handler
  const handleRetry = useCallback(() => {
    setIsInitialLoad(true);
    fetchData();
  }, [fetchData]);

  // Show loading spinner only on initial load
  if (isInitialLoad && loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={handleRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Pattern - Simplified */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30 -z-10"></div>
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your learning journey
        </p>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            <BookOpen className="w-6 h-6 text-primary-500" />
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
  );
};

export default React.memo(StudentDashboard);