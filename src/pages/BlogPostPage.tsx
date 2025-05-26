import React from 'react';
import { useParams } from 'react-router-dom';

const BlogPostPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blog Post</h1>
        {/* Blog post content will be implemented later */}
        <p className="text-gray-600">Blog post content coming soon...</p>
      </article>
    </div>
  );
};

export default BlogPostPage;