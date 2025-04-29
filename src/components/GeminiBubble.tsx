import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import Markdown from 'markdown-to-jsx';

interface GeminiAns {
    Ans: string;
}

// Animation Variants for the bubble
const bubbleVariants = {
    hidden: {
        opacity: 0,
        scale: 0.85, // Start slightly smaller
        y: 15,       // Start slightly lower
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.4, // Animation duration
            ease: "easeOut", // Easing function
            // type: "spring", // Optional: Use spring physics
            // stiffness: 150,
            // damping: 15,
        }
    }
};

const GeminiBubble: React.FC<GeminiAns> = ({ Ans }) => { // Destructure Ans directly
  return (
    // Replace div with motion.div and apply variants
    <motion.div
        className="mb-2 text-left"
        variants={bubbleVariants}
        initial="hidden" // Start in the hidden state
        animate="visible" // Animate to the visible state on mount
        layout // Optional: Animate layout changes if size changes dynamically
    >
        {/* Keep ReactMarkdown inside, styling remains the same */}
        <Markdown className={`inline-block bg-[#DEB7B7] text-[#612d2d] text-sm p-3 rounded-lg max-w-[80%] sm:max-w-[70%] prose prose-sm prose-stone`}>
            {Ans}
        </Markdown>
    </motion.div>
  );
}

export default GeminiBubble;