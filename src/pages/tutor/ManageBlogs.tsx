import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import { Edit2, Trash2, Plus, Calendar, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const ManageBlogs = () => {
  const { blogs, loading, error, deleteBlog } = useTutor();

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
          {blogs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {blogs.map((blog) => (
                <div key={blog._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{blog.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                        {blog.updatedAt !== blog.createdAt && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" />
                            <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {blog.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        to={`/tutor/blogs/edit/${blog._id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts yet</h3>
                <p className="text-gray-500 mb-6">Start sharing your knowledge by creating your first blog post</p>
                <Link
                  to="/tutor/blogs/create"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Blog
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