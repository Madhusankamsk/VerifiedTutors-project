import { Link } from 'react-router-dom';
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { Blog } from '../../contexts/TutorContext';

interface BlogCardProps {
  blog: Blog;
  onDelete: (blogId: string) => void;
}

const BlogCard = ({ blog, onDelete }: BlogCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{blog.title}</h3>
          {blog.status === 'draft' && (
            <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
              Draft
            </span>
          )}
        </div>

        <p className="text-gray-600 line-clamp-2">{blog.content}</p>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag: string, index: number) => (
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
            <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          {blog.updatedAt !== blog.createdAt && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Link
            to={`/tutor/blogs/edit/${blog._id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => onDelete(blog._id)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 