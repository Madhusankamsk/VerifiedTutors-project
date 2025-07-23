import React, { useState, useEffect } from 'react';
import { useSubjects } from '../../contexts/SubjectContext';
import { Check, ChevronDown } from 'lucide-react';

interface Topic {
  _id: string;
  name: string;
  description: string;
  subject: string;
  isActive: boolean;
}

interface Subject {
  _id: string;
  name: string;
  topics?: string[];
  description: string;
  isActive: boolean;
}

interface SubjectFilterProps {
  selectedSubject: string | null;
  selectedTopic: string | null;
  onSubjectSelect: (subjectId: string | null) => void;
  onTopicSelect: (topic: string | null) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({ 
  selectedSubject, 
  selectedTopic,
  onSubjectSelect, 
  onTopicSelect 
}) => {
  const { subjects, loading, error } = useSubjects();
  const [isExpanded, setIsExpanded] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const handleSubjectClick = (subjectId: string) => {
    if (selectedSubject === subjectId) {
      onSubjectSelect(null);
      onTopicSelect(null);
      setTopics([]);
    } else {
      onSubjectSelect(subjectId);
      onTopicSelect(null);
      fetchTopics(subjectId);
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (selectedTopic === topicId) {
      onTopicSelect(null);
    } else {
      onTopicSelect(topicId);
    }
  };

  const fetchTopics = async (subjectId: string) => {
    try {
      setTopicsLoading(true);
              const response = await fetch(`/api/topics/subject/${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.filter((topic: Topic) => topic.isActive));
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setTopicsLoading(false);
    }
  };

  const selectedSubjectData = subjects.find(s => s._id === selectedSubject);
  const selectedTopicData = topics.find(t => t._id === selectedTopic);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Select Subject</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject._id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSubject === subject._id
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 hover:border-gray-300'
              }`}
            >
              {subject.name}
              {selectedSubject === subject._id && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Selection - Only show when a subject is selected */}
      {selectedSubjectData && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Select Topic for {selectedSubjectData.name}
          </h3>
          {topicsLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic._id}
                  onClick={() => handleTopicClick(topic._id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedTopic === topic._id
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  {topic.name}
                  {selectedTopic === topic._id && (
                    <Check className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Filters Display */}
      {(selectedSubject || selectedTopic) && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedSubject && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200">
                <span>{selectedSubjectData?.name}</span>
                <button
                  onClick={() => {
                    onSubjectSelect(null);
                    onTopicSelect(null);
                  }}
                  className="hover:bg-primary-100 rounded-full p-0.5 -mr-0.5 transition-colors"
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedTopic && selectedTopicData && (
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <span>{selectedTopicData.name}</span>
                <button
                  onClick={() => onTopicSelect(null)}
                  className="hover:bg-blue-100 rounded-full p-0.5 -mr-0.5 transition-colors"
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectFilter; 