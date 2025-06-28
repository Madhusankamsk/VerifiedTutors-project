import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, User, LogOut, Bell, Menu, X, ChevronRight, Home } from 'lucide-react';
import logo from '../../assets/logo.png';

interface HeaderProps {
  // Optional props for dashboard layouts
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  dashboardTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  isSidebarOpen, 
  dashboardTitle 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'tutor':
        return '/tutor/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  // Generate breadcrumb for dashboard pages
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/')) {
      const page = path.split('/')[2];
      return { role: 'Admin', page: page?.charAt(0).toUpperCase() + page?.slice(1) || 'Dashboard' };
    } else if (path.startsWith('/tutor/')) {
      const page = path.split('/')[2];
      return { role: 'Tutor', page: page?.charAt(0).toUpperCase() + page?.slice(1) || 'Dashboard' };
    } else if (path.startsWith('/student/')) {
      const page = path.split('/')[2];
      return { role: 'Student', page: page?.charAt(0).toUpperCase() + page?.slice(1) || 'Dashboard' };
    }
    return null;
  };

  const breadcrumb = getBreadcrumb();
  const isDashboardPage = breadcrumb !== null || !!dashboardTitle;
  const isDashboardLayout = !!onToggleSidebar; // Dashboard layout when sidebar toggle is provided

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Breadcrumb/Title Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile sidebar toggle for dashboard layouts */}
            {isDashboardLayout && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors lg:hidden"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <img 
                src={logo} 
                alt="VerifiedTutors Logo" 
                className={`${isDashboardLayout ? 'h-10' : 'h-12'} w-auto transition-all duration-300 hover:opacity-90`}
              />
            </Link>
            
            {/* Breadcrumb for dashboard pages or custom title */}
            {/* {isDashboardPage && (
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="h-6 w-px bg-gray-300"></div>
                {dashboardTitle ? (
                  // Custom dashboard title
                  <div>
                    <p className="text-sm text-gray-500 capitalize">{user?.role} Dashboard</p>
                    <h1 className="text-lg font-semibold text-gray-900">{dashboardTitle}</h1>
                  </div>
                ) : (
                  // Breadcrumb navigation
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <Link 
                      to={getDashboardLink()} 
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {breadcrumb?.role}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{breadcrumb?.page}</span>
                  </>
                )}
              </div>
            )} */}
          </div>

          {/* Right Section - Navigation and Profile */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Public Navigation for non-dashboard pages */}
            {!isDashboardPage && (
              <nav className="flex items-center space-x-6">
                <Link 
                  to="/tutors" 
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Find Tutors
                </Link>
                <Link 
                  to="/courses" 
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Courses
                </Link>
              </nav>
            )}

            {isAuthenticated ? (
              <>
                {/* Quick Actions for Dashboard */}
                {isDashboardPage && (
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 z-[60]">
                      <div className="p-1">
                        {/* Header */}
                        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                              Mark all as read
                            </button>
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="py-2 max-h-64 overflow-y-auto">
                          <div className="px-4 py-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                              <Bell className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">No new notifications</p>
                            <p className="text-xs text-gray-500">We'll notify you when something new arrives</p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                          <Link 
                            to="/notifications" 
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View all notifications →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 p-2 hover:bg-gray-50 transition-all duration-200"
                  >
                    {user?.profileImage ? (
                      <img
                        className="h-8 w-8 rounded-lg object-cover border border-gray-200 shadow-sm"
                        src={user.profileImage}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border border-primary-200 shadow-sm">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block transition-transform duration-200" 
                      style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-3 w-72 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 z-[60]">
                      <div className="p-1">
                        {/* User Info Section */}
                        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                          <div className="flex items-center space-x-3">
                            {user?.profileImage ? (
                              <img
                                className="h-12 w-12 rounded-xl object-cover border-2 border-white shadow-md"
                                src={user.profileImage}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-2 border-white shadow-md">
                                <User className="h-6 w-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                                  {user?.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to={getDashboardLink()}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 rounded-lg mx-1"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 mr-3">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium">Dashboard</p>
                              <p className="text-xs text-gray-500">View your dashboard</p>
                            </div>
                          </Link>
                          
                          <div className="my-1 border-t border-gray-100"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-150 rounded-lg mx-1"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mr-3">
                              <LogOut className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-gray-500">Logout from your account</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button for non-dashboard pages */}
          {!isDashboardLayout && (
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu for non-dashboard pages */}
      {!isDashboardLayout && isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/tutors"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Tutors
            </Link>
            <Link
              to="/courses"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Courses
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;