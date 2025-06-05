import React from 'react';

interface SubjectFilterProps {
  selectedSubjects: string[];
  onSelect: (subjects: string[]) => void;
}

// This should be fetched from your API or context
const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Business Studies',
  'Accounting',
  'Literature',
  'Art',
  'Music',
  'Physical Education',
];

const SubjectFilter: React.FC<SubjectFilterProps> = ({
  selectedSubjects,
  onSelect,
}) => {
  const handleSubjectClick = (subject: string) => {
    const newSelection = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    onSelect(newSelection);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">Subjects</h3>
      <div className="grid grid-cols-2 gap-2">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => handleSubjectClick(subject)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              selectedSubjects.includes(subject)
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
      {selectedSubjects.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {selectedSubjects.join(', ')}
        </div>
      )}
    </div>
  );
};

export default SubjectFilter; 