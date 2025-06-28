import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import logo from '../assets/logo.png';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
            <Link to="/" className="flex justify-center">
              <img
                className="h-12 w-auto"
                src={logo}
                alt="VerifiedTutors"
              />
            </Link>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Outlet />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthLayout; 