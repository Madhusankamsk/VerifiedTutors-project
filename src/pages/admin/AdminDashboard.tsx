import React, { useEffect, useCallback } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Users, BookOpen, Clock, DollarSign, AlertCircle, CheckCircle, TrendingUp, Shield, GraduationCap } from 'lucide-react';

const AdminDashboard = () => {
  const { stats, loading, error, fetchDashboardStats } = useAdmin();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        <div className="animate-pulse relative">
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6 shadow-lg relative">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
            <div>
              <strong className="font-bold text-red-700">Error!</strong>
              <span className="block sm:inline text-red-600 mt-1"> {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tutors',
      value: stats.totalTutors,
      icon: GraduationCap,
      gradient: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50/50'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50/50'
    },
    {
      title: 'Active Subjects',
      value: stats.activeSubjects,
      icon: BookOpen,
      gradient: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50/50'
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Shield,
      gradient: 'from-yellow-600 to-yellow-700',
      bgColor: 'bg-yellow-50/50'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Clock,
      gradient: 'from-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50/50'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-500">Last updated: Just now</span>
          </div>
        </div>

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
                <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  <span>+12% from last month</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;