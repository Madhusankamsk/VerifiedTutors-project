import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Users, DollarSign, BookOpen, Edit2, Trash2, Calendar, Clock, TrendingUp, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';

const TutorDashboard = () => {
  const { 
    profile, 
    loading, 
    error,  
    blogs,
    deleteProfile,
    reviews,
  } = useTutor();
  
  const [activeBlogTab, setActiveBlogTab] = useState<'published' | 'draft'>('published');
  
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

  const filteredBlogs = blogs?.filter(blog => blog.status === activeBlogTab) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Profile Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 relative">
            <div className="flex items-center space-x-8">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-200 overflow-hidden">
                <span className="text-white font-bold text-3xl w-full h-full flex items-center justify-center">
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
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.user.name}
                </h2>
                <div className="flex flex-wrap items-center mt-3 gap-3">
                  <div className="flex items-center text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
                    <Star className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="font-semibold">{profile.rating.toFixed(1)} ({profile.totalReviews} reviews)</span>
                  </div>
                  {profile.isVerified && (
                    <span className="bg-green-50/80 backdrop-blur-sm text-green-700 px-4 py-2 rounded-xl font-medium flex items-center shadow-sm">
                      <Award className="w-5 h-5 mr-2" />
                      Verified Tutor
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/tutor/profile"
                className="inline-flex items-center px-6 py-3 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Profile
              </Link>
              <button
                onClick={handleDeleteProfile}
                className="inline-flex items-center px-6 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  ${profile.totalEarnings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.totalStudents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-md">
                <Star className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.rating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {profile.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Recent Reviews */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Recent Reviews
              </h3>
              <div className="flex items-center text-primary-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-medium">Performance Insights</span>
              </div>
            </div>
            
            {reviews && reviews.length > 0 ? (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-3 font-medium">
                        by {review.student.name}
                      </span>
                    </div>
                    <p className="text-gray-700 text-base mb-4 leading-relaxed">{review.review}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
                  <p className="text-gray-600 text-lg mb-4">No reviews yet.</p>
                  <p className="text-gray-500 text-sm">
                    Your reviews will appear here once students start rating your sessions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;