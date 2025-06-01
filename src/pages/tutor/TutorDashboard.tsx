import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Users, DollarSign, BookOpen, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
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
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 shadow-sm">
            <p className="text-yellow-700 font-medium mb-4">Please complete your tutor profile to get started.</p>
            <Link 
              to="/tutor/profile/edit" 
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-semibold text-2xl">
                  {profile.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.user.name}</h2>
                <div className="flex flex-wrap items-center mt-2 gap-3">
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 mr-1.5" />
                    <span className="text-sm font-medium">{profile.rating.toFixed(1)} ({profile.totalReviews} reviews)</span>
                  </div>
                  {profile.isVerified && (
                    <span className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tutor/profile"
                className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
              <button
                onClick={handleDeleteProfile}
                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">${profile.totalEarnings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-50 text-green-600 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-xl font-bold text-gray-900">{profile.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 flex-shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-xl font-bold text-gray-900">{profile.rating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-xl font-bold text-gray-900">{profile.totalSessions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Recent Blogs */}
          {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Blogs</h3>
                <div className="flex rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setActiveBlogTab('published')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeBlogTab === 'published'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setActiveBlogTab('draft')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeBlogTab === 'draft'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Drafts
                  </button>
                </div>
              </div>
              <Link 
                to="/tutor/blogs/create" 
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                New Blog
              </Link>
            </div>
            {filteredBlogs.length > 0 ? (
              <div className="space-y-6">
                {filteredBlogs.slice(0, 3).map((blog) => (
                  <div key={blog._id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">{blog.title}</h4>
                      {blog.status === 'draft' && (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.content}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          to={`/tutor/blogs/edit/${blog._id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {activeBlogTab === 'published' 
                    ? 'No published blog posts yet.'
                    : 'No draft blog posts yet.'}
                </p>
                <Link 
                  to="/tutor/blogs/create" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Create New Blog
                </Link>
              </div>
            )}
          </div> */}

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Reviews</h3>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        by {review.student.name}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{review.review}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No reviews yet.</p>
                <p className="text-sm text-gray-400">Your reviews will appear here once students start rating your sessions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;