import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, BookOpen, MapPin, LogOut, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/tutors', name: 'Manage Tutors', icon: Users },
    { path: '/admin/subjects', name: 'Manage Subjects', icon: BookOpen },
    { path: '/admin/locations', name: 'Manage Locations', icon: MapPin },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-primary-900 transition duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="text-white font-bold text-xl">Admin Panel</div>
          <button
            type="button"
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  location.pathname === item.path
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="mt-10 w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-primary-100 hover:bg-primary-700 hover:text-white"
          >
            <LogOut className="mr-3 h-6 w-6 flex-shrink-0" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              className="md:hidden text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 md:ml-0">
              <h1 className="text-lg font-semibold text-gray-900">
                {navItems.find((item) => item.path === location.pathname)?.name || 'Admin Dashboard'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6"></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;