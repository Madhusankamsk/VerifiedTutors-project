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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        dashboardTitle={title}
      />

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-50 w-64 bg-white/80 backdrop-blur-sm shadow-2xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-200/50`}
      >
        <div className="flex flex-col h-full">
          {/* Dashboard Title - Mobile */}
          <div className="lg:hidden px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-md border border-blue-200/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200/50'
                  }`}
                >
                  <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} mr-3 transition-colors duration-200`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
            <div className="flex items-center space-x-3">
              {user?.profileImage ? (
                <img
                  className="h-8 w-8 rounded-lg object-cover border-2 border-white shadow-md"
                  src={user.profileImage}
                  alt={user.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-white shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="lg:pl-64 pt-16">
        {/* Page Title Bar - Desktop */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-8rem)]">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardLayout; 