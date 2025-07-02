import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Users, DollarSign, Edit2, Trash2, Calendar, Clock, TrendingUp, Award, Bell } from 'lucide-react';
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
  
  const [notifiedBookings, setNotifiedBookings] = useState<Booking[]>([]);
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
    const fetchNotifiedBookings = async () => {
      try {
        setLoadingBookings(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/tutors/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const filtered = response.data.filter((booking: Booking) => booking.status === 'notified');
        setNotifiedBookings(filtered);
        setLoadingBookings(false);
      } catch (error) {
        console.error('Error fetching notified bookings:', error);
        setLoadingBookings(false);
      }
    };

    if (profile) {
      fetchNotifiedBookings();
    }
  }, [profile]);

  if (loading) {
    return <LoadingSpinner/>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 rounded-2xl p-8 shadow-lg">
            <p className="text-red-700 font-medium text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50/80 backdrop-blur-sm border-l-4 border-yellow-500 rounded-2xl p-8 shadow-lg">
            <p className="text-yellow-700 font-medium text-lg mb-6">Please complete your tutor profile to get started.</p>
            <Link 
              to="/tutor/profile/edit" 
              className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4 sm:py-6 lg:py-8">
        {/* Profile Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          
          <div className="flex flex-col gap-6 sm:gap-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-200 overflow-hidden">
                  <span className="text-white font-bold text-lg sm:text-2xl lg:text-3xl w-full h-full flex items-center justify-center">
                    {profile.user.profileImage ? (
                      <img 
                        src={profile.user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      profile.user.name.charAt(0)
                    )}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {profile.user.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center mt-2 sm:mt-3 gap-2 sm:gap-3">
                    <div className="flex items-center text-gray-600 bg-gray-50/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1 sm:mr-2" />
                      <span className="font-semibold text-sm sm:text-base">
                        {(profile.rating || 0).toFixed(1)} ({profile.totalReviews || 0} reviews)
                      </span>
                    </div>
                    {profile.isVerified && (
                      <span className="bg-green-50/80 backdrop-blur-sm text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium flex items-center shadow-sm text-sm sm:text-base">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Verified Tutor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  to="/tutor/profile"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-50 text-primary-700 rounded-lg sm:rounded-xl hover:bg-primary-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm sm:text-base"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Edit Profile
                </Link>
                <button
                  onClick={handleDeleteProfile}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-50 text-red-700 rounded-lg sm:rounded-xl hover:bg-red-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  Rs. {profile.totalEarnings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.totalStudents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
                             <div className="ml-3 sm:ml-4">
                 <p className="text-xs sm:text-sm font-medium text-gray-600">Rating</p>
                 <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                   {(profile.rating || 0).toFixed(1)}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Notified Bookings Alert */}
        {notifiedBookings.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">New Booking Requests</h3>
                  <p className="text-amber-700 text-sm sm:text-base">
                    You have {notifiedBookings.length} new booking request{notifiedBookings.length > 1 ? 's' : ''} waiting for your response.
                  </p>
                </div>
              </div>
              <Link
                to="/tutor/bookings"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-600 text-white rounded-lg sm:rounded-xl hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm sm:text-base w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                View Bookings
              </Link>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Recent Bookings
            </h3>
            <Link
              to="/tutor/bookings"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base transition-colors"
            >
              View All →
            </Link>
          </div>
          
          {loadingBookings ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : notifiedBookings.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {notifiedBookings.slice(0, 3).map((booking) => (
                <div key={booking._id} className="border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{booking.subject.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{booking.student.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{formatDate(booking.startTime)}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">No recent bookings</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-primary-600" />
              Recent Reviews
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50/50">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="ml-2 text-xs sm:text-sm text-gray-600">
                      {review.rating}/5
                    </span>
                  </div>
                                     <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-3">{review.review}</p>
                  <p className="text-xs text-gray-500">- {review.student?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;