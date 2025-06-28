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
      <div className="filter-container">
        {teachingModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onSelect(mode.value)}
            className={`filter-btn ${
              selectedMode === mode.value
                ? 'filter-btn-selected'
                : 'filter-btn-unselected'
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