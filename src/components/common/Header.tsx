import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { ChevronDown, User, LogOut, Bell, Menu, X, ChevronRight, Home, Sparkles } from 'lucide-react';

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

  // Memoize toggle handlers
  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(prev => !prev);
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  }, [logout, navigate]);

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

  // Memoize dashboard link calculation
  const dashboardLink = useMemo(() => {
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
  }, [user]);

  // Memoize breadcrumb calculation
  const breadcrumb = useMemo(() => {
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
  }, [location.pathname]);

  // Determine if this is a dashboard layout
  const isDashboardLayout = useMemo(() => {
    return onToggleSidebar !== undefined;
  }, [onToggleSidebar]);

  const isDashboardPage = useMemo(() => {
    return breadcrumb !== null || !!dashboardTitle;
  }, [breadcrumb, dashboardTitle]);

  return (
    <header className="bg-white/95 shadow-soft border-b border-gray-100/50 fixed w-full top-0 z-50">
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
              <svg 
                viewBox="0 0 1536.000000 1024.000000"
                className={`${isDashboardLayout ? 'h-28 sm:h-32 lg:h-36' : 'h-28 sm:h-32 lg:h-36'} w-auto transition-all duration-300 hover:opacity-90 filter drop-shadow-sm text-blue-600`}
                fill="currentColor"
              >
                <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)">
                  <path d="M3010 6205 c-359 -80 -640 -351 -737 -712 -24 -89 -27 -114 -27 -273
1 -200 14 -268 83 -415 47 -100 83 -155 157 -235 144 -155 335 -263 534 -301
83 -16 307 -16 385 0 312 64 567 262 701 544 64 137 78 210 78 412 0 165 -2
186 -24 252 l-25 72 -75 -90 -75 -90 -1 -157 c0 -175 -13 -234 -80 -362 -94
-179 -271 -321 -469 -376 -92 -25 -285 -30 -386 -9 -304 61 -527 282 -594 589
-21 95 -16 296 9 391 66 242 254 451 484 535 164 60 374 60 550 -1 30 -10 59
-19 63 -19 6 0 70 91 103 148 9 15 -68 52 -171 84 -90 27 -383 35 -483 13z"/>
                  <path d="M3960 5956 c-42 -57 -702 -879 -728 -908 l-25 -27 -214 207 c-118
114 -218 208 -222 210 -5 1 -38 -30 -75 -69 l-67 -73 38 -36 c308 -298 545
-521 551 -518 13 5 69 71 302 358 123 151 311 382 417 512 106 130 193 241
193 246 0 8 -134 132 -142 132 -1 0 -14 -16 -28 -34z"/>
                  <path d="M7117 5776 c-62 -17 -121 -74 -136 -130 -6 -22 -13 -71 -14 -108 l-2
-68 -62 0 -63 0 0 -85 0 -85 59 0 c48 0 61 -3 64 -17 3 -10 5 -134 4 -276 l-2
-257 103 0 102 0 0 275 0 275 80 0 80 0 0 85 0 85 -80 0 -80 0 0 39 c0 63 14
88 56 100 21 6 48 8 60 5 22 -6 23 -3 26 76 2 45 -1 84 -6 87 -20 13 -144 12
-189 -1z"/>
                  <path d="M6568 5751 c-40 -35 -51 -75 -36 -129 12 -44 59 -72 122 -72 41 0 53
5 82 34 29 29 34 41 34 80 0 36 -6 52 -28 77 -24 27 -37 33 -84 37 -50 4 -58
2 -90 -27z"/>
                  <path d="M7434 5762 c-97 -61 -53 -212 62 -212 88 0 141 54 131 133 -8 59 -43
89 -109 94 -40 3 -60 -1 -84 -15z"/>
                  <path d="M8992 5575 c1 -107 0 -195 -3 -195 -3 0 -18 13 -33 29 -97 101 -296
91 -406 -19 -82 -82 -123 -222 -103 -351 20 -128 83 -219 186 -268 126 -60
238 -48 328 36 l49 46 0 -52 0 -51 90 0 90 0 0 510 0 510 -101 0 -101 0 4
-195z m-109 -279 c81 -33 126 -135 107 -238 -12 -64 -34 -96 -86 -125 -120
-69 -254 25 -254 177 0 143 116 235 233 186z"/>
                  <path d="M4310 5716 c0 -6 147 -359 240 -576 50 -118 108 -254 128 -302 l37
-88 111 0 111 0 191 468 c105 257 192 474 194 482 2 12 -14 16 -96 18 -56 1
-104 -2 -109 -7 -9 -9 -231 -564 -264 -661 -9 -25 -19 -49 -23 -53 -6 -7 -114
250 -258 611 l-44 112 -109 0 c-60 0 -109 -2 -109 -4z"/>
                  <path d="M9260 5624 l0 -96 118 3 117 4 3 -392 2 -393 105 0 105 0 0 393 0
393 120 -2 120 -2 0 94 0 94 -345 0 -345 0 0 -96z"/>
                  <path d="M10840 5570 l0 -100 -60 0 -60 0 0 -85 0 -85 59 0 59 0 4 -192 c3
-168 6 -199 24 -238 42 -92 118 -130 257 -130 109 0 108 0 105 94 l-3 81 -46
-3 c-26 -2 -62 3 -81 11 -47 20 -58 66 -58 241 l0 136 85 0 85 0 0 85 0 85
-85 0 -85 0 0 100 0 100 -100 0 -100 0 0 -100z"/>
                  <path d="M5485 5471 c-104 -27 -197 -110 -237 -210 -31 -80 -31 -222 2 -305
45 -117 150 -198 279 -216 167 -24 303 37 367 162 13 26 24 52 24 58 0 6 -34
10 -88 10 -78 0 -91 -3 -108 -21 -35 -39 -73 -51 -140 -47 -74 5 -107 25 -141
84 -45 77 -55 74 232 74 l255 0 0 58 c-1 156 -68 274 -190 330 -43 20 -74 26
-140 29 -47 1 -98 -1 -115 -6z m180 -165 c22 -10 41 -28 54 -55 37 -73 40 -71
-139 -71 -121 0 -160 3 -160 13 1 27 47 91 80 108 42 23 117 25 165 5z"/>
                  <path d="M6334 5469 c-33 -9 -78 -47 -106 -89 -17 -25 -17 -25 -17 33 l-1 57
-100 0 -100 0 0 -360 0 -360 105 0 105 0 0 202 c0 186 2 205 21 246 27 54 79
81 157 82 l52 0 0 100 0 100 -42 -1 c-24 0 -57 -5 -74 -10z"/>
                  <path d="M7923 5461 c-178 -61 -275 -279 -214 -479 39 -128 150 -223 283 -241
115 -16 217 7 294 65 32 24 87 102 99 142 6 22 5 22 -87 22 -82 0 -95 -2 -105
-20 -7 -11 -26 -26 -42 -35 -37 -19 -129 -22 -162 -5 -54 28 -99 87 -99 130 0
20 5 20 256 20 l257 0 -8 82 c-11 135 -53 218 -138 277 -87 60 -231 78 -334
42z m233 -171 c25 -24 54 -77 54 -100 0 -6 -57 -10 -160 -10 -121 0 -160 3
-160 13 0 19 40 80 64 97 36 26 50 30 113 27 50 -2 68 -8 89 -27z"/>
                  <path d="M11499 5461 c-75 -24 -141 -73 -183 -135 -53 -77 -69 -140 -64 -245
5 -112 36 -179 113 -250 192 -175 526 -106 616 128 32 81 32 226 1 296 -35 77
-69 121 -125 159 -94 64 -243 84 -358 47z m188 -162 c41 -15 91 -67 104 -108
7 -19 12 -58 12 -86 0 -125 -64 -195 -179 -195 -85 0 -145 53 -164 146 -34
163 89 295 227 243z"/>
                  <path d="M12390 5458 c-26 -13 -55 -39 -69 -60 -13 -21 -28 -35 -32 -32 -5 3
-9 27 -9 55 l0 49 -95 0 -95 0 0 -360 0 -360 103 0 102 0 -3 177 c-4 216 5
270 53 312 34 30 62 38 140 43 l40 3 3 98 2 97 -48 0 c-30 0 -65 -8 -92 -22z"/>
                  <path d="M12730 5465 c-95 -30 -160 -116 -160 -211 1 -107 70 -166 251 -210
135 -33 159 -46 159 -84 0 -44 -40 -70 -107 -70 -68 0 -117 22 -133 61 -12 29
-12 29 -101 29 -99 0 -99 1 -74 -71 25 -69 62 -108 132 -142 57 -26 76 -30
156 -30 194 -1 306 83 307 231 0 129 -65 180 -290 227 -93 20 -122 37 -118 72
5 40 50 68 106 65 52 -2 90 -24 110 -65 13 -26 16 -27 99 -27 l85 0 -7 37
c-17 91 -80 162 -167 188 -63 18 -187 18 -248 0z"/>
                  <path d="M6543 5110 l2 -360 103 0 102 0 0 360 0 360 -104 0 -104 0 1 -360z"/>
                  <path d="M7405 5110 l0 -360 103 0 102 0 0 360 0 360 -102 0 -103 0 0 -360z"/>
                  <path d="M9972 5203 c3 -255 4 -270 26 -319 28 -62 62 -96 122 -123 111 -48
214 -36 291 36 l48 44 6 -45 7 -46 95 0 c83 0 94 2 89 16 -3 9 -6 171 -6 360
l0 344 -100 0 -100 0 0 -220 c0 -165 -3 -229 -14 -254 -42 -101 -191 -111
-238 -16 -16 30 -18 66 -18 263 l0 227 -106 0 -105 0 3 -267z"/>
                </g>
              </svg>
            </Link>
          </div>

          {/* Right Section - Navigation and Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications - Always visible */}
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200/50"
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
            )}

            {/* Desktop Navigation */}
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
                              to={dashboardLink}
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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 border border-transparent hover:border-blue-200/50"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-soft">
          <div className="px-3 pt-3 pb-4 space-y-2">
            
            {isAuthenticated ? (
              <>
                {/* User Info in Mobile Menu */}
                <div className="px-4 py-3 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-xl mb-2">
                  <div className="flex items-center space-x-3">
                    {user?.profileImage ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover border-2 border-white shadow-soft"
                        src={user.profileImage}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-white shadow-soft">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to={dashboardLink}
                  className="block px-4 py-3.5 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {/* Quick Actions for Dashboard */}
                {isDashboardPage && (
                  <Link
                    to="/"
                    className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-3" />
                      Home
                    </div>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200/50"
                >
                  <div className="flex items-center">
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </div>
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