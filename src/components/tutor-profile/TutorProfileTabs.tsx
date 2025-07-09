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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mb-4 sm:mb-6 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
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