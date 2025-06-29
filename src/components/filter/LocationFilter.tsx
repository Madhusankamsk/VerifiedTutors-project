import React from 'react';

interface LocationFilterProps {
  selectedLocation: string;
  onSelect: (location: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ selectedLocation, onSelect }) => {
  return (
    <div className="w-full">
      <div className="space-y-2">
        <div className="filter-container">
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => onSelect(e.target.value)}
            placeholder="Enter location (e.g., Colombo, Kandy)"
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs transition-all hover:border-gray-300"
          />
        </div>
        
        <div className="text-center py-1 text-xs text-gray-500">
          Type the location you're looking for
        </div>
      </div>
    </div>
  );
};

export default LocationFilter; 