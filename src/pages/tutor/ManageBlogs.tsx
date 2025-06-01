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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Blogs</h1>
            <p className="mt-1 text-sm text-gray-500">Create, edit, and manage your blog posts</p>
          </div>
          <Link
            to="/tutor/blogs/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Blog
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex rounded-lg p-1 m-4 bg-gray-50">
              <button
                onClick={() => setActiveTab('published')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'published'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'draft'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Drafts
              </button>
            </div>
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} onDelete={handleDeleteBlog} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'published' ? 'No published blog posts yet' : 'No draft blog posts yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'published' 
                    ? 'Start sharing your knowledge by publishing your first blog post'
                    : 'Create a draft to start working on your next blog post'}
                </p>
                <Link
                  to="/tutor/blogs/create"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
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