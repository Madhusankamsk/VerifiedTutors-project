import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, CheckCircle, Star, Users, Sparkles, TrendingUp, Award, AlertTriangle } from 'lucide-react';
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

  // Subject icons mapping with enhanced variety
  const getSubjectIcon = (subjectName: string) => {
    const icons = {
      'Mathematics': '🔢',
      'Maths O/L': '🔢',
      'Combined Maths': '📐',
      'Physics': '⚡',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'Science O/L': '🔬',
      'English': '🇬🇧',
      'English O/L': '🇬🇧',
      'ICT O/L': '💻',
      'ICT A/L': '💻',
      'Computer Science': '💻',
      'Sinhala': '🇱🇰',
      'History': '📜',
      'Geography': '🌍',
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

  // Enhanced color variants for subject cards
  const getSubjectColor = (index: number) => {
    const colors = [
      'from-blue-500/10 to-blue-600/20 border-blue-200/50',
      'from-indigo-500/10 to-indigo-600/20 border-indigo-200/50',
      'from-sky-500/10 to-sky-600/20 border-sky-200/50',
      'from-cyan-500/10 to-cyan-600/20 border-cyan-200/50',
      'from-blue-500/10 to-blue-600/20 border-blue-200/50',
      'from-indigo-500/10 to-indigo-600/20 border-indigo-200/50',
      'from-sky-500/10 to-sky-600/20 border-sky-200/50',
      'from-cyan-500/10 to-cyan-600/20 border-cyan-200/50',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200/50 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Discover Your Perfect Learning Path</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-900 bg-clip-text text-transparent mb-6 leading-tight">
            Choose Your Subject
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with expert tutors across all subjects. Browse our comprehensive collection and find the perfect match for your learning journey.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 rounded-2xl p-8 max-w-md mx-auto shadow-soft">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-red-700 font-medium">Unable to load subjects</p>
              <p className="text-red-600 text-sm mt-1">Please refresh the page or try again later</p>
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        {!loading && !error && subjects && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 mb-16">
            {subjects.map((subject, index) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="group relative overflow-hidden"
              >
                <div className={`
                  relative bg-gradient-to-br ${getSubjectColor(index)} 
                  backdrop-blur-sm rounded-2xl p-6 min-h-[200px] flex flex-col
                  border transition-all duration-500 ease-out
                  hover:shadow-xl hover:shadow-blue-500/10 
                  hover:-translate-y-2 hover:scale-105
                  transform perspective-1000
                `}>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  
                  {/* Subject Icon */}
                  <div className="text-center mb-6 relative z-10">
                    <div className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                      {getSubjectIcon(subject.name)}
                    </div>
                  </div>

                  {/* Subject Info */}
                  <div className="text-center relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 group-hover:text-blue-700 transition-colors duration-300 line-clamp-1">
                        {subject.name}
                      </h3>
                      
                      {/* Subject Description */}
                      {subject.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                          {subject.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                          <Users className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">
                            {loadingCounts ? '...' : (subjectTutorCounts[subject._id] || 0)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        Explore topics
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
              </Link>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-gray-100/50 p-8 sm:p-10 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                  {loadingCounts ? '...' : Object.values(subjectTutorCounts).reduce((sum, count) => sum + count, 0)}+
                </div>
                <div className="text-gray-600 font-medium flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Verified Tutors
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-6 mb-4 group-hover:from-sky-100 group-hover:to-sky-200 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <div className="text-gray-600 font-medium flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-sky-600" />
                  Subjects Available
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 mb-4 group-hover:from-indigo-100 group-hover:to-indigo-200 transition-all duration-300">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  1000+
                </div>
                <div className="text-gray-600 font-medium flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  Happy Students
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Get started with your learning journey in three simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Choose Subject",
                description: "Select your subject from our comprehensive collection of topics",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100"
              },
              {
                icon: CheckCircle,
                title: "Find Tutor",
                description: "Browse verified tutors with detailed profiles and student reviews",
                color: "from-sky-500 to-sky-600",
                bgColor: "from-sky-50 to-sky-100"
              },
              {
                icon: Star,
                title: "Start Learning",
                description: "Book sessions and begin your personalized learning experience",
                color: "from-indigo-500 to-indigo-600",
                bgColor: "from-indigo-50 to-indigo-100"
              }
            ].map((step, index) => (
              <div key={index} className="group relative">
                <div className={`bg-gradient-to-br ${step.bgColor} rounded-3xl p-8 h-full transition-all duration-300 group-hover:shadow-lg border border-gray-100/50`}>
                  <div className={`bg-gradient-to-r ${step.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Step connector */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 transform -translate-y-1/2 z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;