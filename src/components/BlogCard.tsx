import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { BlogPost } from '../contexts/BlogContext';

interface BlogCardProps extends Omit<BlogPost, 'author'> {
  author: string;
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
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/blogs/${_id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
          {tags && tags.length > 0 && (
            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-medium">
              {tags[0]}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/blogs/${_id}`}>
          <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {title}
          </h2>
        </Link>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{author}</p>
              <p className="text-xs text-gray-500">{new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <button
            onClick={onLike}
            className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 