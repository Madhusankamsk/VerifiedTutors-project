import React, { useEffect, useState } from 'react';
import { useSubjects } from '../../contexts/SubjectContext';
import { Check, X } from 'lucide-react';

interface SubjectTopicsProps {
  selectedSubject: string | null;
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
}

interface Topic {
  _id: string;
  name: string;
  description: string;
  subject: string;
  isActive: boolean;
}

const SubjectTopics: React.FC<SubjectTopicsProps> = ({ 
  selectedSubject, 
  selectedTopic,
  onTopicSelect 
}) => {
  const { subjects } = useSubjects();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedSubjectData = subjects.find(s => s._id === selectedSubject);

  // Fetch topics for the selected subject
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  const fetchTopics = async () => {
    if (!selectedSubject) return;
    
    try {
      setLoading(true);
              const response = await fetch(`/api/topics/subject/${selectedSubject}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.filter((topic: Topic) => topic.isActive));
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSubject || !selectedSubjectData) {
    return null;
  }

  const handleTopicClick = (topicId: string) => {
    if (selectedTopic === topicId) {
      onTopicSelect(null);
    } else {
      onTopicSelect(topicId);
    }
  };

  if (loading) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2.5">
          Topics for {selectedSubjectData.name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2.5">
        Topics for {selectedSubjectData.name}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {topics.map((topic) => (
          <button
            key={topic._id}
            onClick={() => handleTopicClick(topic._id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
              selectedTopic === topic._id
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {topic.name}
            {selectedTopic === topic._id && (
              <Check className="h-3 w-3" />
            )}
          </button>
        ))}
      </div>
      
      {/* Selected Topic Display */}
      {selectedTopic && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Selected: {topics.find(t => t._id === selectedTopic)?.name}
            </span>
            <button
              onClick={() => onTopicSelect(null)}
              className="text-blue-500 hover:text-blue-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectTopics; 