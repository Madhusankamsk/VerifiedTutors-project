import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

interface BaseLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  showHeader = true,
  showFooter = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      {showHeader && <Header />}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default BaseLayout; 