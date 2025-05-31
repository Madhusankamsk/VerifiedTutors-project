import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RatingContextType {
  rating: number;
  setRating: (rating: number) => void;
  hoverRating: number;
  setHoverRating: (rating: number) => void;
  handleRatingChange: (newRating: number) => void;
  handleMouseEnter: (rating: number) => void;
  handleMouseLeave: () => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

interface RatingProviderProps {
  children: ReactNode;
  initialRating?: number;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ 
  children, 
  initialRating = 0 
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleMouseEnter = (rating: number) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const value = {
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    handleRatingChange,
    handleMouseEnter,
    handleMouseLeave,
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};

export const useRating = () => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
}; 