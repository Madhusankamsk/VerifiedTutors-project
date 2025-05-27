import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Users, DollarSign, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const TutorDashboard = () => {
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    fetchBlogs, 
    blogs,
    deleteProfile 
  } = useTutor();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchProfile(),
          fetchBlogs()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data. Please try again later.');
      }
    };
    fetchData();
  }, [fetchProfile, fetchBlogs]);

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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">Please complete your tutor profile to get started.</p>
          <Link to="/tutor/profile/edit" className="mt-4 inline-block btn btn-primary">
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-semibold text-xl">
                {profile.user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.user.name}</h2>
              <div className="flex flex-wrap items-center mt-1 gap-2 sm:gap-4">
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{profile.rating.toFixed(1)} ({profile.totalReviews} reviews)</span>
                </div>
                {profile.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/tutor/profile/edit"
              className="btn btn-outline-primary flex items-center flex-1 sm:flex-none justify-center"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
            <button
              onClick={handleDeleteProfile}
              className="btn btn-outline-danger flex items-center flex-1 sm:flex-none justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-lg font-semibold text-gray-900">${profile.totalEarnings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-lg font-semibold text-gray-900">{profile.totalStudents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-lg font-semibold text-gray-900">{profile.rating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-lg font-semibold text-gray-900">{profile.totalSessions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Blogs */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold">Recent Blogs</h3>
            <Link to="/tutor/blogs/create" className="btn btn-primary w-full sm:w-auto">
              New Blog
            </Link>
          </div>
          {blogs && blogs.length > 0 ? (
            <div className="space-y-4">
              {blogs.slice(0, 3).map((blog) => (
                <div key={blog._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-medium">{blog.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{blog.content}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                    <span className="text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/tutor/blogs/edit/${blog._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No blog posts yet.</p>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
          {profile.totalReviews > 0 ? (
            <div className="space-y-4">
              {/* We'll add review display here once the reviews endpoint is implemented */}
              <p className="text-gray-500">Reviews will be displayed here.</p>
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;