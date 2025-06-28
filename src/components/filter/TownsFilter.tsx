import React, { useState, useEffect } from 'react';
import { useLocations } from '../../contexts/LocationContext';

interface TownsFilterProps {
  selectedTown: string;
  selectedCity: string;
  onSelect: (townId: string) => void;
}

const TownsFilter: React.FC<TownsFilterProps> = ({ selectedTown, selectedCity, onSelect }) => {
  const { locations } = useLocations();
  const [towns, setTowns] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    if (!selectedCity) {
      setTowns([]);
      return;
    }

    // Find the selected city and get its towns
    const city = locations.find(loc => loc._id === selectedCity);
    const cityTowns = city?.children || [];
    
    setTowns(cityTowns.map(town => ({
      _id: town._id,
      name: town.name
    })));
  }, [locations, selectedCity]);

  return (
    <div className="w-full">
      <div className="space-y-1.5">
        <div className="filter-container">
          {towns.map(town => (
            <button
              key={town._id}
              onClick={() => onSelect(town._id)}
              className={`filter-btn ${
                selectedTown === town._id
                  ? 'filter-btn-selected'
                  : 'filter-btn-unselected'
              }`}
            >
              {town.name}
            </button>
          ))}
        </div>
        
        {towns.length === 0 && (
          <div className="text-center py-2 text-xs text-gray-500">
            No towns available for this city
          </div>
        )}
      </div>
    </div>
  );
};

export default TownsFilter; 