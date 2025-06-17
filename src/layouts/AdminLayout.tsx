import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, BookOpen, MapPin, LogOut, Calendar } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { path: '/admin/tutors', name: 'Manage Tutors', icon: <Users className="h-6 w-6" /> },
    { path: '/admin/subjects', name: 'Manage Subjects', icon: <BookOpen className="h-6 w-6" /> },
    { path: '/admin/locations', name: 'Manage Locations', icon: <MapPin className="h-6 w-6" /> },
    { path: '/admin/bookings', name: 'Manage Bookings', icon: <Calendar className="h-6 w-6" /> },
    { 
      path: '#', 
      name: 'Logout', 
      icon: <LogOut className="h-6 w-6" />,
      onClick: handleLogout 
    },
  ];

  const currentPage = sidebarItems.find((item) => item.path === location.pathname)?.name || 'Admin Dashboard';

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={currentPage}
    />
  );
};

export default AdminLayout;