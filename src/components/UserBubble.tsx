import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import Markdown from 'markdown-to-jsx';

// Style constants
const colorDark = '#A84C4C';

interface UserPrompt {
    prompt: string;
}

// Animation Variants for the user bubble
const bubbleVariants = {
    hidden: {
        opacity: 0,
        scale: 0.85, // Start slightly smaller
        x: 20,       // Start slightly to the right (since it's text-right aligned)
    },
    visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
            duration: 0.4, // Animation duration
            ease: "easeOut", // Easing function
        }
    }
};

const UserBubble: React.FC<UserPrompt> = ({ prompt }) => { // Destructure prompt directly
  return (
    // Replace div with motion.div and apply variants
    <motion.div
        className="mb-2 text-right" // Align the whole motion div container to the right
        variants={bubbleVariants}
        initial="hidden" // Start in the hidden state
        animate="visible" // Animate to the visible state on mount
        layout // Optional: Animate layout changes
    >
        {/* Styles for the inner bubble */}
        <Markdown className={`
            inline-block
            bg-[${colorDark}] text-white text-sm
            p-3 {/* Increased padding slightly */}
            rounded-lg max-w-[80%] sm:max-w-[70%]
            prose prose-sm prose-invert {/* prose-invert for dark bg */}
            text-left {/* Ensure markdown content inside is left-aligned */}
        `}>
            {prompt}
        </Markdown>
    </motion.div>
  );
}

export default UserBubble;