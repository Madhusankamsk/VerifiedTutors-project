import React from 'react';

interface LocationSelectorProps {
  availableLocations: string;
  onLocationsChange: (locations: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ availableLocations, onLocationsChange }) => {
  const maxLength = 100;
  const currentLength = availableLocations.length;
  const isNearLimit = currentLength > maxLength * 0.8;
  const isOverLimit = currentLength > maxLength;

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
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
            isOverLimit ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          rows={3}
          maxLength={maxLength}
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">
            Describe the areas where you are available to teach. You can include cities, towns, or specify if you offer online teaching.
          </p>
          <span className={`text-xs ${
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {currentLength}/{maxLength}
          </span>
        </div>
        {isOverLimit && (
          <p className="text-xs text-red-600 mt-1">
            Location description is too long. Please keep it under 100 characters.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector; 