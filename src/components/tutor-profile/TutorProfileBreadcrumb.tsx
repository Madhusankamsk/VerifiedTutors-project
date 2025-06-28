import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface TutorProfileBreadcrumbProps {
  tutorName: string;
}

const TutorProfileBreadcrumb: React.FC<TutorProfileBreadcrumbProps> = ({ tutorName }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
  );
};

export default TutorProfileBreadcrumb; 