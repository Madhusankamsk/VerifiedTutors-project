import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Location {
  _id: string;
  name: string;
  province: string;
}

interface LocationContextType {
  locations: Location[];
  loading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <LocationContext.Provider value={{ locations, loading, error, fetchLocations }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocations = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
}; 