import React from 'react';

interface TutorProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TutorProfileTabs: React.FC<TutorProfileTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'subjects', label: 'Subjects & Rates' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-gray-200/50 mb-4 sm:mb-6 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200/60' 
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorProfileTabs; 