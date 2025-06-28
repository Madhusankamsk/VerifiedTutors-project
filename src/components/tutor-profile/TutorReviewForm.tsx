import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Rating } from '../Rating';

interface TutorReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const TutorReviewForm: React.FC<TutorReviewFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reviewData.rating, reviewData.comment);
    // Reset form
    setReviewData({ rating: 5, comment: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Write a Review</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <Rating
              rating={reviewData.rating}
              size="lg"
              onChange={(newRating) => setReviewData({ ...reviewData, rating: newRating })}
            />
          </div>
          
          <div className="mb-5">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={reviewData.comment}
              onChange={(e) =>
                setReviewData({ ...reviewData, comment: e.target.value })
              }
              placeholder="Share your experience with this tutor..."
              required
              minLength={10}
            />
            {reviewData.comment.length > 0 && reviewData.comment.length < 10 && (
              <p className="mt-1 text-sm text-red-600">
                Comment must be at least 10 characters long
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewData.rating < 1 || reviewData.comment.length < 10}
              className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorReviewForm; 