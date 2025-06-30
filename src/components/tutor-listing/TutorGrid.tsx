import React from 'react';
import TutorCard from '../common/TutorCard';
import { getRatesFromTeachingModes } from '../../utils/tutorUtils';

interface TransformedTutor {
  id: string;
  name: string;
  profileImage?: string;
  subjects: Array<{
    subject: {
      name: string;
    };
    selectedTopics?: string[];
    teachingModes?: Array<{
      type: 'online' | 'home-visit' | 'group';
      rate: number;
      enabled: boolean;
    }>;
    rates?: {
      online: number;
      individual: number;
      group: number;
    };
  }>;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  hourlyRate?: {
    online: number;
    homeVisit: number;
    group: number;
  };
}

interface TutorGridProps {
  tutors: any[];
  loading?: boolean;
}

const TutorGrid: React.FC<TutorGridProps> = ({ tutors, loading = false }) => {
  const transformTutor = (tutor: any): TransformedTutor => {
    // Get subject names and structure
    const subjects = tutor.subjects?.map((subject: any) => ({
      subject: {
        name: subject.subject?.name || 'Unknown Subject'
      },
      selectedTopics: subject.selectedTopics || [],
      teachingModes: subject.teachingModes || [],
      rates: subject.rates || null
    })) || [];

    // Get rates from new structure or fallback to legacy
    let hourlyRate: { online: number; homeVisit: number; group: number; } | undefined = undefined;
    if (tutor.subjects && tutor.subjects.length > 0) {
      const subject = tutor.subjects[0];
      if (subject.teachingModes) {
        const rates = getRatesFromTeachingModes(subject.teachingModes);
        hourlyRate = {
          online: rates.online,
          homeVisit: rates.individual,
          group: rates.group
        };
      } else if (subject.rates) {
        hourlyRate = {
          online: subject.rates.online || 0,
          homeVisit: subject.rates.individual || 0,
          group: subject.rates.group || 0
        };
      }
    }

    return {
      id: tutor._id || tutor.id,
      name: tutor.user?.name || tutor.name || 'Unknown Tutor',
      profileImage: tutor.user?.profileImage || tutor.profileImage,
      subjects,
      location: tutor.availableLocations || tutor.location || 'Location not specified',
      rating: tutor.rating || 0,
      reviewCount: tutor.totalReviews || tutor.reviewCount || 0,
      verified: tutor.isVerified || tutor.verified || false,
      hourlyRate
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 w-full h-80 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-xl"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tutors || tutors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No tutors found</div>
        <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tutors.map((tutor) => (
        <TutorCard key={tutor._id || tutor.id} tutor={transformTutor(tutor)} />
      ))}
    </div>
  );
};

export default TutorGrid; 