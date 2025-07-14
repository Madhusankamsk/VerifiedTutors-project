import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { ChevronDown, User, LogOut, Bell, Menu, X, ChevronRight, Home, Sparkles } from 'lucide-react';
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
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
    <header className="bg-white/80 backdrop-blur-xl shadow-soft border-b border-gray-100/50 fixed w-full top-0 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16">
          {/* Logo and Breadcrumb/Title Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile sidebar toggle for dashboard layouts */}
            {isDashboardLayout && (
              <button
                onClick={onToggleSidebar}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 lg:hidden border border-transparent hover:border-blue-200/50"
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
                className={`${isDashboardLayout ? 'h-10' : 'h-12'} w-auto transition-all duration-300 hover:opacity-90 filter drop-shadow-sm`}
              />
            </Link>
          </div>

          {/* Right Section - Navigation and Profile */}
          <div className="hidden md:flex items-center space-x-4">

            {isAuthenticated ? (
              <>
                {/* Quick Actions for Dashboard */}
                {isDashboardPage && (
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 border border-transparent hover:border-blue-200/50"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={toggleNotifications}
                    className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200/50"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl ring-1 ring-black/5 focus:outline-none border border-gray-200/50 z-[60]">
                      <div className="p-1">
                        {/* Header */}
                        <div className="px-4 py-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-t-2xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <Bell className="h-4 w-4 text-blue-600" />
                              </div>
                              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                            </div>
                            {notifications.length > 0 && (
                              <button 
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-full hover:bg-blue-50 transition-all duration-200"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="py-2 max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div className="space-y-1">
                              {notifications.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkAsRead={markAsRead}
                                  onRemove={removeNotification}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">No new notifications</p>
                              <p className="text-xs text-gray-500">We'll notify you when something new arrives</p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-b-2xl">
                          <Link 
                            to="/notifications" 
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200"
                          >
                            View all notifications 
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 p-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 border border-transparent hover:border-blue-200/50"
                  >
                    {user?.profileImage ? (
                      <img
                        className="h-8 w-8 rounded-lg object-cover border-2 border-white shadow-soft"
                        src={user.profileImage}
                        alt={user.name}
                      />
                                          ) : (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-white shadow-soft">
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
                    <div className="origin-top-right absolute right-0 mt-3 w-72 rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl ring-1 ring-black/5 focus:outline-none border border-gray-200/50 z-[60]">
                      <div className="p-1">
                        {/* User Info Section */}
                        <div className="px-4 py-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-t-2xl">
                          <div className="flex items-center space-x-3">
                            {user?.profileImage ? (
                              <img
                                className="h-12 w-12 rounded-xl object-cover border-2 border-white shadow-soft"
                                src={user.profileImage}
                                alt={user.name}
                              />
                                                          ) : (
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-white shadow-soft">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                              )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 capitalize border border-blue-200/50">
                                  <Sparkles className="h-3 w-3 mr-1" />
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
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 rounded-xl mx-1 border border-transparent hover:border-blue-200/50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 mr-3">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Dashboard</p>
                              <p className="text-xs text-gray-500">View your dashboard</p>
                            </div>
                          </Link>
                          
                          <div className="my-1 border-t border-gray-100/50"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200 rounded-xl mx-1 border border-transparent hover:border-red-200/50"
                          >
                                                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-100 to-red-200 mr-3">
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
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 border border-transparent hover:border-blue-200/50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-soft hover:shadow-lg transform hover:scale-105 border border-blue-500/20"
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
                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 border border-transparent hover:border-blue-200/50"
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
        <div ref={mobileMenuRef} className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-soft">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-soft mx-2 text-center"
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