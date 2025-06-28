import React, { useState, useEffect } from 'react';
import { useLocations } from '../../contexts/LocationContext';

interface HometownsFilterProps {
  selectedHometown: string;
  selectedTown: string;
  selectedCity: string;
  onSelect: (hometownId: string) => void;
}

const HometownsFilter: React.FC<HometownsFilterProps> = ({ selectedHometown, selectedTown, selectedCity, onSelect }) => {
  const { locations } = useLocations();
  const [hometowns, setHometowns] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    if (!selectedCity || !selectedTown) {
      setHometowns([]);
      return;
    }

    // Find the selected city and town, then get hometowns
    const city = locations.find(loc => loc._id === selectedCity);
    const town = city?.children?.find(t => t._id === selectedTown);
    const townHometowns = town?.children || [];
    
    setHometowns(townHometowns.map(hometown => ({
      _id: hometown._id,
      name: hometown.name
    })));
  }, [locations, selectedCity, selectedTown]);

  return (
    <div className="w-full">
      <div className="space-y-1.5">
        <div className="filter-container">
          {hometowns.map(hometown => (
            <button
              key={hometown._id}
              onClick={() => onSelect(hometown._id)}
              className={`filter-btn ${
                selectedHometown === hometown._id
                  ? 'filter-btn-selected'
                  : 'filter-btn-unselected'
              }`}
            >
              {hometown.name}
            </button>
          ))}
        </div>
        
        {hometowns.length === 0 && (
          <div className="text-center py-2 text-xs text-gray-500">
            No hometowns available for this town
          </div>
        )}
      </div>
    </div>
  );
};

export default HometownsFilter; 