import React from 'react';
import { User, Camera } from 'lucide-react';

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
  const handleMediumToggle = (mediumId: string) => {
    const newTeachingMediums = data.teachingMediums.includes(mediumId)
      ? data.teachingMediums.filter(id => id !== mediumId)
      : [...data.teachingMediums, mediumId];
    
    onDataChange({ teachingMediums: newTeachingMediums });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="relative group w-40 h-40">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <label
              htmlFor="profile-image"
              className={`absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl cursor-pointer ${
                isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
                <div className="bg-white/10 p-3 rounded-full mb-2">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-sm font-medium tracking-wide">Change Photo</span>
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
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-2"></div>
                  <span className="text-white text-sm font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center font-medium">
            Max file size: 2MB • JPG, PNG, GIF
          </p>
        </div>

        {/* Basic Information */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold flex items-center text-gray-900">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={data.phone}
                onChange={(e) => onDataChange({ phone: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={data.gender}
                onChange={(e) => onDataChange({ gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    type="text"
                    id="instagram"
                    value={data.socialMedia.instagram}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, instagram: e.target.value }
                    })}
                    className="pl-8 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    type="text"
                    id="youtube"
                    value={data.socialMedia.youtube}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, youtube: e.target.value }
                    })}
                    className="pl-8 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="channel"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    type="text"
                    id="facebook"
                    value={data.socialMedia.facebook}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, facebook: e.target.value }
                    })}
                    className="pl-8 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    type="text"
                    id="linkedin"
                    value={data.socialMedia.linkedin}
                    onChange={(e) => onDataChange({
                      socialMedia: { ...data.socialMedia, linkedin: e.target.value }
                    })}
                    className="pl-8 w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Language Mediums */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Mediums
            </label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGE_MEDIUMS.map((medium) => (
                <button
                  key={`medium-${medium.id}`}
                  type="button"
                  onClick={() => handleMediumToggle(medium.id)}
                  className={`flex items-center px-4 py-2 rounded-xl border transition-all duration-200 ${
                    data.teachingMediums.includes(medium.id)
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200'
                  }`}
                >
                  <span className="mr-2">{medium.flag}</span>
                  {medium.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={data.bio}
              onChange={(e) => onDataChange({ bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfileBasicInfo; 