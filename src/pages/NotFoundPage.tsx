import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowRight } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-20">
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        <div className="relative text-center max-w-2xl mx-auto">
          {/* 404 Text with Gradient */}
          <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-6 animate-pulse">
            404
          </h1>
          
          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-100">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to a different location.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              >
                <HomeIcon size={20} />
                Return Home
              </Link>
              <Link
                to="/tutors"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-gray-200 w-full sm:w-auto justify-center"
              >
                Find Tutors
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;