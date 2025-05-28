import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className={`container mx-auto flex-grow ${isAuthenticated ? 'pt-20' : 'pt-16'} pb-8 sm:pb-12 md:pb-16`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;