import React from 'react';

interface TeachingModeFilterProps {
  selectedMode: string | null;
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
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">Teaching Mode</h3>
      <div className="grid grid-cols-3 gap-2">
        {teachingModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onSelect(mode.value)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              selectedMode === mode.value
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
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