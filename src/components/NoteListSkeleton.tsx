// src/components/NoteListSkeleton.tsx
import React from 'react';
import { motion } from 'framer-motion'; // Import motion

// Define colors from your scheme for consistency
const colorLightBg = '#FFEEEE'; // Base background - light pink/peach
const colorMediumPlaceholder = '#f59393'; // Placeholder color - a medium shade from the scheme

// Animation variants for individual cards
const skeletonItemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

/**
 * Renders a single placeholder card mimicking the appearance of a Note
 * while data is loading. Uses theme colors and pulse animation.
 */
const NoteSkeletonCard: React.FC = () => {
  return (
    // Apply motion to the individual card
    <motion.div
        className={`
          h-[230px] md:h-[280px] min-w-[250px] md:w-[200px]
          flex flex-col justify-between
          p-4
          rounded-lg overflow-hidden shadow-sm
          bg-[${colorLightBg}] animate-pulse
        `}
        variants={skeletonItemVariants} // Use the defined variants
        // initial, animate, exit are handled by the parent list stagger
    >
      {/* Top Section: Title Placeholder */}
      <div>
        <div className={`h-6 bg-[${colorMediumPlaceholder}] rounded w-3/4 mb-3`}></div>
        <div className={`h-4 bg-[${colorMediumPlaceholder}] rounded w-1/2`}></div>
      </div>

      {/* Bottom Section: Body Placeholder */}
      <div className="space-y-2">
        <div className={`h-3 bg-[${colorMediumPlaceholder}] rounded w-full`}></div>
        <div className={`h-3 bg-[${colorMediumPlaceholder}] rounded w-5/6`}></div>
      </div>
    </motion.div>
  );
};

// Animation variants for the list container (for staggering)
const skeletonListVariants = {
    hidden: { opacity: 0 }, // Can start hidden if desired
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08, // Adjust stagger delay as needed
            delayChildren: 0.1 // Optional delay before starting stagger
        }
    }
};

/**
 * Renders a grid of NoteSkeletonCard components with animation
 * to simulate the note list layout during loading states.
 */
const NoteListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  // Create an array to map over for rendering multiple skeletons
  const skeletonItems = Array.from({ length: count });

  return (
    // Wrap the container in motion.div and apply stagger variants
    <motion.div
        className="flex flex-wrap gap-6 md:gap-8 mx-auto max-w-[1200px] justify-center md:justify-start w-full px-4"
        variants={skeletonListVariants}
        initial="hidden"
        animate="visible"
    >
      {skeletonItems.map((_, index) => (
        // The motion.div is now inside NoteSkeletonCard, which receives variants
        // from the parent's stagger effect
        <NoteSkeletonCard key={`note-skeleton-${index}`} />
      ))}
    </motion.div>
  );
};

export default NoteListSkeleton;