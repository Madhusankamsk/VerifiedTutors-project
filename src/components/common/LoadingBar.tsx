import React from 'react';

interface LoadingBarProps {
  isLoading?: boolean;
  className?: string;
  variant?: 'hero' | 'default';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  height?: 'thin' | 'normal' | 'thick';
}

const LoadingBar: React.FC<LoadingBarProps> = ({ 
  isLoading = true, 
  className = '',
  variant = 'hero',
  color = 'blue',
  height = 'normal'
}) => {
  if (!isLoading) return null;

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'from-green-500 via-green-600 to-green-700';
      case 'purple':
        return 'from-purple-500 via-purple-600 to-purple-700';
      case 'orange':
        return 'from-orange-500 via-orange-600 to-orange-700';
      default:
        return 'from-blue-500 via-blue-600 to-blue-700';
    }
  };

  const getHeightClasses = () => {
    switch (height) {
      case 'thin':
        return 'h-0.5';
      case 'thick':
        return 'h-2';
      default:
        return 'h-1';
    }
  };

  const baseClasses = variant === 'hero' 
    ? `absolute bottom-0 left-0 w-full ${getHeightClasses()} bg-gradient-to-r ${getColorClasses()} z-10 shadow-lg`
    : `w-full ${getHeightClasses()} bg-gradient-to-r ${getColorClasses()}`;

  return (
    <div className={`${baseClasses} ${className}`}>
      {/* Animated progress bar */}
      <div className={`h-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 animate-loading-bar relative overflow-hidden`}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingBar; 