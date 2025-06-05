import React, { useState, useEffect } from 'react';

interface LocationFilterProps {
  selectedLocation: {
    city: string;
    town: string;
    hometown: string;
  };
  onSelect: (location: {
    city: string;
    town: string;
    hometown: string;
  }) => void;
}

// Mock data - replace with API call
const cities = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Matara',
  'Negombo',
  'Kurunegala',
  'Anuradhapura'
];

const getTownsForCity = (city: string) => {
  // Mock function - replace with API call
  return [`${city} Town 1`, `${city} Town 2`, `${city} Town 3`];
};

const getHometownsForTown = (town: string) => {
  // Mock function - replace with API call
  return [`${town} Hometown 1`, `${town} Hometown 2`, `${town} Hometown 3`];
};

const LocationFilter: React.FC<LocationFilterProps> = ({ selectedLocation, onSelect }) => {
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableHometowns, setAvailableHometowns] = useState<string[]>([]);

  useEffect(() => {
    if (selectedLocation.city) {
      setAvailableTowns(getTownsForCity(selectedLocation.city));
    }
  }, [selectedLocation.city]);

  useEffect(() => {
    if (selectedLocation.town) {
      setAvailableHometowns(getHometownsForTown(selectedLocation.town));
    }
  }, [selectedLocation.town]);

  const handleCitySelect = (city: string) => {
    onSelect({
      city,
      town: '',
      hometown: ''
    });
  };

  const handleTownSelect = (town: string) => {
    onSelect({
      ...selectedLocation,
      town,
      hometown: ''
    });
  };

  const handleHometownSelect = (hometown: string) => {
    onSelect({
      ...selectedLocation,
      hometown
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">City</h3>
        <div className="grid grid-cols-2 gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedLocation.city === city
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {selectedLocation.city && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Town</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableTowns.map((town) => (
              <button
                key={town}
                onClick={() => handleTownSelect(town)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedLocation.town === town
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {town}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLocation.town && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Hometown</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableHometowns.map((hometown) => (
              <button
                key={hometown}
                onClick={() => handleHometownSelect(hometown)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedLocation.hometown === hometown
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hometown}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFilter; 