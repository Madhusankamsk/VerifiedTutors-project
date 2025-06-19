import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout: React.FC = () => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className={`container mx-auto flex-grow pb-8 sm:pb-12 md:pb-16 pt-20`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;