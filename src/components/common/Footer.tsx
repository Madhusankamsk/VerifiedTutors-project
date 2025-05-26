import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <span className="text-white font-bold text-xl">Verified<span className="text-accent-400">Tutors</span></span>
            </div>
            <p className="mt-4 text-base text-gray-300">
              Finding trusted tutors in Sri Lanka has never been easier. Browse through our verified tutors and find the perfect match for your educational needs.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/" className="text-base text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="text-base text-gray-300 hover:text-white">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-base text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-base text-gray-300 hover:text-white">
                  Become a Tutor
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Subject Areas</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/tutors?subject=Mathematics" className="text-base text-gray-300 hover:text-white">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=Science" className="text-base text-gray-300 hover:text-white">
                  Science
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=English" className="text-base text-gray-300 hover:text-white">
                  English Language
                </Link>
              </li>
              <li>
                <Link to="/tutors?subject=IT" className="text-base text-gray-300 hover:text-white">
                  IT & Computing
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <a href="mailto:info@verifiedtutors.lk" className="text-base text-gray-300 hover:text-white">
                  info@verifiedtutors.lk
                </a>
              </li>
              <li className="flex">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <a href="tel:+94112345678" className="text-base text-gray-300 hover:text-white">
                  +94 11 234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} VerifiedTutors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;