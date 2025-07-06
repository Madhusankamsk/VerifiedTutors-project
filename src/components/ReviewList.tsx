import React, { useState } from 'react';
import { Rating } from './Rating';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, Hash } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    profileImage?: string;
  };
  subject?: {
    name: string;
    category: string;
  };
  topics?: {
    _id: string;
    name: string;
    description?: string;
  }[];
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
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const toggleReview = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const isExpanded = (reviewId: string) => expandedReviews.has(reviewId);

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

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => {
            const isReviewExpanded = isExpanded(review.id);
            const commentPreview = review.comment.length > 150 && !isReviewExpanded
              ? review.comment.substring(0, 150) + '...'
              : review.comment;

            return (
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
                    
                    {/* Subject and Topics */}
                    {review.subject && (
                      <div className="mt-2 mb-1">
                        <p className="text-sm font-medium text-gray-800">
                          {review.subject.name}
                        </p>
                        {review.topics && review.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {review.topics.slice(0, 3).map((topic, index) => (
                              <span 
                                key={topic._id || index}
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200 flex items-center"
                              >
                                <Hash className="w-3 h-3 mr-1" />
                                {topic.name}
                              </span>
                            ))}
                            {review.topics.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{review.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-1">
                      <Rating rating={review.rating} readOnly size="sm" />
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-600 whitespace-pre-line">{commentPreview}</p>
                      {review.comment.length > 150 && (
                        <button
                          onClick={() => toggleReview(review.id)}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          {isReviewExpanded ? (
                            <>
                              Show less <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      )}
    </div>
  );
}; 