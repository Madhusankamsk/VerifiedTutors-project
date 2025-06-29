import React from 'react';
import { useSubjects } from '../../contexts/SubjectContext';
import { Check, X } from 'lucide-react';

interface SubjectTopicsProps {
  selectedSubject: string | null;
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
}

const SubjectTopics: React.FC<SubjectTopicsProps> = ({ 
  selectedSubject, 
  selectedTopic,
  onTopicSelect 
}) => {
  const { subjects } = useSubjects();

  const selectedSubjectData = subjects.find(s => s._id === selectedSubject);

  if (!selectedSubject || !selectedSubjectData) {
    return null;
  }

  const handleTopicClick = (topic: string) => {
    if (selectedTopic === topic) {
      onTopicSelect(null);
    } else {
      onTopicSelect(topic);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2.5">
        Topics for {selectedSubjectData.name}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {selectedSubjectData.topics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
              selectedTopic === topic
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {topic}
            {selectedTopic === topic && (
              <Check className="h-3 w-3" />
            )}
          </button>
        ))}
      </div>
      
      {/* Selected Topic Display */}
      {selectedTopic && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200 shadow-sm">
            <span>{selectedTopic}</span>
            <button
              onClick={() => onTopicSelect(null)}
              className="hover:bg-blue-100 rounded-full p-0.5 transition-colors -mr-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectTopics; 