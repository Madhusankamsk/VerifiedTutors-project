import React from 'react';
import TutorCard from '../common/TutorCard';

interface TransformedTutor {
  id: string;
  name: string;
  profileImage?: string;
  subjects: string[];
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  hourlyRate: {
    online: number;
    homeVisit: number;
    group: number;
  };
}

interface TutorGridProps {
  tutors: TransformedTutor[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
  observerTarget?: React.RefObject<HTMLDivElement>;
}

const TutorGrid: React.FC<TutorGridProps> = ({
  tutors,
  loading,
  loadingMore,
  hasMore,
  observerTarget
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 animate-pulse">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tutors.length === 0) {
    return null; // Empty state is handled by parent component
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            Loading more tutors...
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {observerTarget && <div ref={observerTarget} className="h-4" />}
    </>
  );
};

export default TutorGrid; 