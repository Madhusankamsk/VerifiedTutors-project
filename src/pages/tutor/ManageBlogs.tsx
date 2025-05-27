import { Link } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import { Edit2, Trash2, Plus } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blogs</h1>
        <Link
          to="/tutor/blogs/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Blog
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {blogs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <div key={blog._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{blog.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{blog.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                      {blog.updatedAt !== blog.createdAt && (
                        <span className="ml-4">
                          Updated: {new Date(blog.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Link
                      to={`/tutor/blogs/edit/${blog._id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">No blog posts yet</p>
            <Link
              to="/tutor/blogs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Blog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBlogs;