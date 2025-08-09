import React from 'react';
import { User, Camera, Upload, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react';

interface SocialMedia {
  instagram: string;
  youtube: string;
  facebook: string;
  linkedin: string;
}

interface BasicInfoData {
  phone: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  socialMedia: SocialMedia;
  teachingMediums: string[];
}

interface EditTutorProfileBasicInfoProps {
  phone: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other';
  socialMedia: SocialMedia;
  teachingMediums: string[];
  profileImage: string | null;
  isUploading: boolean;
  onDataChange: (data: Partial<BasicInfoData>) => void;
  onProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LANGUAGE_MEDIUMS = [
  { id: 'english', name: 'English', flag: '🇬🇧' },
  { id: 'sinhala', name: 'Sinhala', flag: '🇱🇰' },
  { id: 'tamil', name: 'Tamil', flag: '🇱🇰' },
];

const SOCIAL_MEDIA_ICONS = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  linkedin: Linkedin,
};

const EditTutorProfileBasicInfo: React.FC<EditTutorProfileBasicInfoProps> = ({
  phone,
  bio,
  gender,
  socialMedia,
  teachingMediums,
  profileImage,
  isUploading,
  onDataChange,
  onProfileImageUpload
}) => {

  const handleMediumToggle = (mediumId: string) => {
    const newTeachingMediums = teachingMediums.includes(mediumId)
      ? teachingMediums.filter(id => id !== mediumId)
      : [...teachingMediums, mediumId];
    
    onDataChange({ teachingMediums: newTeachingMediums });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Profile Picture - Compact */}
        <div className="flex-shrink-0 flex flex-col items-center lg:items-start">
          <div className="relative group w-24 h-24 sm:w-28 sm:h-28">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              )}
            </div>
            
            {/* Preview indicator */}
            {profileImage && profileImage.startsWith('blob:') && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                Preview
              </div>
            )}
            
            <label
              htmlFor="profile-image"
              className={`absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl cursor-pointer ${
                isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-200">
                <div className="bg-white/10 p-1.5 rounded-full mb-1">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onProfileImageUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mb-1"></div>
                  <span className="text-white text-xs font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* File size requirements - Compact */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Max 2MB • JPG, PNG, GIF
            </p>
            {profileImage && profileImage.startsWith('blob:') && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                ✓ Preview loaded
              </p>
            )}
          </div>
        </div>

        {/* Basic Information - Compact Layout */}
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-semibold flex items-center text-gray-900">
            <User className="w-4 h-4 mr-2 text-primary-600" />
            Basic Information
          </h2>
          
          {/* Contact Info - Compact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => onDataChange({ phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => onDataChange({ gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Teaching Languages - Compact Cards */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Teaching Languages</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_MEDIUMS.map((medium) => (
                <label
                  key={medium.id}
                  className={`relative flex items-center px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    teachingMediums.includes(medium.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={teachingMediums.includes(medium.id)}
                    onChange={() => handleMediumToggle(medium.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{medium.flag}</span>
                    <span className={`font-medium text-sm ${
                      teachingMediums.includes(medium.id) ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {medium.name}
                    </span>
                  </div>
                  {teachingMediums.includes(medium.id) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Social Media Links - Compact Grid */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Social Media Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(socialMedia).map(([platform, value]) => {
                const IconComponent = SOCIAL_MEDIA_ICONS[platform as keyof typeof SOCIAL_MEDIA_ICONS];
                return (
                  <div key={platform}>
                    <label htmlFor={platform} className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span className="capitalize">{platform}</span>
                      </div>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">@</span>
                      </div>
                      <input
                        type="text"
                        id={platform}
                        value={value}
                        onChange={(e) => onDataChange({
                          socialMedia: { ...socialMedia, [platform]: e.target.value }
                        })}
                        className="pl-8 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="username"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditTutorProfileBasicInfo);