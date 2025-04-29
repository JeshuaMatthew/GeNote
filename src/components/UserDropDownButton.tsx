import { useState, useEffect, useRef, FC } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom'; // Removed useMatch as it wasn't used
import { useAuth } from '../utils/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion

const UserDropdownButton: FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isLogoutTriggered, setIsLogoutTriggered] = useState(false); // Renamed for clarity
  const { logout } = useAuth();

  // Function to toggle dropdown visibility
  const toggleDropdown = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to handle navigation/action clicks within dropdown
  const handleDropdownItemClick = (action: () => void): void => {
    action(); // Perform the action (navigate or set logout state)
    setIsDropdownOpen(false); // Close dropdown after click
  };

  // Effect to perform logout action
  useEffect(() => {
    if (isLogoutTriggered) {
        logout();
        // Consider navigating to home or login instead of forcing reload,
        // as AuthProvider change should trigger necessary rerenders/redirects.
        // navigate('/'); // Or navigate('/login');
        window.location.reload(); // Keep reload if absolutely necessary
    }
  }, [isLogoutTriggered, logout, navigate]); // Added navigate to dependencies

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // --- Animation Variants ---
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10, // Start slightly above
      transition: { duration: 0.15, ease: "easeOut" }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { // Define exit animation
        opacity: 0,
        scale: 0.95,
        y: -5,
        transition: { duration: 0.15, ease: "easeIn" }
      }
  };

  const itemVariants = {
      hidden: { opacity: 0, x: -10 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
      // No exit needed per item usually, AnimatePresence handles the parent
  };


  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* User Icon Button */}
      <motion.button
        type="button"
        onClick={toggleDropdown}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A84C4C] active:bg-gray-300 transition-colors" // Adjusted focus ring color
        id="options-menu-button"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="sr-only">Open user menu</span>
        <svg
          className="h-5 w-5 text-gray-600" // Slightly darker icon color
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="none"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </motion.button>

      {/* Dropdown Panel with Animation */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu-button"
            tabIndex={-1}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit" // Apply exit animation
          >
            {/* Stagger children animation within the dropdown */}
            <motion.div
                 className="py-1"
                 role="none"
                 initial="hidden" // Apply to parent for stagger control
                 animate="visible"
                 variants={{ visible: { transition: { staggerChildren: 0.05 } } }} // Stagger effect
            >
              {/* User Profile Button */}
              <motion.button
                onClick={() => handleDropdownItemClick(() => navigate("/user"))} // Pass navigation as action
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                role="menuitem"
                tabIndex={-1}
                id="options-menu-item-0"
                variants={itemVariants} // Animate individual item
                whileHover={{ x: 2 }} // Slight move on hover
              >
                User Profile
              </motion.button>
              {/* Logout Button */}
              <motion.button
                onClick={() => handleDropdownItemClick(() => setIsLogoutTriggered(true))} // Pass logout trigger as action
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                role="menuitem"
                tabIndex={-1}
                id="options-menu-item-1"
                variants={itemVariants} // Animate individual item
                 whileHover={{ x: 2 }} // Slight move on hover
              >
                Logout
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdownButton;