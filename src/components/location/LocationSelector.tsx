import React, { useState } from 'react';
import { useLocations, Location } from '../../contexts/LocationContext';
import { Check, X } from 'lucide-react';

interface TutorLocation {
  _id: string;
  name: string;
  province: string;
}

interface LocationSelectorProps {
  selectedLocations: TutorLocation[];
  onLocationsChange: (locations: TutorLocation[]) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocations, onLocationsChange }) => {
  const { locations, loading, error } = useLocations();
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [expandedTowns, setExpandedTowns] = useState<Set<string>>(new Set());

  // Get cities (level 1 locations)
  const cities = React.useMemo(() => {
    if (!Array.isArray(locations)) return [];
    return locations.filter(loc => loc.level === 1);
  }, [locations]);

  const toggleCity = (cityId: string) => {
    setExpandedCities(prev => {
      const next = new Set(prev);
      if (next.has(cityId)) {
        next.delete(cityId);
      } else {
        next.add(cityId);
      }
      return next;
    });
  };

  const toggleTown = (townId: string) => {
    setExpandedTowns(prev => {
      const next = new Set(prev);
      if (next.has(townId)) {
        next.delete(townId);
      } else {
        next.add(townId);
      }
      return next;
    });
  };

  const handleLocationSelect = (location: Location) => {
    const tutorLocation: TutorLocation = {
      _id: location._id,
      name: location.name,
      province: location.level === 1 ? location.name : 
                location.level === 2 ? (locations.find(l => l._id === location.parent) as Location)?.name || '' :
                (locations.find(l => l._id === (locations.find(p => p._id === location.parent) as Location)?.parent) as Location)?.name || ''
    };

    const exists = selectedLocations.some(loc => loc._id === location._id);
    if (exists) {
      onLocationsChange(selectedLocations.filter(loc => loc._id !== location._id));
    } else {
      onLocationsChange([...selectedLocations, tutorLocation]);
    }
  };

  const isLocationSelected = (locationId: string) => {
    return selectedLocations.some(loc => loc._id === locationId);
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
      {/* Selected Locations */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Locations</h3>
        <div className="flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <div
              key={location._id}
              className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full text-primary-700"
            >
              <span>{location.name}, {location.province}</span>
              <button
                type="button"
                onClick={() => handleLocationSelect({ _id: location._id, name: location.name, level: 1, parent: null } as Location)}
                className="text-primary-500 hover:text-primary-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {selectedLocations.length === 0 && (
            <p className="text-sm text-gray-500">No locations selected</p>
          )}
        </div>
      </div>

      {/* Location Tree */}
      <div className="space-y-2">
        {cities.map(city => (
          <div key={city._id} className="border rounded-lg">
            {/* City Row */}
            <div className="flex items-center p-3 hover:bg-gray-50">
              <button
                onClick={() => toggleCity(city._id)}
                className="p-1 hover:bg-gray-100 rounded mr-2"
              >
                {expandedCities.has(city._id) ? (
                  <span className="text-gray-500">▼</span>
                ) : (
                  <span className="text-gray-500">▶</span>
                )}
              </button>
              <button
                onClick={() => handleLocationSelect(city)}
                className="flex-1 flex items-center text-left"
              >
                <span className="flex-1">{city.name}</span>
                {isLocationSelected(city._id) && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
              </button>
            </div>

            {/* Towns */}
            {expandedCities.has(city._id) && city.children && (
              <div className="pl-8 border-t">
                {city.children.map(town => (
                  <div key={town._id} className="border-b last:border-b-0">
                    {/* Town Row */}
                    <div className="flex items-center p-3 hover:bg-gray-50">
                      <button
                        onClick={() => toggleTown(town._id)}
                        className="p-1 hover:bg-gray-100 rounded mr-2"
                      >
                        {expandedTowns.has(town._id) ? (
                          <span className="text-gray-500">▼</span>
                        ) : (
                          <span className="text-gray-500">▶</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleLocationSelect(town)}
                        className="flex-1 flex items-center text-left"
                      >
                        <span className="flex-1">{town.name}</span>
                        {isLocationSelected(town._id) && (
                          <Check className="w-5 h-5 text-primary-600" />
                        )}
                      </button>
                    </div>

                    {/* Home Towns */}
                    {expandedTowns.has(town._id) && town.children && (
                      <div className="pl-8 border-t">
                        {town.children.map(homeTown => (
                          <div key={homeTown._id} className="border-b last:border-b-0">
                            <button
                              onClick={() => handleLocationSelect(homeTown)}
                              className="flex items-center w-full p-3 hover:bg-gray-50 text-left"
                            >
                              <span className="flex-1">{homeTown.name}</span>
                              {isLocationSelected(homeTown._id) && (
                                <Check className="w-5 h-5 text-primary-600" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector; 