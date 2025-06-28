import React, { useState, useEffect } from 'react';
import { useLocations, Location } from '../../contexts/LocationContext';
import { ChevronRight } from 'lucide-react';

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
  const [activeStep, setActiveStep] = useState<'city' | 'town' | 'hometown'>(
    selectedLocation.city ? 'town' : 'city'
  );

  // Reset activeStep when selectedLocation is cleared
  useEffect(() => {
    if (!selectedLocation.city && !selectedLocation.town && !selectedLocation.hometown) {
      setActiveStep('city');
    } else if (selectedLocation.city && !selectedLocation.town) {
      setActiveStep('town');
    } else if (selectedLocation.city && selectedLocation.town && !selectedLocation.hometown) {
      setActiveStep('hometown');
    }
  }, [selectedLocation.city, selectedLocation.town, selectedLocation.hometown]);

  // Get cities (level 1 locations)
  const cities = locations.filter(loc => loc.level === 1);

  // Get towns for selected city
  const towns = selectedLocation.city
    ? locations.find(loc => loc._id === selectedLocation.city)?.children || []
    : [];

  // Get hometowns for selected town
  const hometowns = selectedLocation.town
    ? locations
        .find(loc => loc._id === selectedLocation.city)
        ?.children?.find(town => town._id === selectedLocation.town)
        ?.children || []
    : [];

  // Debug information
  useEffect(() => {
    console.log('Selected City:', selectedLocation.city);
    console.log('Available Towns:', towns);
    console.log('All Locations:', locations);
  }, [selectedLocation.city, towns, locations]);

  const handleCitySelect = (cityId: string) => {
    onSelect({
      city: cityId,
      town: '',
      hometown: ''
    });
    setActiveStep('town');
  };

  const handleTownSelect = (townId: string) => {
    onSelect({
      ...selectedLocation,
      town: townId,
      hometown: ''
    });
    setActiveStep('hometown');
  };

  const handleHometownSelect = (hometownId: string) => {
    onSelect({
      ...selectedLocation,
      hometown: hometownId
    });
  };

  const handleBack = () => {
    if (activeStep === 'hometown') {
      setActiveStep('town');
    } else if (activeStep === 'town') {
      setActiveStep('city');
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 'city':
        return (
          <div className="space-y-1.5">
            <div className="max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <div className="space-y-0.5">
                {cities.map(city => (
                  <button
                    key={city._id}
                    onClick={() => handleCitySelect(city._id)}
                    className={`w-full text-left px-2 py-1 rounded-md text-xs transition-all ${
                      selectedLocation.city === city._id
                        ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'town':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-end">
              <button
                onClick={handleBack}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-2.5 w-2.5 rotate-180" />
                Back
              </button>
            </div>
            <div className="max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {towns.length > 0 ? (
                <div className="space-y-0.5">
                  {towns.map(town => (
                    <button
                      key={town._id}
                      onClick={() => handleTownSelect(town._id)}
                      className={`w-full text-left px-2 py-1 rounded-md text-xs transition-all ${
                        selectedLocation.town === town._id
                          ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {town.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-gray-500">
                  No towns available for this city
                </div>
              )}
            </div>
          </div>
        );

      case 'hometown':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-end">
              <button
                onClick={handleBack}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-2.5 w-2.5 rotate-180" />
                Back
              </button>
            </div>
            <div className="max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {hometowns.length > 0 ? (
                <div className="space-y-0.5">
                  {hometowns.map(hometown => (
                    <button
                      key={hometown._id}
                      onClick={() => handleHometownSelect(hometown._id)}
                      className={`w-full text-left px-2 py-1 rounded-md text-xs transition-all ${
                        selectedLocation.hometown === hometown._id
                          ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {hometown.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-gray-500">
                  No hometowns available for this town
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
};

export default LocationFilter; 