import React, { useState, useEffect } from 'react';
import { useLocations, Location } from '../../contexts/LocationContext';

interface LocationFilterProps {
  selectedLocation: {
    city: string;
    town: string;
    hometown: string;
  };
  onSelect: (location: { city: string; town: string; hometown: string }) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ selectedLocation, onSelect }) => {
  const { locations } = useLocations();

  // Get cities (level 1 locations)
  const cities = locations.filter(loc => loc.level === 1);

  const handleCitySelect = (cityId: string) => {
    onSelect({
      city: cityId,
      town: '',
      hometown: ''
    });
  };

  return (
    <div className="w-full">
      <div className="space-y-1.5">
        <div className="filter-container">
          {cities.map(city => (
            <button
              key={city._id}
              onClick={() => handleCitySelect(city._id)}
              className={`filter-btn ${
                selectedLocation.city === city._id
                  ? 'filter-btn-selected'
                  : 'filter-btn-unselected'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
        
        {cities.length === 0 && (
          <div className="text-center py-2 text-xs text-gray-500">
            No cities available
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationFilter; 