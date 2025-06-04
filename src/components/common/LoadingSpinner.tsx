import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  fullPage = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const containerClasses = fullPage 
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center min-h-[200px]';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Outer ring with gradient */}
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            border-4 
            border-transparent
            animate-spin
            border-t-primary-600
            border-r-primary-400
            border-b-primary-500
            border-l-primary-300
          `}
        />
        {/* Inner pulsing circle */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            bg-primary-50/30 
            dark:bg-primary-900/30
            animate-pulse
          `}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;