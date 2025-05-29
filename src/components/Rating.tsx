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

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={`${sizeClasses[size]} transition-colors duration-200`}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => !readOnly && setHoverRating(ratingValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
          >
            <svg
              className={`${color} ${
                ratingValue <= (readOnly ? rating : (hoverRating || rating))
                  ? 'fill-current'
                  : 'fill-gray-300'
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