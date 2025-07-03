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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary-50 text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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