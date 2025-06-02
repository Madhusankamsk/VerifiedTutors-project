import React from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, Star, Award, BookOpen } from 'lucide-react';
import { SUBJECT_AREAS } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 relative">
          <div className="md:w-2/3 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">
              Find Trusted Tutors in Sri Lanka
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-10 text-primary-100 font-light">
              Connect with verified, experienced tutors for online, home-visit, or group classes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link 
                to="/tutors" 
                className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 text-lg text-center rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Find a Tutor
              </Link>
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="btn bg-accent-500 text-white hover:bg-accent-600 px-8 py-4 text-lg text-center rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Become a Tutor
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-32">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="h-full w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,128L48,112C96,96,192,64,288,64C384,64,480,96,576,106.7C672,117,768,107,864,101.3C960,96,1056,96,1152,106.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Search by Subject Section */}
      <div className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Browse Tutors by Subject</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Find specialized tutors across a wide range of subjects to help you excel in your studies
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {SUBJECT_AREAS.slice(0, 8).map((subject) => (
              <Link
                key={subject}
                to={`/tutors?subject=${encodeURIComponent(subject)}`}
                className="group flex flex-col items-center p-6 sm:p-8 bg-white hover:bg-primary-50 rounded-2xl transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="bg-primary-50 p-4 rounded-xl mb-4 group-hover:bg-primary-100 transition-colors duration-300">
                  <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" />
                </div>
                <span className="text-center font-medium text-gray-800 text-base sm:text-lg">{subject}</span>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10 sm:mt-12">
            <Link 
              to="/tutors" 
              className="inline-block px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 font-medium"
            >
              View All Subjects
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">How VerifiedTutors Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Our platform makes it easy to connect with qualified tutors in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
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
              <div key={index} className="flex flex-col items-center animate-fade-in bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="bg-primary-100 p-4 rounded-xl mb-6">
                  <step.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-center text-gray-600 text-base">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Why Choose VerifiedTutors</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light">
              We're committed to providing the highest quality tutoring experience for students across Sri Lanka
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
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
              <div key={index} className="flex items-start bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0 mr-4">
                  <div className="bg-accent-100 p-3 rounded-xl">
                    <Award className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-base">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-900 text-white py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Ready to Find Your Perfect Tutor?</h2>
          <p className="text-xl sm:text-2xl text-primary-100 mb-8 sm:mb-10 max-w-3xl mx-auto font-light">
            Join thousands of students who have already found their ideal tutors on VerifiedTutors
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link 
              to="/tutors" 
              className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 text-lg text-center rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Browse Tutors
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/register" 
                className="btn bg-accent-500 text-white hover:bg-accent-600 px-8 py-4 text-lg text-center rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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