import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import Header from '../components/common/Header';
import DashboardFooter from '../components/common/DashboardFooter';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ sidebarItems, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header with dashboard functionality */}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        dashboardTitle={title}
      />

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 bottom-0 z-[45] w-64 bg-white shadow-xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
        style={{ 
          top: '4rem', /* 64px - main header height */
          bottom: '2.5rem', /* Account for fixed footer height */
        }}
      >
        {/* Account for mobile title bar height */}
        <div className="block md:hidden" style={{ height: '3.5rem' }}></div>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                    setIsSidebarOpen(false); // Close sidebar on mobile after click
                  }}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${isActive ? 'text-primary-600' : 'text-gray-400'} mr-3`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        {/* Account for mobile title bar height */}
        <div className="block md:hidden" style={{ height: '3.5rem' }}></div>
        
        {/* Page content */}
        <main className="min-h-screen bg-gray-50">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 pb-16 sm:pb-12">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed Dashboard Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardLayout; 