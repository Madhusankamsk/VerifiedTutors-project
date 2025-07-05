import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Search, CheckCircle, Star, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubjects } from '../contexts/SubjectContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { subjects, loading, error } = useSubjects();
  const [subjectTutorCounts, setSubjectTutorCounts] = useState<{[key: string]: number}>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Fetch tutor counts for all subjects
  useEffect(() => {
    const fetchTutorCounts = async () => {
      if (subjects && subjects.length > 0) {
        try {
          setLoadingCounts(true);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects/tutor-counts`);
          if (response.ok) {
            const counts = await response.json();
            const countsMap: {[key: string]: number} = {};
            counts.forEach((item: any) => {
              countsMap[item.subjectId] = item.tutorCount;
            });
            setSubjectTutorCounts(countsMap);
          }
        } catch (error) {
          console.error('Error fetching tutor counts:', error);
        } finally {
          setLoadingCounts(false);
        }
      }
    };

    fetchTutorCounts();
  }, [subjects]);

  // Subject icons mapping for visual variety
  const getSubjectIcon = (subjectName: string) => {
    const icons = {
      'Mathematics': '🔢',
      'Physics': '⚡',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'English': '📚',
      'Sinhala': '🇱🇰',
      'History': '📜',
      'Geography': '🌍',
      'Computer Science': '💻',
      'Economics': '💰',
      'Business Studies': '🏢',
      'Accounting': '📊',
      'Literature': '📖',
      'Art': '🎨',
      'Music': '🎵',
      'Physical Education': '⚽',
      'Religious Studies': '🙏',
      'Agriculture': '🌾',
      'Technology': '🔧',
      'Psychology': '🧠'
    };
    
    return icons[subjectName as keyof typeof icons] || '📚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content - Subject Focused */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Subject
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find specialized tutors for any subject. Click on a subject to browse qualified tutors.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">Error loading subjects. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        {!loading && !error && subjects && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:scale-105 transform"
              >
                {/* Subject Icon */}
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {getSubjectIcon(subject.name)}
                  </div>
                  <div className="bg-primary-50 p-2 rounded-full mx-auto w-12 h-12 flex items-center justify-center group-hover:bg-primary-100 transition-colors duration-300">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                </div>

                {/* Subject Name */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-primary-700 transition-colors duration-300">
                    {subject.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Users className="h-3 w-3 text-primary-600" />
                    <span className="text-xs text-primary-600 font-medium">
                      {loadingCounts ? '...' : (subjectTutorCounts[subject._id] || 0)} tutors
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click to browse topics</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Arrow Icon on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="h-5 w-5 text-primary-600" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {loadingCounts ? '...' : Object.values(subjectTutorCounts).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-gray-600">Verified Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Subjects Available</div>
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
                title: "Choose Subject",
                description: "Select your subject from our comprehensive list"
              },
              {
                icon: CheckCircle,
                title: "Find Tutor",
                description: "Browse verified tutors with reviews and ratings"
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

export default HomePage;