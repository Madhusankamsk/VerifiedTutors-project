import React from 'react';

interface TutorProfileBackgroundProps {
  children: React.ReactNode;
}

const TutorProfileBackground: React.FC<TutorProfileBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Simplified background - removed heavy animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30"></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default React.memo(TutorProfileBackground); 