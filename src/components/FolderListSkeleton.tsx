import React from 'react';

interface FolderListSkeletonProps {
  count?: number; // How many skeleton items to render
}

/**
 * Renders placeholder skeletons for folder list items while data is loading.
 */
const FolderListSkeleton: React.FC<FolderListSkeletonProps> = ({ count = 6 }) => {
  // Create an array with the specified length to map over
  const skeletonItems = Array.from({ length: count });

  return (
    // Use React Fragment to avoid adding an unnecessary wrapper div
    <>
      {skeletonItems.map((_, index) => (
        <div
          key={`folder-skeleton-${index}`} // Provide a unique key for each skeleton item
          // Apply styles mirroring the actual FolderCard component structure
          // Use animate-pulse for the loading animation effect
          className="
            w-48 min-w-[180px] h-32
            bg-gray-200/80 {/* Slightly transparent background */}
            rounded-lg shadow-md
            p-4 pt-2 {/* Match padding of actual card */}
            flex flex-col justify-between
            animate-pulse
          "
        >
          {/* Top space placeholder (where buttons might be) */}
          <div className="h-5 w-full"></div>

          {/* Content Area Placeholder */}
          <div className="flex flex-col justify-end flex-grow">
            {/* Placeholder for the Icon */}
            <div className="w-8 h-8 bg-gray-300 rounded mb-3"></div>

            {/* Placeholder for the Text */}
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FolderListSkeleton;