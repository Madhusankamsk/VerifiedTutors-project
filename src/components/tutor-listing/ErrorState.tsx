import React from 'react';
import { X } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  title?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = "Error Loading Tutors"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState; 