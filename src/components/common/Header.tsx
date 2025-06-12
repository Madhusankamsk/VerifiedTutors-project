import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, User, LogOut, Bell, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

const Header: React.FC = () => {
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

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <img 
                src={logo} 
                alt="VerifiedTutors Logo" 
                className="h-36 sm:h-36 w-auto transition-all duration-300 hover:opacity-90"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 p-1 hover:bg-gray-50 transition-all duration-200"
                  >
                    {user?.profileImage ? (
                      <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-primary-100"
                        src={user.profileImage}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center border-2 border-primary-100">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to={getDashboardLink()}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <User className="h-4 w-4 mr-3 text-primary-500" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <LogOut className="h-4 w-4 mr-3 text-primary-500" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-medium transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden bg-white border-t border-gray-100 shadow-lg"
        >
          <div className="px-4 pt-4 pb-6 space-y-5">
            {isAuthenticated ? (
              <>
                {/* User Profile Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {user?.profileImage ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary-100"
                      src={user.profileImage}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center border-2 border-primary-100">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Notifications Preview */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
                  </div>
                  <div className="text-xs text-gray-500">You have new notifications</div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-150 rounded-lg"
                  >
                    <User className="h-5 w-5 mr-3 text-primary-500" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-150 rounded-lg"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-primary-500" />
                    Sign out
                  </button>
                </nav>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 text-center rounded-lg font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="w-full bg-primary-600 text-white px-4 py-3 text-center rounded-lg font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;