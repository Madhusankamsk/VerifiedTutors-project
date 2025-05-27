import React, { useEffect } from 'react';
import { useTutor } from '../../contexts/TutorContext';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, MapPin, Star, FileText, Clock, Users, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TutorDashboard = () => {
  const { profile, loading, error, reviews, fetchProfile, fetchReviews } = useTutor();

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, [fetchProfile, fetchReviews]);

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

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">Please complete your tutor profile to get started.</p>
          <Link to="/tutor/profile/edit" className="mt-4 inline-block btn btn-primary">
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total earnings (placeholder - replace with actual calculation)
  const totalEarnings = profile.subjects.reduce((sum, subject) => sum + subject.hourlyRate * 10, 0);

  // Calculate total students (placeholder - replace with actual calculation)
  const totalStudents = reviews.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-xl">
              {profile.user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.user.name}</h2>
            <div className="flex items-center mt-1 space-x-4">
              <div className="flex items-center text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>{profile.rating.toFixed(1)}</span>
                <span className="ml-1">({profile.totalReviews} reviews)</span>
              </div>
              {profile.isVerified && (
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-sm">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-lg font-semibold text-gray-900">${totalEarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-lg font-semibold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Star className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-lg font-semibold text-gray-900">{profile.rating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-lg font-semibold text-gray-900">{profile.subjects.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Sessions
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-4">
              No upcoming sessions
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Recent Reviews
            </h3>
          </div>
          <div className="p-6">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-medium">{review.studentName}</span>
                        <div className="flex items-center ml-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm">{review.rating}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No reviews yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;