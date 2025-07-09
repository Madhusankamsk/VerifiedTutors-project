import React from 'react';

interface TutorProfileBackgroundProps {
  children: React.ReactNode;
}

const TutorProfileBackground: React.FC<TutorProfileBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-8000"></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default TutorProfileBackground; 