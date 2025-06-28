import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
    ],
    resources: [
      { name: 'Find a Tutor', href: '/tutors' },
      { name: 'Become a Tutor', href: '/become-tutor' },
      { name: 'Tutor Resources', href: '/resources' },
      { name: 'Success Stories', href: '/success-stories' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-auto">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px] opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <img 
                src={logo} 
                alt="VerifiedTutors Logo" 
                className="h-12 w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-200"
              />
            </Link>
            <p className="mt-4 text-gray-300 text-sm leading-relaxed">
              Connecting students with verified tutors for personalized learning experiences.
            </p>
            
            {/* Contact Info - Compact */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span className="truncate">support@verifiedtutors.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex space-x-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="h-8 w-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all duration-200 transform hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections - More compact */}
          <div className="space-y-6 sm:col-span-1 lg:col-span-1">
            <div>
              <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm inline-block transform hover:-translate-x-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 sm:col-span-1 lg:col-span-1">
            <div>
              <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm inline-block transform hover:-translate-x-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm inline-block transform hover:-translate-x-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Section - Compact */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-3">
                Stay Updated
              </h3>
              <p className="text-gray-300 text-xs mb-3">
                Get latest updates and offers.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-200 text-sm font-medium transform hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section - More compact */}
        <div className="mt-12 pt-6 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-xs text-gray-400 text-center sm:text-left">
              © {currentYear} VerifiedTutors. Made with <Heart className="inline h-3 w-3 text-red-500" /> for education.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <Link to="/privacy" className="text-xs text-gray-400 hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-gray-400 hover:text-primary-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-xs text-gray-400 hover:text-primary-400 transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;