import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface TutorProfileBreadcrumbProps {
  tutorName: string;
}

const TutorProfileBreadcrumb: React.FC<TutorProfileBreadcrumbProps> = ({ tutorName }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <Link 
          to="/tutors" 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Tutors
        </Link>

        {/* Breadcrumb Navigation */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                to="/" 
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link 
                  to="/tutors" 
                  className="ml-1 text-sm text-gray-600 hover:text-primary-600 md:ml-2 transition-colors"
                >
                  Tutors
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-primary-600 md:ml-2">
                  {tutorName}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default TutorProfileBreadcrumb; 