import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="text-xl font-bold text-primary">
              VerifiedTutors
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md lg:hidden"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick}
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.profileImage || '/default-avatar.png'}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white shadow">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 