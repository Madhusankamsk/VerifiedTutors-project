import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart, Sparkles, Award, Users } from 'lucide-react';
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
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:bg-sky-500' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:bg-blue-700' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden mt-auto">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px] opacity-20"></div>
             <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
       <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Bottom Section */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© {currentYear} VerifiedTutors. Made with</span>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>
                  for education, by{' '}
                  <a
                    href="https://alteredminds.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-400 transition-colors"
                  >
                    alteredMinds.co
                  </a>
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-end gap-6">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-105"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-105"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-sm text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-105"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10">
              <Award className="h-3 w-3 text-blue-400" />
              <span>Verified Platform</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10">
              <Users className="h-3 w-3 text-emerald-400" />
              <span>Trusted by 1000+ Students</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;