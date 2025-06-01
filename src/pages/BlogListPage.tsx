import React, { useState, useEffect } from 'react';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/BlogCard';
import { Search } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const BlogListPage: React.FC = () => {
  const { posts, loading, error, fetchBlogs, likeBlog } = useBlog();
  const { user } = useAuth();
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const getAuthorName = (author: string | { _id: string; name: string; profileImage?: string }) => {
    return typeof author === 'string' ? author : author.name;
  };

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Get unique tags from all posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

  const filteredPosts = posts.filter(post => {
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesTag && matchesSearch && matchesStatus;
  });

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-gray-600">Discover insights, tips, and stories from our community of tutors and students.</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="flex rounded-lg border border-gray-200 p-1 bg-white">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === 'published'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Published
              </button>
              {user && (
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === 'draft'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Drafts
                </button>
              )}
            </div>

            {/* Tag Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post._id} className="break-inside-avoid">
                <BlogCard
                  {...post}
                  author={getAuthorName(post.author)}
                  onLike={() => likeBlog(post._id)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                {statusFilter === 'draft' 
                  ? 'No draft posts found.'
                  : 'No articles found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;