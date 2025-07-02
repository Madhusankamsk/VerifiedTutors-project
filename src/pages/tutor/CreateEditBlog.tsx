import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTutor } from '../../contexts/TutorContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { X, ArrowLeft, Save, Image as ImageIcon, Eye, EyeOff, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Image as ImageIcon2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';

interface BlogFormData {
  title: string;
  content: string;
  tags: string[];
  featuredImage: string;
  status: 'draft' | 'published';
}

const CreateEditBlog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, createBlog, updateBlog, getBlogById } = useTutor();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    tags: [],
    featuredImage: '',
    status: 'draft'
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
      }),
      TiptapImage,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    },
  });

  // Load blog data if editing
  // React.useEffect(() => {
  //   let isMounted = true;

  //   const fetchBlog = async () => {
  //     if (!id) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     setIsLoading(true);
  //     try {
  //       const blog = await getBlogById(id);
  //       if (!isMounted) return;

  //       if (blog) {
  //         setFormData({
  //           title: blog.title,
  //           content: blog.content,
  //           tags: blog.tags || [],
  //           featuredImage: blog.featuredImage || '',
  //           status: blog.status || 'draft'
  //         });
  //         if (editor) {
  //           editor.commands.setContent(blog.content);
  //         }
  //         setImagePreview(blog.featuredImage || '');
  //       } else {
  //         toast.error('Blog not found');
  //         navigate('/tutor/blogs');
  //       }
  //     } catch (error: any) {
  //       if (!isMounted) return;
  //       const errorMessage = error.response?.data?.message || 'Failed to load blog data';
  //       toast.error(errorMessage);
  //       navigate('/tutor/blogs');
  //     } finally {
  //       if (isMounted) {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   fetchBlog();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  const fetchBlog = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const blog = await getBlogById(id);
      if (blog) {
        setFormData({
          title: blog.title,
          content: blog.content,
          tags: blog.tags || [],
          featuredImage: blog.featuredImage || '',
          status: blog.status || 'draft'
        });
        if (editor) {
          editor.commands.setContent(blog.content);
        }
        setImagePreview(blog.featuredImage || '');
      } else {
        toast.error('Blog not found');
        navigate('/tutor/blogs');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load blog data';
      toast.error(errorMessage);
      navigate('/tutor/blogs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]); // Add id as dependency to ensure it's available

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title length
    if (formData.title.length > 100) {
      toast.error('Title cannot be more than 100 characters');
      return;
    }

    // Validate content
    if (formData.content.trim().length < 50) {
      toast.error('Content must be at least 50 characters long');
      return;
    }

    try {
      if (id) {
        await updateBlog(id, formData);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, featuredImage: data.data.url }));
      setImagePreview(data.data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'draft' ? 'published' : 'draft'
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => navigate('/tutor/blogs')}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Return to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate('/tutor/blogs')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {id ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {id ? 'Update your blog post' : 'Share your knowledge with students'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={toggleStatus}
              className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                formData.status === 'published'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              {formData.status === 'published' ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Published
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Draft
                </>
              )}
            </button>
            
            <button
              type="submit"
              form="blog-form"
              disabled={isLoading || loading}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : (id ? 'Update Post' : 'Create Post')}
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Title */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-3">
              Blog Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 text-base sm:text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your blog title..."
              required
              maxLength={100}
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1 sm:gap-0">
              <p className="text-xs sm:text-sm text-gray-500">
                Make it catchy and descriptive to attract readers
              </p>
              <span className={`text-xs ${
                formData.title.length > 80 ? 'text-red-600' : 
                formData.title.length > 60 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {formData.title.length}/100
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Featured Image
            </label>
            
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Featured"
                  className="w-full h-48 sm:h-64 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, featuredImage: '' }));
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4 mr-2 inline" />
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="featured-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="featured-image"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">Upload featured image</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content *
            </label>
            
            {/* Editor Toolbar */}
            {editor && (
              <div className="border border-gray-200 rounded-t-xl p-2 sm:p-3 bg-gray-50 flex flex-wrap gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive('bold') ? 'bg-gray-300' : ''
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive('italic') ? 'bg-gray-300' : ''
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive('underline') ? 'bg-gray-300' : ''
                  }`}
                >
                  <UnderlineIcon className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive('bulletList') ? 'bg-gray-300' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive('orderedList') ? 'bg-gray-300' : ''
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="border border-gray-200 border-t-0 rounded-b-xl">
              <EditorContent
                editor={editor}
                className="prose max-w-none p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] focus:outline-none"
              />
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mt-3">
              Minimum 50 characters required. Use the toolbar to format your content.
            </p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tags
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Add tags (e.g., mathematics, education, tips)"
                maxLength={30}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm whitespace-nowrap"
              >
                Add Tag
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-primary-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs sm:text-sm text-gray-500 mt-3">
              Add relevant tags to help students find your content. Maximum 5 tags.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditBlog;