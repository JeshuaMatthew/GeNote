import React, { useState } from 'react';
import FolderListSkeleton from '../components/FolderListSkeleton.tsx';
import GenoteApi from '../utils/GenoteApi.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AxiosResponse, AxiosError } from 'axios';
import { useAuth } from '../utils/AuthProvider.tsx';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion

// --- Interfaces ---
interface ApiFolder {
  id: number;
  name: string;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiErrorData {
    message?: string;
    error?: string;
    detail?: string;
}

interface EditFolderData {
  name: string;
}

// --- API Call Functions ---

const handleGetFolders = async (token: string | undefined): Promise<AxiosResponse<ApiFolder[]>> => {
  if (!token) {
    throw new Error("Authentication token is required.");
  }
  return await GenoteApi.get<ApiFolder[]>('api/folders', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const handleEditFolder = async (
    folderId: number,
    data: EditFolderData,
    token: string | undefined
): Promise<AxiosResponse<ApiFolder>> => {
     if (!token) {
        throw new Error("Authentication token is required.");
     }
     return await GenoteApi.put<ApiFolder>(`api/folders/${folderId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
     });
};

const handleDeleteFolder = async (
    folderId: number,
    token: string | undefined
): Promise<AxiosResponse<any>> => {
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    return await GenoteApi.delete(`api/folders/${folderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

// --- Component ---
const FolderList: React.FC = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editFolderName, setEditFolderName] = useState<string>('');
  const [mutationError, setMutationError] = useState<string | null>(null);

  // --- React Query Hooks ---

  const {
    data: folderDataResponse,
    isLoading,
    isError: isFetchError,
    error: fetchError,
    isFetching,
  } = useQuery<AxiosResponse<ApiFolder[]>, AxiosError<ApiErrorData>>({
    queryKey: ['folders'],
    queryFn: () => handleGetFolders(getToken()),
    enabled: !!getToken(),
    retry: false,
  });

  const editMutation = useMutation<
    AxiosResponse<ApiFolder>,
    AxiosError<ApiErrorData>,
    { id: number; data: EditFolderData }
  >({
    mutationFn: ({ id, data }) => handleEditFolder(id, data, getToken()),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['folders'] });
        setEditingFolderId(null);
        setEditFolderName('');
        setMutationError(null);
    },
    onError: (error) => {
        setMutationError(getErrorMessage(error, "Failed to update folder."));
    }
  });

  const deleteMutation = useMutation<
    AxiosResponse<any>,
    AxiosError<ApiErrorData>,
    number
  >({
    mutationFn: (id) => handleDeleteFolder(id, getToken()),
    onSuccess: (_, deletedId) => {
        queryClient.invalidateQueries({ queryKey: ['folders'] });
        setMutationError(null);
        if (editingFolderId === deletedId) {
             setEditingFolderId(null);
             setEditFolderName('');
        }
    },
    onError: (error) => {
        setMutationError(getErrorMessage(error, "Failed to delete folder."));
    }
  });


  const folders = folderDataResponse?.data;

   const getErrorMessage = (err: AxiosError<ApiErrorData> | null, fallback: string): string => {
    if (!err) {
        return "An unexpected error occurred.";
    }
    const apiErrorMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail;
    if (apiErrorMessage) {
        return apiErrorMessage;
    }
    if (err.message) {
        return err.message;
    }
    return fallback;
  };

  const showLoading = isLoading || isFetching;

  // --- Event Handlers ---
  const handleEditClick = (folder: ApiFolder) => {
      setEditingFolderId(folder.id);
      setEditFolderName(folder.name);
      setMutationError(null);
  };

  const handleCancelEdit = () => {
      setEditingFolderId(null);
      setEditFolderName('');
      setMutationError(null);
  };

  const handleSaveEdit = () => {
      if (!editingFolderId || editFolderName.trim() === '') return;
      const originalFolder = folders?.find(f => f.id === editingFolderId);
      if (originalFolder && originalFolder.name === editFolderName.trim()) {
          handleCancelEdit();
          return;
      }
      editMutation.mutate({ id: editingFolderId, data: { name: editFolderName.trim() } });
  };

  const handleDeleteClick = (folderId: number) => {
      if (editingFolderId === folderId) {
          handleCancelEdit();
      }
      if (window.confirm("Are you sure you want to delete this folder and all its notes? This action cannot be undone.")) {
         deleteMutation.mutate(folderId);
      }
  };

  // --- Styles ---
  const iconButtonBaseStyle = "p-1 rounded hover:bg-black/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const editButtonStyle = `${iconButtonBaseStyle} text-blue-600 hover:text-blue-800`;
  const deleteButtonStyle = `${iconButtonBaseStyle} text-red-600 hover:text-red-800`;
  const saveButtonStyle = `${iconButtonBaseStyle} text-green-600 hover:text-green-800`;
  const cancelButtonStyle = `${iconButtonBaseStyle} text-gray-600 hover:text-gray-800`;
  const inputStyle = "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-black"; // Ensure text color

  // --- Animation Variants ---
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const fabVariants = {
    initial: { scale: 0, opacity: 0, y: 30 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.5 } },
    exit: { scale: 0, opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  const quoteVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5, ease: "easeOut" } },
  };

  const listVariants = {
    animate: { transition: { staggerChildren: 0.1 } }, // Stagger children animation
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 5, height: 0, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const editInputVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  };


  return (
    <motion.div
      className="flex flex-col min-h-screen mt-10 space-y-8 pb-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >

      {/* Floating Add Button */}
      <motion.div
        className="fixed bottom-20 right-5 md:right-10 z-50"
        variants={fabVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/folders/add"
          className="
            bg-[#A84C4C] hover:bg-[#934242]
            text-white
            p-3
            rounded-full
            shadow-lg
            transition-colors duration-200 ease-in-out
            flex items-center justify-center
          "
          title="Add new folder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      </motion.div>
      {/* End Floating Add Button */}

      <motion.h2
        className="font-kalnia text-2xl font-semibold max-w-2xs md:ml-20 ml-2"
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.4 } }}
      >
        Organize Your Notes
      </motion.h2>

      {/* Quote Section */}
      <motion.div
        className="flex mx-auto items-center rounded-lg space-x-4 px-3 py-3 bg-[#FFEEEE] max-w-md w-full shadow"
        variants={quoteVariants}
        initial="initial"
        animate="animate"
      >
         <div className="w-[45px] bg-[#eec2c2] rounded-xl p-2 flex-shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto text-white">
             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
           </svg>
         </div>
         <div className="flex flex-col text-center flex-grow min-w-0">
           <h4 className="font-kalnia font-semibold">Stay Organized!</h4>
           <p className="text-sm md:text-base">A place for every note, and every note in its place.</p>
         </div>
      </motion.div>

        {/* Display General Mutation Error */}
        <div className="mx-auto max-w-[800px] px-4">
          <AnimatePresence>
            {mutationError && (
                <motion.p
                    className="text-center text-red-600 bg-red-100 p-2 rounded border border-red-300 text-sm"
                    variants={errorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    Error: {mutationError}
                </motion.p>
            )}
          </AnimatePresence>
        </div>

      <motion.div
        className="flex flex-wrap gap-6 md:gap-8 mx-auto max-w-[1200px] justify-center md:justify-start px-4"
        variants={listVariants}
        initial="initial" // Optional: If list itself needs entry animation
        animate="animate"
      >
        {showLoading ? (
          <FolderListSkeleton count={6} />
        ) : isFetchError ? (
           <motion.p
              className="text-center mt-20 md:mt-40 text-red-500 w-full px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
           >
              Error loading folders: {getErrorMessage(fetchError, "Failed to load folders.")}
           </motion.p>
        ) : folders && folders.length > 0 ? (
          <AnimatePresence>
            {folders.map((folder) => {
              const isEditingThis = editMutation.isPending && editMutation.variables?.id === folder.id;
              const isDeletingThis = deleteMutation.isPending && deleteMutation.variables === folder.id;
              const isMutatingThis = isEditingThis || isDeletingThis;

              return (
                  <motion.div
                    key={folder.id}
                    layout // Enable smooth layout transitions (e.g., when deleting)
                    variants={itemVariants}
                    initial="initial" // These apply when items enter the list
                    animate="animate"
                    exit="exit"      // This applies when items leave (needs AnimatePresence wrapper)
                    className={`
                      relative w-48 min-w-[180px] h-32
                      bg-[#fbc4ab] rounded-lg shadow
                      p-4 pt-2 flex flex-col justify-between
                      transition-opacity duration-200 ease-in-out
                      ${isMutatingThis ? 'opacity-50 pointer-events-none' : ''}
                    `}
                     whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  >
                    {/* Buttons */}
                     <div className="absolute top-1 right-1 flex space-x-1 z-10">
                        {editingFolderId === folder.id ? (
                             <>
                                 <motion.button whileTap={{ scale: 0.9 }}>
                                     <button
                                        onClick={handleSaveEdit}
                                        disabled={editMutation.isPending || editFolderName.trim() === ''}
                                        className={saveButtonStyle}
                                        title="Save changes"
                                     >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                     </button>
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }}>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={editMutation.isPending}
                                        className={cancelButtonStyle}
                                        title="Cancel edit"
                                     >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                     </button>
                                 </motion.button>
                             </>
                        ) : (
                             <>
                                 <motion.button whileTap={{ scale: 0.9 }}>
                                     <button
                                        onClick={() => handleEditClick(folder)}
                                        className={editButtonStyle}
                                        disabled={deleteMutation.isPending || editMutation.isPending}
                                        title="Edit folder name"
                                     >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                        </svg>
                                     </button>
                                 </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }}>
                                    <button
                                        onClick={() => handleDeleteClick(folder.id)}
                                        className={deleteButtonStyle}
                                        disabled={deleteMutation.isPending || editMutation.isPending}
                                        title="Delete folder"
                                     >
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                       </svg>
                                     </button>
                                 </motion.button>
                             </>
                        )}
                     </div>

                    {/* Folder Content Area */}
                    <div className="flex flex-col justify-end flex-grow mt-4">
                        <AnimatePresence mode="wait">
                            {editingFolderId === folder.id ? (
                                <motion.div
                                    key="edit"
                                    variants={editInputVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <input
                                        type="text"
                                        value={editFolderName}
                                        onChange={(e) => setEditFolderName(e.target.value)}
                                        className={inputStyle}
                                        autoFocus
                                        onKeyDown={(e) => {if (e.key === 'Enter') handleSaveEdit(); else if (e.key === 'Escape') handleCancelEdit();}}
                                        placeholder="Folder name"
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="display"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link
                                        to={`/note/${folder.id}`}
                                        className="flex flex-col justify-between flex-grow group cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#A84C4C] opacity-80 group-hover:opacity-100 transition-opacity">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                        </svg>
                                        <span className="font-semibold text-gray-800 truncate mt-2 group-hover:text-[#A84C4C] transition-colors block w-full">
                                          {folder.name}
                                        </span>
                                    </Link>
                                </motion.div>
                            )}
                         </AnimatePresence>
                     </div>
                  </motion.div>
              );
            })}
          </AnimatePresence>
          ) : (
            <motion.div
                className="text-center mt-20 md:mt-40 text-gray-500 w-full px-4 space-y-2"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0, transition: { delay: 0.3 }}}
            >
              <p>You haven't created any folders yet.</p>
              <Link
                to="/folders/add"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Create Your First Folder
              </Link>
            </motion.div>
          )}
       </motion.div>
    </motion.div>
  );
};

export default FolderList;