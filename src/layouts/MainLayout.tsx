import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import NotificationTester from '../components/common/NotificationTester';

const MainLayout: React.FC = () => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-16 pb-8 w-full">
        <Outlet />
      </main>
      <Footer />
      <NotificationTester />
    </div>
  );
};

export default MainLayout;