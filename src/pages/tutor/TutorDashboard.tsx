import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Calendar, User, TrendingUp, BookOpen, Plus, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/constants';

interface Booking {
  _id: string;
  student: {
    name: string;
    email: string;
    profileImage?: string;
  };
  subject: {
    name: string;
    category: string;
  };
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
}

const TutorDashboard = () => {
  const { profile, loading, error } = useTutor();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile) return;
      
      try {
        setLoadingBookings(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/tutors/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const pending = response.data.filter((booking: Booking) => booking.status === 'pending');
        const completed = response.data.filter((booking: Booking) => booking.status === 'completed');
        
        setPendingBookings(pending);
        setCompletedBookings(completed);
        
        // Debug logging
        console.log('Bookings data:', response.data);
        console.log('Pending bookings:', pending);
        console.log('Completed bookings:', completed);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [profile]);

  // Debug logging for profile data
  useEffect(() => {
    if (profile) {
      console.log('Profile data:', profile);
      console.log('Profile rating:', profile.rating);
      console.log('Profile subjects:', profile.subjects);
      console.log('Profile subjects length:', profile.subjects?.length);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
          <p className="text-yellow-700 text-sm mb-6">Please complete your tutor profile to get started.</p>
          <Link 
            to="/tutor/profile" 
            className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // Calculate values with proper fallbacks
  const totalBookings = (pendingBookings?.length || 0) + (completedBookings?.length || 0);
  const pendingCount = pendingBookings?.length || 0;
  const completedCount = completedBookings?.length || 0;
  const rating = profile.rating || 0;
  const subjectsCount = profile.subjects?.length || 0;

  // Debug logging for calculated values
  console.log('Calculated values:', {
    totalBookings,
    pendingCount,
    completedCount,
    rating,
    subjectsCount
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.user?.name?.split(' ')[0] || 'Tutor'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your tutoring overview for today
        </p>
      </div>

      {/* Essential Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</p>
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-3xl font-bold text-gray-900">{subjectsCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tutor/profile"
            className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/tutor/bookings"
            className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">View Bookings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/tutors"
            className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Browse Tutors</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Link
            to="/tutor/bookings"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {pendingBookings.slice(0, 3).map((booking) => (
            <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {booking.student?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.student?.name || 'Student'}</p>
                  <p className="text-sm text-gray-500">{booking.subject?.name || 'Subject'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">${booking.amount || 0}</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {booking.status || 'pending'}
                </span>
              </div>
            </div>
          ))}
          
          {pendingBookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;