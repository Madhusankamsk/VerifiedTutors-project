import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Heart } from 'lucide-react';
import { BlogPost } from '../contexts/BlogContext';

interface BlogCardProps extends Omit<BlogPost, 'author'> {
  author: string | { _id: string; name: string; profileImage?: string };
  onLike: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  _id,
  title,
  content,
  featuredImage,
  author,
  createdAt,
  tags,
  likes = 0,
  onLike,
  status,
  updatedAt,
}) => {
  // Helper function to get author name
  const getAuthorName = () => {
    if (typeof author === 'string') {
      return author;
    }
    return author.name;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{title}</h3>
          {status === 'draft' && (
            <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
              Draft
            </span>
          )}
        </div>

        <p className="text-gray-600 line-clamp-2">{content}</p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5" />
            <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
          </div>
          {updatedAt !== createdAt && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500">By {getAuthorName()}</span>
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 