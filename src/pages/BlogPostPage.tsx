import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import { Heart, ArrowLeft } from 'lucide-react';

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, likePost } = useBlog();
  
  const post = posts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <button
            onClick={() => navigate('/blogs')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blog
        </button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative aspect-[21/9]">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="inline-block bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {post.category}
              </span>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{post.author}</p>
                    <p className="text-sm text-gray-200">{new Date(post.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => likePost(post.id)}
                  className="flex items-center space-x-1 text-white hover:text-red-400 transition-colors"
                >
                  <Heart className="w-6 h-6" />
                  <span>{post.likes}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <p>{post.content}</p>
              {/* Add more content sections here */}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;