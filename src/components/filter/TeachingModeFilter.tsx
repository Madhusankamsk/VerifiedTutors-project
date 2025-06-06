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
      <div className="flex items-center gap-1.5">
        <h3 className="font-medium text-gray-700 text-sm">Teaching Mode</h3>
        <span className="text-xs text-gray-400">(Select one)</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {teachingModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onSelect(mode.value)}
            className={`px-3 py-2 rounded-md text-sm transition-all ${
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