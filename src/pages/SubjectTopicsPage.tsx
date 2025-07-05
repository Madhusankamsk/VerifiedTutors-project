import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search, Users, Star } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Topic {
  _id: string;
  name: string;
  description: string;
  subject: string;
  isActive: boolean;
  tutorCount?: number;
}

interface Subject {
  _id: string;
  name: string;
  description: string;
}

const SubjectTopicsPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Fetch subject and topics data
  useEffect(() => {
    if (subjectId) {
      fetchSubjectAndTopics();
    }
  }, [subjectId]);

  const fetchSubjectAndTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subject details
      const subjectResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectId}`);
      if (!subjectResponse.ok) {
        throw new Error('Subject not found');
      }
      const subjectData = await subjectResponse.json();
      setSubject(subjectData);

      // Fetch topics for this subject
      const topicsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/subject/${subjectId}`);
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        setTopics(topicsData.filter((topic: Topic) => topic.isActive));
        
        // Fetch tutor counts for topics
        if (subjectId) {
          await fetchTopicTutorCounts(subjectId);
        }
      } else {
        throw new Error('Failed to fetch topics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    // Navigate to tutor listing page with subject and topic filters
    navigate(`/tutors?subject=${encodeURIComponent(subject?.name || '')}&topic=${encodeURIComponent(topic.name)}`);
  };

  const fetchTopicTutorCounts = async (subjectId: string) => {
    try {
      setLoadingCounts(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/subject/${subjectId}/tutor-counts`);
      if (response.ok) {
        const topicCounts = await response.json();
        setTopics(prevTopics => 
          prevTopics.map(topic => {
            const countData = topicCounts.find((item: any) => item.topicId === topic._id);
            return {
              ...topic,
              tutorCount: countData?.tutorCount || 0
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching topic tutor counts:', error);
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackClick}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Subject Not Found</h2>
            <p className="text-gray-600 mb-6">The subject you're looking for doesn't exist.</p>
            <button
              onClick={handleBackClick}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={handleBackClick}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
              <p className="text-sm text-gray-600">{subject.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose a Topic
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a specific topic to find tutors who specialize in that area of {subject.name}.
          </p>
        </div>

        {/* Topics Grid */}
        {topics.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Topics Available</h3>
              <p className="text-gray-600 mb-6">
                No topics have been added for {subject.name} yet. Please check back later.
              </p>
              <button
                onClick={handleBackClick}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go Back Home
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topics.map((topic) => (
              <button
                key={topic._id}
                onClick={() => handleTopicClick(topic)}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:scale-105 transform text-left"
              >
                {/* Topic Icon */}
                <div className="text-center mb-4">
                  <div className="bg-primary-50 p-3 rounded-full mx-auto w-16 h-16 flex items-center justify-center group-hover:bg-primary-100 transition-colors duration-300 mb-3">
                    <BookOpen className="h-8 w-8 text-primary-600" />
                  </div>
                </div>

                {/* Topic Name */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-700 transition-colors duration-300 mb-2">
                    {topic.name}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {topic.description}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Users className="h-3 w-3 text-primary-600" />
                    <span className="text-xs text-primary-600 font-medium">
                      {loadingCounts ? '...' : (topic.tutorCount || 0)} tutors
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 mt-2 font-medium">
                    Click to find tutors
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{topics.length}</div>
              <div className="text-gray-600">Topics Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {loadingCounts ? '...' : topics.reduce((sum, topic) => sum + (topic.tutorCount || 0), 0)}
              </div>
              <div className="text-gray-600">Total Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Verified Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
          </div>
        </div>

        {/* How it Works - Simplified */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Choose Topic",
                description: "Select a specific topic from the list above"
              },
              {
                icon: Users,
                title: "Find Tutors",
                description: "Browse tutors who specialize in that topic"
              },
              {
                icon: Star,
                title: "Start Learning",
                description: "Book sessions and begin your learning journey"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectTopicsPage; 