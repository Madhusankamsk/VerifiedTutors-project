import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, ChevronRight, User, LogOut, Settings } from 'lucide-react';
import Header from '../components/common/Header';
import DashboardFooter from '../components/common/DashboardFooter';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: string;
}

interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ sidebarItems, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 bg-white shadow-xl border-r border-slate-200/60 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64`}
        style={{ height: 'calc(100vh - 0px)' }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VT</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">VerifiedTutors</h1>
              </div>
            )}
            
            {/* Desktop collapse button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-6 overflow-y-auto ${
            isCollapsed ? 'px-2 space-y-3' : 'px-4 space-y-2'
          }`}>
            {/* Dashboard Title */}
            {!isCollapsed && (
              <div className="px-3 py-2 mb-6">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {title}
                </h2>
              </div>
            )}

            {/* Collapsed State Brand */}
            {isCollapsed && (
              <div className="flex justify-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VT</span>
                </div>
              </div>
            )}

            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.path} className={`${isCollapsed ? 'flex justify-center' : ''} ${isCollapsed ? 'group relative' : ''}`}>
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center justify-center transition-all duration-200 ${
                      isCollapsed
                        ? `w-12 h-12 min-w-12 min-h-12 rounded-full ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`
                        : `px-3 py-2.5 text-sm font-medium rounded-xl ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`
                    }`}
                  >
                    {/* Icon */}
                    <span className={`flex-shrink-0 w-5 h-5 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}>
                      {item.icon}
                    </span>
                    
                    {/* Label */}
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </>
                    )}

                    {/* Badge for collapsed state */}
                    {isCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{item.badge}</span>
                      </span>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[70] shadow-lg pointer-events-none">
                      <div className="flex items-center space-x-2">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className={`border-t border-slate-200/60 p-4 mb-16 ${
            isCollapsed ? 'border-t-0' : ''
          }`}>
            {/* Collapsed State Divider */}
            {isCollapsed && (
              <div className="flex justify-center mb-6">
                <div className="w-8 h-px bg-slate-200"></div>
              </div>
            )}

            {!isCollapsed ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-3 py-2">
                  {user?.profileImage ? (
                    <img
                      className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200"
                      src={user.profileImage}
                      alt={user.name}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button 
                    onClick={logout}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Avatar for collapsed state */}
                <div className="flex justify-center">
                  {user?.profileImage ? (
                    <img
                      className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200"
                      src={user.profileImage}
                      alt={user.name}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Settings Button */}
                <div className="flex justify-center group relative">
                  <button className="w-12 h-12 min-w-12 min-h-12 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-600" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[70] shadow-lg pointer-events-none">
                    Settings
                    {/* Tooltip arrow */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-900"></div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="flex justify-center group relative">
                  <button 
                    onClick={logout}
                    className="w-12 h-12 min-w-12 min-h-12 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[70] shadow-lg pointer-events-none">
                    Logout
                    {/* Tooltip arrow */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            {/* Page Title */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {/* <p className="text-sm text-slate-500 mt-1">
                  Welcome backs, {user?.name}
                </p> */}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardLayout; 