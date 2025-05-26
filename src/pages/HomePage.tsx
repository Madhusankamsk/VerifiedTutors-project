import React from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, Star, Award, BookOpen } from 'lucide-react';
import { SUBJECT_AREAS } from '../config/constants';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-2/3 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Find Trusted Tutors in Sri Lanka
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with verified, experienced tutors for online, home-visit, or group classes
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/tutors" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 text-base">
                Find a Tutor
              </Link>
              <Link to="/register" className="btn bg-accent-500 text-white hover:bg-accent-600 px-6 py-3 text-base">
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
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
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Tutors by Subject</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find specialized tutors across a wide range of subjects to help you excel in your studies
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {SUBJECT_AREAS.slice(0, 8).map((subject) => (
              <Link
                key={subject}
                to={`/tutors?subject=${encodeURIComponent(subject)}`}
                className="flex flex-col items-center p-6 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors duration-200 border border-gray-100 shadow-sm"
              >
                <BookOpen className="h-8 w-8 text-primary-500 mb-3" />
                <span className="text-center font-medium text-gray-800">{subject}</span>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/tutors" className="btn btn-outline">
              View All Subjects
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How VerifiedTutors Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to connect with qualified tutors in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Search for Tutors</h3>
              <p className="text-center text-gray-600">
                Browse through our extensive list of verified tutors based on subject, location, price, and ratings
              </p>
            </div>
            
            <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Perfect Match</h3>
              <p className="text-center text-gray-600">
                Review tutor profiles, qualifications, teaching methods, and read student reviews
              </p>
            </div>
            
            <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="bg-primary-100 p-4 rounded-full mb-6">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Learning</h3>
              <p className="text-center text-gray-600">
                Connect with your chosen tutor for online, home-visit, or group classes and track your progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose VerifiedTutors</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the highest quality tutoring experience for students across Sri Lanka
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="bg-accent-100 p-2 rounded-md">
                  <Award className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Verified Tutors</h3>
                <p className="text-gray-600">
                  All tutors are thoroughly vetted through our verification process, ensuring you're learning from qualified professionals
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="bg-accent-100 p-2 rounded-md">
                  <Award className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Diverse Teaching Methods</h3>
                <p className="text-gray-600">
                  Choose from various teaching approaches that best suit your learning style and educational needs
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="bg-accent-100 p-2 rounded-md">
                  <Award className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Flexible Learning Options</h3>
                <p className="text-gray-600">
                  Select from online sessions, home visits, or group classes based on your preference and availability
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="bg-accent-100 p-2 rounded-md">
                  <Award className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transparent Reviews</h3>
                <p className="text-gray-600">
                  Read authentic reviews and ratings from other students to make informed decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Tutor?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have already found their ideal tutors on VerifiedTutors
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/tutors" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 text-base">
              Browse Tutors
            </Link>
            <Link to="/register" className="btn bg-accent-500 text-white hover:bg-accent-600 px-6 py-3 text-base">
              Sign Up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;