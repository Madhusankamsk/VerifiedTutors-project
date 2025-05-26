import React from 'react';
import { useTutor } from '../../contexts/TutorContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TutorDashboard = () => {
  const { tutor, loading, error } = useTutor();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tutor || !tutor.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">Please complete your tutor profile to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-4">
            {tutor.user?.profileImage ? (
              <img
                src={tutor.user.profileImage}
                alt={tutor.user.name || 'Tutor'}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-xl">
                  {(tutor.user?.name || 'T').charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{tutor.user?.name || 'Tutor'}</h2>
              <p className="text-gray-600">{tutor.subjects?.length || 0} subjects</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Gender:</span> {tutor.gender || 'Not specified'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Mobile:</span> {tutor.mobileNumber || 'Not specified'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Rating:</span> {(tutor.rating || 0).toFixed(1)} ({tutor.totalRatings || 0} reviews)
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Hourly Rate:</span> ${tutor.hourlyRate || 0}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Status:</span>{' '}
              <span className={tutor.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                {tutor.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </p>
          </div>
        </div>

        {/* Teaching Locations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Teaching Locations</h2>
          <div className="space-y-2">
            {tutor.locations?.length > 0 ? (
              tutor.locations.map((location) => (
                <div key={location._id} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  {location.name}, {location.province}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No locations specified</p>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            <p className="text-gray-600">No upcoming sessions scheduled</p>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
          <div className="space-y-4">
            <p className="text-gray-600">No new messages</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">0</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">0</p>
              <p className="text-sm text-gray-600">Hours Taught</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{tutor.totalRatings || 0}</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">0</p>
              <p className="text-sm text-gray-600">Earnings</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full btn btn-primary">Update Availability</button>
            <button className="w-full btn btn-secondary">View Messages</button>
            <button className="w-full btn btn-outline">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;