import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isAuthenticated ? 'pt-16' : 'pt-0'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;