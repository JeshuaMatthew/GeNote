import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import { useAuth } from '../utils/AuthProvider';
import GenoteApi from '../utils/GenoteApi';

// --- Interfaces ---
interface UserData {
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Define a type for API errors if needed (can be simple)
interface ApiError {
    message?: string;
    // Add other potential error fields
}

// --- API Call Function ---
const BackendHandleGet = async (token: string | undefined): Promise<AxiosResponse<UserData>> => {
  if (!token) {
    throw new Error("Authentication token is required.");
  }
  return await GenoteApi.get<UserData>("api/user/", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- Style Constants ---
const colorDark = '#A84C4C';
// const colorLight = '#FFEEEE'; // Not used directly in final render, maybe for skeleton
const colorWhite = '#FFFFFF';
const borderColor = 'border-gray-300';

// --- Skeleton Component ---
const UserProfileSkeleton: React.FC = () => (
    <div className={`min-h-screen bg-[${colorWhite}] p-4 md:p-8 flex justify-center items-center`}>
      <div className={`w-full max-w-md bg-[${colorWhite}] rounded-lg shadow-md p-6 md:p-8 animate-pulse`}>
        {/* Icon and Header Placeholder */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-gray-300"></div>
          <div className="h-6 w-1/2 rounded bg-gray-300"></div>
        </div>
        {/* Data Fields Placeholder */}
        <div className="space-y-6"> {/* Increased spacing */}
          {/* Username Placeholder */}
          <div>
            <div className="h-3 w-1/4 rounded bg-gray-200 mb-2"></div>
            <div className="h-5 w-3/4 rounded bg-gray-300"></div>
          </div>
          <hr className={borderColor}/>
          {/* Email Placeholder */}
           <div>
            <div className="h-3 w-1/4 rounded bg-gray-200 mb-2"></div>
            <div className="h-5 w-3/4 rounded bg-gray-300"></div>
          </div>
           <hr className={borderColor}/>
        </div>
      </div>
    </div>
);

// --- Animation Variants ---
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4, ease: "easeOut" } },
};

const dataContainerVariants = {
    initial: {}, // Parent doesn't need initial animation itself
    animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }, // Stagger children
};

const dataFieldVariants = {
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 5, height: 0, transition: { duration: 0.2 } }
};

// --- Main Component ---
const Users: React.FC = () => {
  const { getToken } = useAuth();

  const {
    data: response,
    isLoading, // Use isLoading for initial load state
    isFetching, // Use isFetching for background updates
    isError,
    error,
  } = useQuery<AxiosResponse<UserData>, AxiosError<ApiError>>({ // Use specific error type
    queryKey: ["userdata"],
    queryFn: () => BackendHandleGet(getToken()),
    enabled: !!getToken(),
    // staleTime: 5 * 60 * 1000, // Optional: Adjust caching
  });

  const userData = response?.data;

  // Helper to get error message
  const getErrorMessage = (err: AxiosError<ApiError> | null): string => {
      if (!err) return "An unknown error occurred.";
      // Access potentially nested message if API wraps errors
      const apiErrorMsg = (err.response?.data as ApiError)?.message;
      return apiErrorMsg || err.message || "Failed to load user data.";
  };

  // Render Skeleton while loading for the first time
  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  return (
    <motion.div
      className={`min-h-screen bg-[${colorWhite}] p-4 md:p-8 flex justify-center items-center`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={`w-full max-w-md bg-[${colorWhite}] rounded-lg shadow-xl p-6 md:p-8`} // Enhanced shadow
        variants={cardVariants} // Apply card animation
        // No initial/animate needed here, handled by parent pageVariants
      >

        {/* Icon and Header */}
        <motion.div
            className="mb-8 flex flex-col items-center" // Increased margin
            variants={headerVariants} // Apply header animation
        >
          <motion.div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
            whileHover={{ scale: 1.05 }} // Subtle hover on icon container
           >
            <svg
              className="h-10 w-10 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="none"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </motion.div>
          <h1 className={`text-xl md:text-2xl font-semibold text-[${colorDark}] text-center`}>
            User Profile
          </h1>
          {isFetching && !isLoading && ( // Show subtle fetching indicator
              <span className="text-xs text-gray-400 mt-1">Updating...</span>
          )}
        </motion.div>

        {/* User Data Display Area */}
        <motion.div
            className="space-y-5" // Adjusted spacing
            variants={dataContainerVariants} // Apply container for staggering
            initial="initial" // Initial/Animate needed on container for stagger
            animate="animate"
        >
          {/* --- Error Display --- */}
          <AnimatePresence>
            {isError && (
              <motion.p
                 variants={errorVariants} initial="initial" animate="animate" exit="exit"
                 className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300"
              >
                Error: {getErrorMessage(error)}
              </motion.p>
            )}
          </AnimatePresence>

          {/* --- User Data --- */}
          {!isError && userData && (
            <>
              {/* Username Field */}
              <motion.div variants={dataFieldVariants}>
                <label className={`block text-sm font-medium text-gray-600 mb-1`}>Username</label>
                <p className="text-lg text-gray-800 py-1">{userData.username}</p> {/* Larger text */}
              </motion.div>
              <hr className={borderColor}/>
              {/* Email Field */}
              <motion.div variants={dataFieldVariants}>
                <label className={`block text-sm font-medium text-gray-600 mb-1`}>Email</label>
                <p className="text-lg text-gray-800 py-1">{userData.email}</p> {/* Larger text */}
              </motion.div>
              <hr className={borderColor}/>
               {/* Optional: Member Since Field */}
              <motion.div variants={dataFieldVariants}>
                <label className={`block text-sm font-medium text-gray-600 mb-1`}>Member Since</label>
                <p className="text-base text-gray-700 py-1">{new Date(userData.created_at).toLocaleDateString()}</p>
              </motion.div>
               <hr className={borderColor}/>
            </>
          )}
          {/* Case: Success but no data */}
           {!isLoading && !isError && !userData && (
             <motion.p
                variants={dataFieldVariants} // Can reuse variant
                className="text-center text-gray-500"
             >
                User data not found.
             </motion.p>
           )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Users;