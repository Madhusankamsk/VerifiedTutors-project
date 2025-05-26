import React from 'react';
import { Link } from 'react-router-dom';

const ManageBlogs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blogs</h1>
        <Link
          to="/tutor/blogs/create"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Create New Blog
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <p className="text-gray-600">No blog posts yet</p>
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;