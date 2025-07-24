import React from 'react';
import { User, Camera, Upload } from 'lucide-react';

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
  data: BasicInfoData;
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

const EditTutorProfileBasicInfo: React.FC<EditTutorProfileBasicInfoProps> = ({
  data,
  profileImage,
  isUploading,
  onDataChange,
  onProfileImageUpload
}) => {
  // Debug logging for profile image
  console.log('EditTutorProfileBasicInfo - profileImage:', profileImage);
  console.log('EditTutorProfileBasicInfo - isUploading:', isUploading);

  const handleMediumToggle = (mediumId: string) => {
    const newTeachingMediums = data.teachingMediums.includes(mediumId)
      ? data.teachingMediums.filter(id => id !== mediumId)
      : [...data.teachingMediums, mediumId];
    
    onDataChange({ teachingMediums: newTeachingMediums });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0 flex flex-col items-center lg:items-start">
          <div className="relative group w-32 h-32 sm:w-40 sm:h-40">
            <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              )}
            </div>
            
            {/* Preview indicator */}
            {profileImage && profileImage.startsWith('blob:') && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Preview
              </div>
            )}
            
            <label
              htmlFor="profile-image"
              className={`absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl sm:rounded-2xl cursor-pointer ${
                isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
                <div className="bg-white/10 p-2 sm:p-3 rounded-full mb-1 sm:mb-2">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-white text-xs sm:text-sm font-medium tracking-wide">Change Photo</span>
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
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-white border-t-transparent mb-2"></div>
                  <span className="text-white text-xs sm:text-sm font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <div className="mt-4 w-full">
            <label
              htmlFor="profile-image-upload"
              className={`w-full flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 cursor-pointer ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {profileImage && profileImage.startsWith('blob:') ? 'Change Photo' : 'Upload Photo'}
              </span>
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onProfileImageUpload}
              disabled={isUploading}
            />
          </div>
          
          {/* File size requirements */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Profile photo: Max file size: 2MB • JPG, PNG, GIF
            </p>
            {profileImage && profileImage.startsWith('blob:') && (
              <p className="text-xs text-green-600 font-medium mt-1">
                ✓ Preview loaded - Save to upload
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={data.phone}
                onChange={(e) => onDataChange({ phone: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={data.gender}
                onChange={(e) => onDataChange({ gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Teaching Mediums */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Teaching Languages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {LANGUAGE_MEDIUMS.map((medium) => (
                <label
                  key={medium.id}
                  className={`relative flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    data.teachingMediums.includes(medium.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.teachingMediums.includes(medium.id)}
                    onChange={() => handleMediumToggle(medium.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-lg sm:text-xl">{medium.flag}</span>
                    <span className={`font-medium text-sm sm:text-base ${
                      data.teachingMediums.includes(medium.id) ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {medium.name}
                    </span>
                  </div>
                  {data.teachingMediums.includes(medium.id) && (
                    <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm sm:text-base">@</span>
                  </div>
                  <input
                    type="text"
                    id="instagram"
                    value={data.socialMedia.instagram}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, instagram: e.target.value }
                    })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm sm:text-base">@</span>
                  </div>
                  <input
                    type="text"
                    id="youtube"
                    value={data.socialMedia.youtube}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, youtube: e.target.value }
                    })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="channel"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm sm:text-base">@</span>
                  </div>
                  <input
                    type="text"
                    id="facebook"
                    value={data.socialMedia.facebook}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, facebook: e.target.value }
                    })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm sm:text-base">@</span>
                  </div>
                  <input
                    type="text"
                    id="linkedin"
                    value={data.socialMedia.linkedin}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, linkedin: e.target.value }
                    })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfileBasicInfo; 