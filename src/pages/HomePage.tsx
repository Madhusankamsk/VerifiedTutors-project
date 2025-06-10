import React from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, Star, Award, BookOpen, ArrowRight } from 'lucide-react';
import { SUBJECT_AREAS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - modernized with cleaner design */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 relative">
          <div className="md:w-3/4 lg:w-2/3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
              Find Trusted Tutors in Sri Lanka
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-light max-w-2xl">
              Connect with verified, experienced tutors for online, home-visit, or group classes
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/tutors" 
                className="btn bg-white text-primary-700 hover:bg-gray-50 px-6 py-3 text-base font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
              >
                Find a Tutor <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="btn bg-accent-500 text-white hover:bg-accent-600 px-6 py-3 text-base font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Become a Tutor
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Modern curved divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="h-full w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,128L80,138.7C160,149,320,171,480,165.3C640,160,800,128,960,122.7C1120,117,1280,139,1360,149.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Search by Subject Section - card-based grid layout */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse Tutors by Subject</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find specialized tutors across a wide range of subjects to help you excel in your studies
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {SUBJECT_AREAS.slice(0, 8).map((subject) => (
              <Link
                key={subject}
                to={`/tutors?subject=${encodeURIComponent(subject)}`}
                className="group flex flex-col items-center p-4 sm:p-5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md"
              >
                <div className="bg-primary-50 p-3 rounded-full mb-3 group-hover:bg-primary-100 transition-colors duration-300">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-center font-medium text-gray-800 text-sm sm:text-base">{subject}</span>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/tutors" 
              className="inline-flex items-center px-6 py-2.5 text-primary-600 rounded-full hover:bg-primary-50 transition-all duration-300 font-medium"
            >
              View All Subjects <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works Section - modern process steps */}
      <div className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How VerifiedTutors Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect with qualified tutors in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Search for Tutors",
                description: "Browse through our extensive list of verified tutors based on subject, location, price, and ratings"
              },
              {
                icon: CheckCircle,
                title: "Choose Your Perfect Match",
                description: "Review tutor profiles, qualifications, teaching methods, and read student reviews"
              },
              {
                icon: Star,
                title: "Start Learning",
                description: "Connect with your chosen tutor for online, home-visit, or group classes and track your progress"
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <step.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section - clean card design */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose VerifiedTutors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality tutoring experience for students across Sri Lanka
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Verified Tutors",
                description: "All tutors are thoroughly vetted through our verification process, ensuring you're learning from qualified professionals"
              },
              {
                title: "Diverse Teaching Methods",
                description: "Choose from various teaching approaches that best suit your learning style and educational needs"
              },
              {
                title: "Flexible Learning Options",
                description: "Select from online sessions, home visits, or group classes based on your preference and availability"
              },
              {
                title: "Transparent Reviews",
                description: "Read authentic reviews and ratings from other students to make informed decisions"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start bg-gray-50 p-6 rounded-xl hover:shadow-sm transition-all duration-300">
                <div className="flex-shrink-0 mr-4">
                  <div className="bg-accent-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-accent-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - simplified and modern */}
      <div className="bg-primary-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Tutor?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already found their ideal tutors on VerifiedTutors
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/tutors" 
              className="btn bg-white text-primary-700 hover:bg-gray-50 px-6 py-3 text-base font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Browse Tutors
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/register" 
                className="btn bg-primary-800 text-white hover:bg-primary-900 border border-white/20 px-6 py-3 text-base font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;