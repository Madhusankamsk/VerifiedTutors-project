import React from 'react';

interface LocationFilterProps {
  selectedLocation: string;
  onSelect: (location: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ selectedLocation, onSelect }) => {
  return (
    <div className="w-full">
      <div className="space-y-1.5">
        <div className="filter-container">
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => onSelect(e.target.value)}
            placeholder="Enter location (e.g., Colombo, Kandy)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        
        <div className="text-center py-2 text-xs text-gray-500">
          Type the location you're looking for
        </div>
      </div>
    </div>
  );
};

export default LocationFilter; 