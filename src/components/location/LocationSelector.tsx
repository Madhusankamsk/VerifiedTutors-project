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
    // Prevent selection of cities (level 1)
    if (location.level === 1) {
      return;
    }

    const exists = selectedLocations.some(loc => loc._id === location._id);
    let newLocations = [...selectedLocations];

    if (exists) {
      // If removing a town, also remove all its hometowns
      if (location.level === 2) {
        const hometowns = location.children || [];
        newLocations = newLocations.filter(loc => 
          loc._id !== location._id && 
          !hometowns.some(hometown => hometown._id === loc._id)
        );
      } else {
        // If removing a hometown, just remove it
        newLocations = newLocations.filter(loc => loc._id !== location._id);
      }
    } else {
      // If selecting a town, add it and all its hometowns
      if (location.level === 2) {
        const hometowns = location.children || [];
        const townLocation: TutorLocation = {
          _id: location._id,
          name: location.name,
          province: (locations.find(l => l._id === location.parent) as Location)?.name || ''
        };
        
        // Only add hometowns that aren't already selected
        const hometownLocations: TutorLocation[] = hometowns
          .filter(hometown => !selectedLocations.some(loc => loc._id === hometown._id))
          .map(hometown => ({
            _id: hometown._id,
            name: hometown.name,
            province: (locations.find(l => l._id === location.parent) as Location)?.name || ''
          }));

        // Only add the town if it's not already selected
        if (!selectedLocations.some(loc => loc._id === townLocation._id)) {
          newLocations = [...newLocations, townLocation, ...hometownLocations];
        } else {
          newLocations = [...newLocations, ...hometownLocations];
        }
      } else {
        // If selecting a hometown, just add it if not already selected
        if (!selectedLocations.some(loc => loc._id === location._id)) {
          const hometownLocation: TutorLocation = {
            _id: location._id,
            name: location.name,
            province: (locations.find(l => l._id === (locations.find(p => p._id === location.parent) as Location)?.parent) as Location)?.name || ''
          };
          newLocations = [...newLocations, hometownLocation];
        }
      }
    }
    
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
                <span className="px-3 py-2 text-gray-700">{city.name}</span>
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
        <div className="flex flex-wrap gap-2">
          {selectedLocations.map(location => (
            <div
              key={location._id}
              className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
            >
              <span>{location.name}</span>
              <button
                type="button"
                onClick={() => handleLocationSelect({ _id: location._id, name: location.name, level: 2 } as Location)}
                className="hover:text-primary-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 