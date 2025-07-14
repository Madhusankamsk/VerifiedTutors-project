import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Users, DollarSign, Edit2, Trash2, Calendar, Clock, TrendingUp, Award, BookOpen, MessageCircle, Eye, Plus, ArrowRight, Target, ChevronRight, User, MessageSquare } from 'lucide-react';
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
  amount: number; // Added amount for new structure
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
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);

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
        
        const pending = response.data.filter((booking: Booking) => booking.status === 'pending');
        const completed = response.data.filter((booking: Booking) => booking.status === 'completed');
        
        setPendingBookings(pending);
        setCompletedBookings(completed);
        setLoadingBookings(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
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
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -z-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 -z-10"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 -z-10"></div>

      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.user.name.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Here's what's happening with your tutoring business today
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 relative overflow-hidden mb-6 sm:mb-8">
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

            {/* Quick Stats */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-4">
              <div className="bg-blue-50/50 rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {profile.subjects?.length || 0}
                </div>
                <div className="text-sm text-blue-700 font-medium">Subjects</div>
              </div>
              <div className="bg-green-50/50 rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                  {pendingBookings.length}
                </div>
                <div className="text-sm text-green-700 font-medium">Pending</div>
              </div>
              <div className="bg-purple-50/50 rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {completedBookings.length}
                </div>
                <div className="text-sm text-purple-700 font-medium">Completed</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link
              to="/tutor/profile"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Edit Profile</span>
            </Link>
            <Link
              to="/tutor/bookings"
              className="flex-1 bg-white/50 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 border border-gray-200"
            >
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>View Bookings</span>
            </Link>
            <button
              onClick={handleDeleteProfile}
              className="flex-1 bg-red-50 text-red-600 py-3 px-4 rounded-xl hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 border border-red-200"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings and Stats Grid */}
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
            
            <div className="space-y-4">
              {pendingBookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="bg-gray-50/50 rounded-xl p-4 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {booking.student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.student.name}</h4>
                          <p className="text-sm text-gray-500">{booking.subject.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(booking.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${booking.amount}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {pendingBookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending bookings</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-semibold text-gray-900">{pendingBookings.length + completedBookings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {pendingBookings.length + completedBookings.length > 0 
                    ? Math.round((completedBookings.length / (pendingBookings.length + completedBookings.length)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">{(profile.rating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Profile updated</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New booking received</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Review submitted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;