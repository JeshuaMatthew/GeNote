import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion components
import GenoteApi from '../utils/GenoteApi';
import { useAuth } from '../utils/AuthProvider';
import { AxiosResponse, AxiosError } from 'axios';

// --- Interfaces ---

interface AddFolderFormData {
  name: string;
}

interface ApiFolderResponse {
  id: string;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiErrorData {
  message?: string;
  error?: string;
  detail?: string;
}

// --- API Call Function ---

const handleCreateFolder = async (
  folderData: AddFolderFormData,
  token: string | undefined
): Promise<AxiosResponse<ApiFolderResponse>> => {
  if (!token) {
    throw new Error('Authentication token is required.');
  }
  return await GenoteApi.post<ApiFolderResponse>(
    'api/folders',
    folderData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// --- Component ---

const AddFolderPage: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddFolderFormData>();

  const mutation = useMutation<
    AxiosResponse<ApiFolderResponse>,
    AxiosError<ApiErrorData>,
    AddFolderFormData
  >({
    mutationFn: (newFolderData) => handleCreateFolder(newFolderData, getToken()),
    onSuccess: (data) => {
      console.log('Folder created successfully:', data.data);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      reset();
      navigate('/folder');
    },
    onError: (error) => {
      console.error('Error creating folder:', error);
    },
  });

  const onSubmit: SubmitHandler<AddFolderFormData> = (data) => {
    mutation.mutate(data);
  };

  const getApiErrorMessage = (err: AxiosError<ApiErrorData> | null): string | null => {
    if (!err) {
      return null;
    }
    return err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to create folder. Please try again.";
  };

  // --- Style Constants ---
  const colorDark = '#A84C4C';
  const colorLight = '#FFEEEE';
  const colorWhite = '#FFFFFF';
  const colorDarkHover = '#934242';
  const borderColor = 'border-gray-300';

  const primaryButtonStyle = `
    bg-[${colorDark}] hover:bg-[${colorDarkHover}] text-[${colorLight}]
    font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
    transition duration-150 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed
  `;
  const inputStyle = `
    shadow appearance-none border ${borderColor} rounded-lg w-full
    py-2 px-3 text-gray-950 leading-tight
    focus:outline-none focus:ring-1 focus:ring-[${colorDark}] focus:border-[${colorDark}]
  `;
   const errorTextStyle = `text-red-600 text-sm mt-1`;

   // --- Animation Variants ---
   const pageVariants = {
     initial: { opacity: 0 },
     animate: { opacity: 1, transition: { duration: 0.5 } },
     exit: { opacity: 0, transition: { duration: 0.3 } }
   };

   const cardVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { y: -30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const formItemVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 5, height: 0, transition: { duration: 0.2, ease: "easeIn" } }
  };


  return (
    <motion.div
      className={`min-h-screen bg-[${colorWhite}] p-4 md:p-8 flex justify-center items-start md:items-center`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={`w-full max-w-md bg-[${colorWhite}] rounded-lg shadow-md p-6 md:p-8 mt-16 md:mt-0`}
        variants={cardVariants} // Apply card animation
      >

        <motion.h2
          className={`text-xl md:text-2xl font-semibold text-[${colorDark}] text-center mb-6`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }} // Animate heading
        >
          Create New Folder
        </motion.h2>

        {/* Animate form elements with stagger */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }} // Stagger children animation
        >
          <motion.div variants={formItemVariants}>
            <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-1`}>
              Folder Name
            </label>
            <motion.input
              type="text"
              id="name"
              {...register("name", { required: "Folder name cannot be empty." })}
              className={`${inputStyle} ${errors.name ? 'border-red-500' : borderColor}`}
              disabled={mutation.isPending}
              whileFocus={{ scale: 1.02 }} // Subtle focus animation
            />
            <AnimatePresence>
              {errors.name && (
                  <motion.p
                    className={errorTextStyle}
                    variants={errorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {errors.name.message}
                 </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Animate API Error Message */}
          <AnimatePresence>
            {mutation.isError && (
               <motion.p
                  className={`text-red-600 bg-red-100 p-3 rounded border border-red-300 text-sm`}
                  variants={errorVariants} // Reuse error animation
                  initial="initial"
                  animate="animate"
                  exit="exit"
               >
                  Error: {getApiErrorMessage(mutation.error)}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div className="pt-2" variants={formItemVariants}>
            <motion.button
              type="submit"
              className={primaryButtonStyle}
              disabled={mutation.isPending}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }} // Hover effect
              whileTap={{ scale: 0.98 }} // Tap effect
            >
              {mutation.isPending ? 'Creating...' : 'Create Folder'}
            </motion.button>
          </motion.div>
        </motion.form>

      </motion.div>
    </motion.div>
  );
};

export default AddFolderPage;