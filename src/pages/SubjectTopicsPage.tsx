import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Search, Users, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md mx-4 border border-gray-100 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
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
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md mx-4 border border-gray-100 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Subject Not Found</h2>
            <p className="text-gray-600 mb-6">The subject you're looking for doesn't exist.</p>
            <button
              onClick={handleBackClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-8000"></div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header Section */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleBackClick}
              className="mr-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {subject.name}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">{subject.description}</p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50/80 backdrop-blur-sm rounded-full text-blue-600 text-xs font-medium mb-4 border border-blue-100">
              <Sparkles className="h-3 w-3 mr-1.5" />
              Explore Topics
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Choose Your Learning Path
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Select a specific topic to find expert tutors who specialize in that area of {subject.name}.
            </p>
          </div>

        {/* Topics Grid */}
        {topics.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 max-w-md mx-auto border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Topics Available</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                No topics have been added for {subject.name} yet. Please check back later.
              </p>
              <button
                onClick={handleBackClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Go Back Home
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 mb-16">
            {topics.map((topic, index) => {
              const colors = [
                'from-blue-100/80 to-blue-200/80 border-blue-200/50',
                'from-sky-100/80 to-sky-200/80 border-sky-200/50',
                'from-indigo-100/80 to-indigo-200/80 border-indigo-200/50',
                'from-cyan-100/80 to-cyan-200/80 border-cyan-200/50',
                'from-blue-50/80 to-blue-100/80 border-blue-100/50',
                'from-slate-100/80 to-slate-200/80 border-slate-200/50'
              ];
              
              return (
                <button
                  key={topic._id}
                  onClick={() => handleTopicClick(topic)}
                  className="group relative overflow-hidden"
                >
                  <div className={`
                    relative bg-gradient-to-br ${colors[index % colors.length]} 
                    backdrop-blur-sm rounded-2xl p-6 min-h-[200px] flex flex-col
                    border transition-all duration-500 ease-out
                    hover:shadow-xl hover:shadow-blue-500/10 
                    hover:-translate-y-2 hover:scale-105
                    transform perspective-1000
                  `}>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    
                    {/* Topic Icon */}
                    <div className="text-center mb-6 relative z-10">
                      <div className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                        📚
                      </div>
                    </div>

                    {/* Topic Info */}
                    <div className="text-center relative z-10 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 group-hover:text-blue-700 transition-colors duration-300 line-clamp-1">
                          {topic.name}
                        </h3>
                        
                        {/* Topic Description */}
                        {topic.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                            {topic.description}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-700 font-medium">
                              {loadingCounts ? '...' : (topic.tutorCount || 0)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                          Find tutors
                        </p>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}




      </div>
    </div>
  );
};

export default SubjectTopicsPage; 