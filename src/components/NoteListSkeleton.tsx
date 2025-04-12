// src/components/NoteListSkeleton.tsx
import React from 'react';

// Define colors from your scheme
const colorLight = '#FFEEEE';      // Base skeleton background 

// Skeleton for a single note card
const NoteSkeletonCard: React.FC = () => {
  return (
    // Use colorLight (#FFEEEE) as the base background
    <div className={`h-[280px] md:h-[300px] w-[180px] md:w-[300px] flex flex-col space-y-3 py-4 px-7 rounded-lg overflow-clip justify-center bg-[${colorLight}] animate-pulse`}>
      {/* Placeholder for Title - Use colorMedium (#DEB7B7) */}
      <div className={`h-8 bg-[#f59393] mx-auto rounded w-3/4 mb-12`}></div>
      {/* Placeholder for Body - Use colorMedium (#DEB7B7) */}
      <div className="space-y-2 h-11/12">
        <div className={`h-3 bg-[#f59393] rounded w-full`}></div>
        <div className={`h-3 bg-[#f59393] rounded w-5/6`}></div>
        <div className={`h-3 bg-[#f59393] rounded w-1/2`}></div>
      </div>
    </div>
  );
};



// Skeleton for the entire note list grid
const NoteListSkeleton: React.FC = () => {
  // Determine how many skeleton cards to show (adjust as needed)
  const skeletonCount = 6;

  return (
    // Mimic the container layout from Notelist
    <div className="flex flex-wrap gap-6 md:gap-8 mx-auto max-w-[800px] justify-around">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <NoteSkeletonCard key={index} />
      ))}
    </div>
  );
};

export default NoteListSkeleton;