import React from 'react';
import { Calendar, Clock, BookOpen, MessageSquare, ChevronRight, TrendingUp, Award, Users } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="font-medium text-gray-900">John Doe</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Progress</h2>
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-6">
              <div className="bg-primary-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-medium">Upcoming Sessions</p>
                  <Clock className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">3</p>
              </div>
              <div className="bg-green-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-medium">Completed Sessions</p>
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">12</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <BookOpen className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50/50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-800 font-medium">Math Session with John Doe</p>
                    <p className="text-sm text-gray-500 mt-1">Yesterday at 2:00 PM</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-800 font-medium">Physics Assignment Submitted</p>
                    <p className="text-sm text-gray-500 mt-1">2 days ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
              <Users className="w-6 h-6 text-primary-500" />
            </div>
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Book New Session</span>
              </button>
              <button className="w-full bg-white/50 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 border border-gray-200">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>View Schedule</span>
              </button>
              <button className="w-full bg-white/50 backdrop-blur-sm text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 border border-gray-200">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <span>Message Tutor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;