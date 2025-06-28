import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  currentPage: string;
  parentPage?: string;
  parentPath?: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ 
  currentPage, 
  parentPage = 'Home', 
  parentPath = '/' 
}) => {
  return (
    <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                to={parentPath} 
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                {parentPage}
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-primary-600 md:ml-2">
                  {currentPage}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default BreadcrumbNav; 