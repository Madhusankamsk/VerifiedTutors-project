import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/common/Icon';
import DashboardLayout from './DashboardLayout';

const StudentLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { 
      path: '/student/dashboard', 
      name: 'Dashboard', 
      icon: <Icon name="LayoutDashboard" className="h-6 w-6" />
    },
    { 
      path: '/student/bookings', 
      name: 'My Bookings', 
      icon: <Icon name="Calendar" className="h-6 w-6" />
    },
    { 
      path: '/student/favorites', 
      name: 'Favorite Tutors', 
      icon: <Icon name="Heart" className="h-6 w-6" />
    },
    { 
      path: '/tutors', 
      name: 'Find Tutors', 
      icon: <Icon name="Search" className="h-6 w-6" />
    },
    
  ];

  const currentPage = sidebarItems.find((item) => item.path === location.pathname)?.name || 'Student Dashboard';

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={currentPage}
    />
  );
};

export default StudentLayout; 