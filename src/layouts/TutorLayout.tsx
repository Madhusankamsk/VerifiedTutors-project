import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTutor } from '../contexts/TutorContext';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardLayout from './DashboardLayout';

const TutorLayout: React.FC = () => {
  const { logout } = useAuth();
  const { profile, loading, error } = useTutor();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { 
      path: '/tutor/dashboard', 
      name: 'Dashboard', 
      icon: <Icon name="LayoutDashboard" className="h-6 w-6" />
    },
    { 
      path: '/tutor/profile', 
      name: 'My Profile', 
      icon: <Icon name="User" className="h-6 w-6" />
    },
    { 
      path: '/tutor/bookings', 
      name: 'My Bookings', 
      icon: <Icon name="Calendar" className="h-6 w-6" />
    },
    // { 
    //   path: '/tutor/blogs', 
    //   name: 'My Blogs', 
    //   icon: <Icon name="BookOpen" className="h-6 w-6" />
    // },
    { 
      path: '#', 
      name: 'Logout', 
      icon: <Icon name="LogOut" className="h-6 w-6" />,
      onClick: handleLogout 
    },
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

  const currentPage = sidebarItems.find((item) => item.path === location.pathname)?.name || 'Tutor Dashboard';

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title={currentPage}
    />
  );
};

export default TutorLayout;