import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import { Plus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useState } from 'react';
import React from 'react';
import BlogCard from '../../components/blog/BlogCard';

const ManageBlogs = () => {
  const { blogs, loading, error, deleteBlog } = useTutor();
  const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');

  const handleDeleteBlog = async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        await deleteBlog(blogId);
        toast.success('Blog deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete blog');
      }
    }
  };

  const filteredBlogs = React.useMemo(() => {
    return blogs?.filter(blog => blog?.status === activeTab) || [];
  }, [blogs, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Blogs</h1>
              <p className="mt-1 text-sm sm:text-base text-gray-500">Create, edit, and manage your blog posts</p>
            </div>
            <Link
              to="/tutor/blogs/create"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Create New Blog
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex rounded-lg p-1 m-3 sm:m-4 bg-gray-50">
              <button
                onClick={() => setActiveTab('published')}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'published'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Published ({blogs?.filter(blog => blog?.status === 'published').length || 0})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'draft'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Drafts ({blogs?.filter(blog => blog?.status === 'draft').length || 0})
              </button>
            </div>
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} onDelete={handleDeleteBlog} />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'published' ? 'No published blog posts yet' : 'No draft blog posts yet'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6">
                  {activeTab === 'published' 
                    ? 'Start sharing your knowledge by publishing your first blog post'
                    : 'Create a draft to start working on your next blog post'}
                </p>
                <Link
                  to="/tutor/blogs/create"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create New Blog
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;