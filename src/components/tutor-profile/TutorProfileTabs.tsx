import React from 'react';

interface TutorProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBookSession: () => void;
  onWriteReview: () => void;
}

const TutorProfileTabs: React.FC<TutorProfileTabsProps> = ({
  activeTab,
  onTabChange,
  onBookSession,
  onWriteReview
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tab Navigation */}
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
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={onBookSession}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-all duration-200 shadow-sm"
            >
              Book Session
            </button>
            <button 
              onClick={onWriteReview}
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              Write Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileTabs; 