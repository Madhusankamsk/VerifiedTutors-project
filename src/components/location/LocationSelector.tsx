import React from 'react';

interface LocationSelectorProps {
  availableLocations: string;
  onLocationsChange: (locations: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ availableLocations, onLocationsChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="availableLocations" className="block text-sm font-medium text-gray-700 mb-2">
          Available Teaching Locations
        </label>
        <textarea
          id="availableLocations"
          value={availableLocations}
          onChange={(e) => onLocationsChange(e.target.value)}
          placeholder="Enter your available teaching locations (e.g., Colombo, Kandy, Online, etc.)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Describe the areas where you are available to teach. You can include cities, towns, or specify if you offer online teaching.
        </p>
      </div>
    </div>
  );
};

export default LocationSelector; 