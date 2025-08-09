import React from 'react';

interface RatingProps {
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
}

export const Rating: React.FC<RatingProps> = ({
  rating = 0,
  size = 'md',
  color = 'text-yellow-400',
  className = '',
  readOnly = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number>(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const onRatingChange = (ratingValue: number) => {
    if (!readOnly && onChange) {
      onChange(ratingValue);
    }
  };

  const handleMouseEnter = (ratingValue: number) => {
    if (!readOnly) {
      setHoverRating(ratingValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const getStarFill = (starIndex: number) => {
    const ratingValue = starIndex + 1;
    const currentRating = readOnly ? rating : (hoverRating || rating);
    return ratingValue <= currentRating;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        const isFilled = getStarFill(index);
        
        return (
          <button
            key={index}
            type="button"
            className={`${sizeClasses[size]} transition-colors duration-200 hover:scale-110 ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            }`}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            aria-label={`Rate ${ratingValue} star${ratingValue > 1 ? 's' : ''}`}
          >
            <svg
              className={`${color} ${
                isFilled ? 'fill-current' : 'fill-gray-300'
              }`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}; 