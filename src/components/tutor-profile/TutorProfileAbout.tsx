import React from 'react';
import { TutorProfile } from '../../contexts/TutorContext';
import TutorProfileSidebar from './TutorProfileSidebar';

interface TutorProfileAboutProps {
  profile: TutorProfile;
}

const TutorProfileAbout: React.FC<TutorProfileAboutProps> = ({ profile }) => {
  const mediumMap = {
    english: { name: 'English', flag: '🇬🇧' },
    sinhala: { name: 'Sinhala', flag: '🇱🇰' },
    tamil: { name: 'Tamil', flag: '🇱🇰' }
  } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* About Section */}
        <div className="bg-white/95 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">About</h2>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm sm:text-base">{profile.bio}</p>
        </div>

        {/* Teaching Mediums */}
        {profile.teachingMediums && profile.teachingMediums.length > 0 && (
          <div className="bg-white/95 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Teaching Mediums</h2>
            <div className="flex flex-wrap gap-2">
              {profile.teachingMediums.map((medium) => {
                const mediumInfo = mediumMap[medium as keyof typeof mediumMap] || { name: medium, flag: '🌐' };
                
                return (
                  <div
                    key={medium}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs sm:text-sm font-medium border border-gray-200/60 shadow-sm"
                  >
                    <span className="mr-1">{mediumInfo.flag}</span>
                    {mediumInfo.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Teaching Locations */}
        <div className="bg-white/95 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Teaching Locations</h2>
          <div className="flex flex-wrap gap-2">
            {profile.availableLocations ? (
              <span className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium border border-gray-200/60 shadow-sm">
                {profile.availableLocations}
              </span>
            ) : (
              <span className="text-gray-500 text-xs sm:text-sm">No locations specified</span>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        {profile.socialMedia && 
          (profile.socialMedia.instagram || 
           profile.socialMedia.youtube || 
           profile.socialMedia.facebook || 
           profile.socialMedia.linkedin) && (
          <div className="bg-white/95 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Social Media</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.socialMedia.instagram && (
                <a
                  href={`https://instagram.com/${profile.socialMedia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg border border-gray-200/60 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:shadow-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-xs sm:text-sm truncate">@{profile.socialMedia.instagram}</span>
                </a>
              )}
              {profile.socialMedia.youtube && (
                <a
                  href={`https://youtube.com/${profile.socialMedia.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg border border-gray-200/60 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:shadow-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  <span className="text-xs sm:text-sm truncate">@{profile.socialMedia.youtube}</span>
                </a>
              )}
              {profile.socialMedia.facebook && (
                <a
                  href={`https://facebook.com/${profile.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg border border-gray-200/60 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:shadow-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs sm:text-sm truncate">@{profile.socialMedia.facebook}</span>
                </a>
              )}
              {profile.socialMedia.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.socialMedia.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg border border-gray-200/60 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:shadow-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-xs sm:text-sm truncate">@{profile.socialMedia.linkedin}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Only show on About tab */}
      <div className="hidden lg:block">
        <TutorProfileSidebar profile={profile} />
      </div>
      
      {/* Sidebar - Mobile Only (shown below all content) */}
      <div className="lg:hidden mt-6 sm:mt-8">
        <TutorProfileSidebar profile={profile} />
      </div>
    </div>
  );
};

export default TutorProfileAbout; 