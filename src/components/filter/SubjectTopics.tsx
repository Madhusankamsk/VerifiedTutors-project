import React from 'react';
import { useSubjects } from '../../contexts/SubjectContext';
import { Check } from 'lucide-react';

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
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Topics for {selectedSubjectData.name}
      </h3>
      <div className="flex flex-wrap gap-2">
        {selectedSubjectData.topics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedTopic === topic
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
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
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
            <span>{selectedTopic}</span>
            <button
              onClick={() => onTopicSelect(null)}
              className="hover:bg-blue-100 rounded-full p-0.5 -mr-0.5 transition-colors"
            >
              <Check className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectTopics; 