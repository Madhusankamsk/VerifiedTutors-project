import React from 'react';

const StudentDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div>
              <p className="text-gray-600">Completed Sessions</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <p className="text-gray-800">Math Session with John Doe</p>
              <p className="text-sm text-gray-500">Yesterday at 2:00 PM</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-gray-800">Physics Assignment Submitted</p>
              <p className="text-sm text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Book New Session
            </button>
            <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors">
              View Schedule
            </button>
            <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors">
              Message Tutor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;