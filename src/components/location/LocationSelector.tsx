import React, { useState } from 'react';
import { useLocations, Location } from '../../contexts/LocationContext';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

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
    const newLocations = exists 
      ? selectedLocations.filter(loc => loc._id !== location._id)
      : [...selectedLocations, tutorLocation];
    
    onLocationsChange(newLocations);
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
      {/* Location Tree */}
      <div className="border rounded-lg divide-y">
        {cities.map(city => (
          <div key={city._id} className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => toggleCity(city._id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedCities.has(city._id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleLocationSelect(city)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    isLocationSelected(city._id)
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{city.name}</span>
                  {isLocationSelected(city._id) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Towns */}
            {expandedCities.has(city._id) && city.children && (
              <div className="ml-8 mt-2 space-y-2">
                {city.children.map(town => (
                  <div key={town._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleTown(town._id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedTowns.has(town._id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLocationSelect(town)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                          isLocationSelected(town._id)
                            ? 'bg-primary-50 text-primary-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span>{town.name}</span>
                        {isLocationSelected(town._id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Home Towns */}
                {city.children.map(town => (
                  expandedTowns.has(town._id) && town.children && (
                    <div key={`home-${town._id}`} className="ml-8 mt-2 space-y-2">
                      {town.children.map(homeTown => (
                        <div key={homeTown._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleLocationSelect(homeTown)}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                                isLocationSelected(homeTown._id)
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <span>{homeTown.name}</span>
                              {isLocationSelected(homeTown._id) && (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Locations Display */}
      {selectedLocations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Locations</h3>
          <div className="flex flex-wrap gap-2">
            {selectedLocations.map(location => (
              <div
                key={location._id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700"
              >
                <span>{location.name}</span>
                <button
                  type="button"
                  onClick={() => handleLocationSelect({ _id: location._id, name: location.name, level: 1, parent: null })}
                  className="ml-2 text-primary-500 hover:text-primary-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 