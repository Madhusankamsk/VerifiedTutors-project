import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import logo from '../assets/logo.png';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Main content area that takes full height */}
      <div className="flex-grow relative">
        {/* Logo positioned absolutely */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
          <Link to="/" className="flex justify-center">
            <img
              className="h-12 w-auto"
              src={logo}
              alt="VerifiedTutors"
            />
          </Link>
        </div>

        {/* Login form content */}
        <div className="pt-24">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 