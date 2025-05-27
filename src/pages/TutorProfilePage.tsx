import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTutor } from '../contexts/TutorContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Star, MapPin, BookOpen, GraduationCap, Briefcase, FileText } from 'lucide-react';

const TutorProfilePage = () => {
  const { id } = useParams();
  const { profile, loading, error, fetchProfile } = useTutor();

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id, fetchProfile]);

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tutor Not Found</h2>
          <p className="text-gray-600">The tutor profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
              <span className="text-4xl text-blue-600 font-semibold">
                {profile.user.name.charAt(0)}
              </span>
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{profile.user.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="ml-1">{profile.rating.toFixed(1)}</span>
                  <span className="ml-1 text-blue-100">({profile.totalReviews} reviews)</span>
                </div>
                {profile.isVerified && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                    Verified Tutor
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* About Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-600">{profile.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-600">{profile.user.email}</p>
              </div>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Subjects & Rates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.subjects.map((subject, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium">{subject.subject.name}</h3>
                  <p className="text-gray-600">${subject.hourlyRate}/hour</p>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Availability:</h4>
                    <div className="mt-1 space-y-1">
                      {subject.availability.map((slot, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {slot.day}: {slot.slots.map(s => `${s.start}-${s.end}`).join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Education
            </h2>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-gray-500 text-sm">Graduated: {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Experience
            </h2>
            <div className="space-y-4">
              {profile.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-gray-600">{exp.institution}</p>
                  <p className="text-gray-500 text-sm">{exp.duration}</p>
                  <p className="text-gray-600 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Locations Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Teaching Locations
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.locations.map((location, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {location.name}
                </span>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          {profile.documents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.documents.map((doc, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium capitalize">{doc.type}</h3>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                      {doc.verified && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;