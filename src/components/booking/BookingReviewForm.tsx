import React, { useState, useEffect } from 'react';
import { X, Star, Hash } from 'lucide-react';
import { Rating } from '../Rating';

interface Topic {
  _id: string;
  name: string;
  description?: string;
}

interface Subject {
  _id: string;
  name: string;
  category: string;
}

interface BookingReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  subject: Subject;
  topics: Topic[];
  tutorName: string;
  existingReview?: {
    rating: number;
    review: string;
  };
}

const BookingReviewForm: React.FC<BookingReviewFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subject,
  topics,
  tutorName,
  existingReview
}) => {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review: ''
  });

  // Initialize form with existing review data if available
  useEffect(() => {
    if (existingReview) {
      setReviewData({
        rating: existingReview.rating,
        review: existingReview.review
      });
    } else {
      setReviewData({ rating: 5, review: '' });
    }
  }, [existingReview, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reviewData.rating, reviewData.review);
    // Don't reset form here as it will be handled by the parent component
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {existingReview ? 'Edit Your Review' : 'Rate Your Session'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Session Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Session Details</h4>
            <p className="text-sm text-blue-800 mb-1">
              <span className="font-medium">Subject:</span> {subject.name}
            </p>
            <p className="text-sm text-blue-800 mb-1">
              <span className="font-medium">Tutor:</span> {tutorName}
            </p>
            {topics.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-blue-800 mb-1 flex items-center">
                  <Hash className="w-3 h-3 mr-1" />
                  <span className="font-medium">Topics covered:</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {topics.map((topic) => (
                    <span 
                      key={topic._id}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
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
              htmlFor="review"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Review
            </label>
            <textarea
              id="review"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={reviewData.review}
              onChange={(e) =>
                setReviewData({ ...reviewData, review: e.target.value })
              }
              placeholder="Share your experience with this tutor for this specific session..."
              required
              minLength={10}
            />
            {reviewData.review.length > 0 && reviewData.review.length < 10 && (
              <p className="mt-1 text-sm text-red-600">
                Review must be at least 10 characters long
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewData.rating < 1 || reviewData.review.length < 10}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingReviewForm; 