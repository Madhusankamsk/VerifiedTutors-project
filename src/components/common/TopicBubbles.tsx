import React from 'react';
import { Topic } from '../../contexts/AdminContext';

interface TopicBubblesProps {
  topics: Topic[];
  onTopicClick: (topicId: string) => void;
  selectedTopicId?: string;
  className?: string;
  variant?: 'default' | 'hero';
}

const TopicBubbles: React.FC<TopicBubblesProps> = ({
  topics,
  onTopicClick,
  selectedTopicId,
  className = '',
  variant = 'default'
}) => {
  if (!topics || topics.length === 0) {
    return null;
  }

  const baseClasses = variant === 'hero' 
    ? 'flex flex-wrap gap-2 sm:gap-3 justify-center'
    : 'flex flex-wrap gap-2 sm:gap-3';

  return (
    <div className={`${baseClasses} ${className}`}>
      {topics.map((topic) => {
        const isSelected = selectedTopicId === topic._id;
        
        const bubbleClasses = variant === 'hero'
          ? `px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 cursor-pointer border-2 ${
              isSelected
                ? 'bg-white text-blue-700 border-white shadow-lg shadow-black/20 transform scale-105'
                : 'bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:border-white/50 hover:scale-105'
            }`
          : `px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
              isSelected
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-md shadow-blue-200 transform scale-105'
                : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 hover:scale-105'
            }`;

        return (
          <button
            key={topic._id}
            onClick={() => onTopicClick(topic._id)}
            className={bubbleClasses}
            type="button"
          >
            {topic.name}
          </button>
        );
      })}
    </div>
  );
};

export default TopicBubbles; 