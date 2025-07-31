import React from 'react';
import { TutorProfile } from '../../contexts/TutorContext';

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
    <div className="space-y-4 sm:space-y-6">
      {/* About Section */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">About</h2>
        <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm sm:text-base">{profile.bio}</p>
      </div>

      {/* Teaching Mediums */}
      {profile.teachingMediums && profile.teachingMediums.length > 0 && (
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
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
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
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
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200/50">
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
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
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
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-700 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
                <span className="text-xs sm:text-sm truncate">@{profile.socialMedia.linkedin}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfileAbout; 