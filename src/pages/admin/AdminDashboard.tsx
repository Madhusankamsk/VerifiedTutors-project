import React, { useEffect, useCallback } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Users, BookOpen, Clock, DollarSign, AlertCircle, CheckCircle, TrendingUp, Shield, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { stats, loading, error, fetchDashboardStats } = useAdmin();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10"></div>
        
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-xl w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tutors',
      value: stats.totalTutors.toString(),
      icon: Users,
      gradient: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50/50',
      link: '/admin/tutors'
    },
    {
      title: 'Active Subjects',
      value: stats.activeSubjects.toString(),
      icon: Shield,
      gradient: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50/50'
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications.toString(),
      icon: AlertCircle,
      gradient: 'from-yellow-600 to-yellow-700',
      bgColor: 'bg-yellow-50/50'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: GraduationCap,
      gradient: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50/50'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toString(),
      icon: BookOpen,
      gradient: 'from-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50/50',
      link: '/admin/bookings'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-emerald-600 to-emerald-700',
      bgColor: 'bg-emerald-50/50'
    }
  ];

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -z-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 -z-10"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 -z-10"></div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your platform's performance and statistics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <span className="text-sm text-gray-500">Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`${stat.bgColor} backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{stat.title}</h2>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-4`}>
                {stat.value}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  <span>+12% from last month</span>
                </div>
                {stat.link && (
                  <Link 
                    to={stat.link} 
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/admin/tutors"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Manage Tutors</h3>
            <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-gray-600 text-sm">
            Review, verify, and manage tutor profiles and applications
          </p>
        </Link>

        <Link 
          to="/admin/bookings"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Manage Bookings</h3>
            <BookOpen className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-gray-600 text-sm">
            Monitor and manage all booking activities and transactions
          </p>
        </Link>

        <Link 
          to="/admin/subjects"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Manage Subjects</h3>
            <GraduationCap className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-gray-600 text-sm">
            Add, edit, and organize subjects and topics available on the platform
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;