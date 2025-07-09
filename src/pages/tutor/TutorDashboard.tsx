import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Users, DollarSign, Edit2, Trash2, Calendar, Clock, TrendingUp, Award, BookOpen, MessageCircle, Eye, Plus, ArrowRight, Target, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
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
}

const TutorDashboard = () => {
  const { 
    profile, 
    loading, 
    error,  
    reviews,
    deleteProfile,
  } = useTutor();
  
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await deleteProfile();
        toast.success('Profile deleted successfully');
      } catch (error) {
        toast.error('Failed to delete profile');
      }
    }
  };

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        setLoadingBookings(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/tutors/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const filtered = response.data.filter((booking: Booking) => booking.status === 'pending');
        setPendingBookings(filtered);
        setLoadingBookings(false);
      } catch (error) {
        console.error('Error fetching pending bookings:', error);
        setLoadingBookings(false);
      }
    };

    if (profile) {
      fetchPendingBookings();
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
        <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
            <p className="text-yellow-700 text-sm mb-6">Please complete your tutor profile to get started and begin accepting bookings.</p>
            <Link 
              to="/tutor/profile/edit" 
              className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.user.name.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Here's what's happening with your tutoring business today
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl overflow-hidden">
                  {profile.user.profileImage ? (
                    <img 
                      src={profile.user.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl sm:text-3xl">
                      {profile.user.name.charAt(0)}
                    </span>
                  )}
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {profile.user.name}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center justify-center sm:justify-start bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                    <Star className="w-4 h-4 text-yellow-500 mr-1.5" />
                    <span className="font-semibold text-yellow-700 text-sm">
                      {(profile.rating || 0).toFixed(1)} ({profile.totalReviews || 0} reviews)
                    </span>
                  </div>
                  {profile.isVerified && (
                    <div className="flex items-center justify-center sm:justify-start bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                      <Award className="w-4 h-4 text-green-600 mr-1.5" />
                      <span className="font-semibold text-green-700 text-sm">Verified Tutor</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm max-w-md">
                  {profile.bio || "Teaching with passion and dedication"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/tutor/profile/edit"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
              <Link
                to="/tutor/profile"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Earnings</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Rs. {(profile.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Students</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {profile.totalStudents || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-blue-600">
            <Users className="w-3 h-3 mr-1" />
            <span>Active learners</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Sessions</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {profile.totalSessions || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-purple-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>Completed</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Star className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Rating</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {(profile.rating || 0).toFixed(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-orange-600">
            <Star className="w-3 h-3 mr-1" />
            <span>Average score</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                Recent Bookings
              </h3>
              <Link
                to="/tutor/bookings"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors group"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {loadingBookings ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : pendingBookings.length > 0 ? (
              <div className="space-y-4">
                {pendingBookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {booking.student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{booking.subject.name}</h4>
                          <p className="text-sm text-gray-600">{booking.student.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(booking.startTime)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h4>
                <p className="text-gray-600 text-sm">Your upcoming bookings will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Reviews */}
        <div className="space-y-6 sm:space-y-8">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/tutor/bookings"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-700">Manage Bookings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/tutor/blogs"
                className="flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-700">Manage Blogs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/tutor/profile/edit"
                className="flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center">
                  <Edit2 className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-700">Edit Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Recent Reviews
              </h3>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{review.review}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">- {review.student?.name}</span>
                      <span className="text-xs text-blue-600 font-medium">{review.subject?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;