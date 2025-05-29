import React from 'react';
import { Rating } from './Rating';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    profileImage?: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  averageRating,
  totalReviews,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Reviews</h2>
          <div className="flex items-center mt-1">
            <Rating rating={averageRating} readOnly />
            <span className="ml-2 text-gray-600">
              {averageRating.toFixed(1)} ({totalReviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {review.user.profileImage ? (
                  <img
                    src={review.user.profileImage}
                    alt={review.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <span className="text-lg font-semibold text-blue-600">
                      {review.user.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{review.user.name}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1">
                  <Rating rating={review.rating} readOnly size="sm" />
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 