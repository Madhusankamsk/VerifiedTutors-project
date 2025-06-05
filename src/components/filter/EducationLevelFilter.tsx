import React from 'react';

interface EducationLevelFilterProps {
  selectedLevel: string | null;
  onSelect: (level: string) => void;
}

const educationLevels = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
  { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
  { value: 'ADVANCED_LEVEL', label: 'Advanced Level' },
  { value: 'HIGHER_EDUCATION', label: 'Higher Education' },
];

const EducationLevelFilter: React.FC<EducationLevelFilterProps> = ({
  selectedLevel,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">Education Level</h3>
      <div className="space-y-2">
        {educationLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onSelect(level.value)}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              selectedLevel === level.value
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EducationLevelFilter; 