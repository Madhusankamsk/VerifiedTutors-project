import React, { useState, useEffect } from 'react';
import { useLocations, Location } from '../../contexts/LocationContext';
import { Check } from 'lucide-react';

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

const LocationFilter: React.FC<LocationFilterProps> = ({ selectedLocation, onSelect }) => {
  const { locations, loading, error } = useLocations();
  const [availableTowns, setAvailableTowns] = useState<Location[]>([]);
  const [availableHometowns, setAvailableHometowns] = useState<Location[]>([]);

  // Get cities (level 1 locations)
  const cities = React.useMemo(() => {
    if (!Array.isArray(locations)) return [];
    return locations.filter(loc => loc.level === 1);
  }, [locations]);

  useEffect(() => {
    if (selectedLocation.city) {
      const city = locations.find(loc => loc._id === selectedLocation.city);
      if (city?.children) {
        setAvailableTowns(city.children);
      } else {
        setAvailableTowns([]);
      }
    } else {
      setAvailableTowns([]);
    }
  }, [selectedLocation.city, locations]);

  useEffect(() => {
    if (selectedLocation.town) {
      const town = availableTowns.find(t => t._id === selectedLocation.town);
      if (town?.children) {
        setAvailableHometowns(town.children);
      } else {
        setAvailableHometowns([]);
      }
    } else {
      setAvailableHometowns([]);
    }
  }, [selectedLocation.town, availableTowns]);

  const handleCitySelect = (cityId: string) => {
    const city = cities.find(c => c._id === cityId);
    onSelect({
      city: cityId,
      town: '',
      hometown: ''
    });
  };

  const handleTownSelect = (townId: string) => {
    const town = availableTowns.find(t => t._id === townId);
    onSelect({
      ...selectedLocation,
      town: townId,
      hometown: ''
    });
  };

  const handleHometownSelect = (hometownId: string) => {
    const hometown = availableHometowns.find(h => h._id === hometownId);
    onSelect({
      ...selectedLocation,
      hometown: hometownId
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cities */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Cities</h4>
        <div className="grid grid-cols-2 gap-2">
          {cities.map(city => (
            <button
              key={city._id}
              onClick={() => handleCitySelect(city._id)}
              className={`flex items-center justify-between p-2 rounded-lg border ${
                selectedLocation.city === city._id
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <span>{city.name}</span>
              {selectedLocation.city === city._id && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Towns */}
      {selectedLocation.city && availableTowns.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Towns</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableTowns.map(town => (
              <button
                key={town._id}
                onClick={() => handleTownSelect(town._id)}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  selectedLocation.town === town._id
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span>{town.name}</span>
                {selectedLocation.town === town._id && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hometowns */}
      {selectedLocation.town && availableHometowns.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Hometowns</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableHometowns.map(hometown => (
              <button
                key={hometown._id}
                onClick={() => handleHometownSelect(hometown._id)}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  selectedLocation.hometown === hometown._id
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span>{hometown.name}</span>
                {selectedLocation.hometown === hometown._id && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFilter; 