import React from 'react';

const TutorDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tutor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          <p className="text-gray-600">No upcoming sessions scheduled</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
          <p className="text-gray-600">No new messages</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Stats</h2>
          <p className="text-gray-600">Profile views: 0</p>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;