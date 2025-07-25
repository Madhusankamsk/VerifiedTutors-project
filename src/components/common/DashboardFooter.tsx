import React from 'react';
import { Heart } from 'lucide-react';

const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-50">
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span>© {currentYear} VerifiedTutors</span>
          <span className="hidden sm:inline">•</span>
          <span>
                  for education, by{' '}
                  <a
                    href="https://alteredminds.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-400 transition-colors"
                  >
                    alteredMinds.co
                  </a>
                </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline">v1.0.0</span>
          <span className="text-gray-400">•</span>
          <span>Dashboard</span>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter; 