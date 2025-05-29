import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { X, ArrowLeft, Save } from 'lucide-react';

interface BlogFormData {
  title: string;
  content: string;
  tags: string[];
}

const CreateEditBlog = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { blogs, loading, error, createBlog, updateBlog, fetchBlogs } = useTutor();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBlogData = async () => {
      if (!blogId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // First try to find the blog in the existing blogs array
        let blog = blogs.find(b => b._id === blogId);
        
        // If not found, fetch blogs and try again
        if (!blog) {
          await fetchBlogs();
          blog = blogs.find(b => b._id === blogId);
        }

        if (blog) {
          setFormData({
            title: blog.title,
            content: blog.content,
            tags: blog.tags || []
          });
        } else {
          toast.error('Blog not found');
          navigate('/tutor/blogs');
        }
      } catch (error) {
        console.error('Error loading blog:', error);
        toast.error('Failed to load blog data');
        navigate('/tutor/blogs');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogData();
  }, [blogId, fetchBlogs, navigate, blogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (blogId) {
        await updateBlog(blogId, formData);
        toast.success('Blog updated successfully');
      } else {
        await createBlog(formData);
        toast.success('Blog created successfully');
      }
      navigate('/tutor/blogs');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loading || isLoading) {
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/blogs')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {blogId ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {blogId ? 'Update your existing blog post' : 'Share your knowledge with the community'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                placeholder="Write your blog content here..."
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex rounded-lg shadow-sm">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 block w-full rounded-l-lg border-gray-200 focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 inline-flex items-center p-0.5 rounded-full text-primary-400 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/tutor/blogs')}
                className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {blogId ? 'Update Blog' : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditBlog;