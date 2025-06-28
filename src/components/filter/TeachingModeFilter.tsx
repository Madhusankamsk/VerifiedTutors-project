import React from 'react';

interface TeachingModeFilterProps {
  selectedMode: string;
  onSelect: (mode: string) => void;
}

const teachingModes = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'GROUP', label: 'Group' },
];

const TeachingModeFilter: React.FC<TeachingModeFilterProps> = ({
  selectedMode,
  onSelect,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-1">
        {teachingModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onSelect(mode.value)}
            className={`px-2 py-1 rounded-md text-xs transition-all ${
              selectedMode === mode.value
                ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeachingModeFilter; 