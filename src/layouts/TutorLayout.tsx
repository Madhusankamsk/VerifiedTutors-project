import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTutor } from '../contexts/TutorContext';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TutorLayout: React.FC = () => {
  const { logout } = useAuth();
  const { profile, loading, error } = useTutor();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/tutor/dashboard', name: 'Dashboard', icon: 'LayoutDashboard' as const },
    { path: '/tutor/profile', name: 'My Profile', icon: 'User' as const },
    { path: '/tutor/blogs', name: 'My Blogs', icon: 'BookOpen' as const },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please complete your tutor profile to get started.</p>
          <Link to="/tutor/profile/edit" className="mt-4 inline-block btn btn-primary">
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/tutor/dashboard" className="text-xl font-bold text-primary-600">
              Tutor Portal
            </Link>
            <button
              className="md:hidden text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="X" className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              {profile.user.profileImage ? (
                <img
                  src={profile.user.profileImage}
                  alt={profile.user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {profile.user.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{profile.user.name}</p>
                <p className="text-xs text-gray-500">{profile.user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <Icon name="LogOut" className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              className="md:hidden text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="Menu" className="h-6 w-6" />
            </button>
            <div className="ml-4 md:ml-0">
              <h1 className="text-lg font-semibold text-gray-900">
                {navItems.find((item) => item.path === location.pathname)?.name || 'Tutor Dashboard'}
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

export default TutorLayout;