import React from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TutorProfilePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [tutor, setTutor] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/tutors/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tutor profile');
        }
        const data = await response.json();
        setTutor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, [id]);

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

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tutor Not Found</h2>
          <p className="text-gray-600">The tutor profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
              {tutor.profileImage ? (
                <img
                  src={tutor.profileImage}
                  alt={tutor.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-500">{tutor.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{tutor.name}</h1>
              <p className="text-blue-100">{tutor.subjects.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600">{tutor.bio}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject: string) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Experience & Qualifications</h2>
            <div className="space-y-4">
              {tutor.qualifications?.map((qualification: string, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                  <p className="text-gray-600">{qualification}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Teaching Locations</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.locations?.map((location: string) => (
                <span
                  key={location}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200">
            Contact Tutor
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;