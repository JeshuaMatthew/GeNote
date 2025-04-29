import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion'; // Import motion

import GenoteApi from '../utils/GenoteApi';
import { useAuth } from '../utils/AuthProvider';

// --- Interfaces ---
interface ApiErrorData {
    message?: string;
    error?: string;
    detail?: string;
}

interface ApiSingleNote {
  id: number;
  title: string;
  body: string;
  folderId?: number | null;
  createdAt: string;
  updatedAt: string;
}

// --- API Call Functions ---
const handleGetSingleNote = async (
    noteId: string | undefined,
    token: string | undefined
): Promise<AxiosResponse<ApiSingleNote>> => {
    if (!token) throw new Error("Authentication token required.");
    if (!noteId) throw new Error("Note ID is required.");
    if (isNaN(parseInt(noteId, 10))) throw new Error("Invalid Note ID provided.");
    return await GenoteApi.get<ApiSingleNote>(`/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

const handleDeleteNote = async (
    noteId: number,
    token: string | undefined
): Promise<AxiosResponse<any>> => {
    if (!token) throw new Error("Authentication token required.");
    return await GenoteApi.delete(`/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// --- Helper Function ---
const getErrorMessage = (err: AxiosError<ApiErrorData> | null, fallback: string): string => {
    if (!err) return "An unexpected error occurred.";
    const apiMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail;
    return typeof apiMsg === 'string' ? apiMsg : (err.message || fallback); // Ensure string return
};


// --- Loading Skeleton ---
const NoteViewSkeleton: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto min-h-screen px-4 py-8 mt-10 max-w-4xl"
    >
        <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div> {/* Title Placeholder */}
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div> {/* Date Placeholder */}
            <div className="space-y-3 mt-8"> {/* Added margin-top */}
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
            </div> {/* Body Placeholder */}
        </div>
    </motion.div>
);


// --- Component ---
const NoteView: React.FC = () => {
    const { noteId } = useParams<{ noteId: string }>();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // --- Style Constants ---
    const colorAccent = '#A84C4C';
    const colorAccentHover = '#c55a5a';
    const colorAccentFocusRing = '#f87171'; // A lighter red for focus ring
    const colorLightBg = '#FFEEEE';
    const colorText = '#374151'; // Default gray text
    const colorHeading = '#1f2937'; // Darker gray for headings

    // --- Animation Variants ---
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
    };

    const headerVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5, ease: "easeOut" } },
    };

    const contentVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: 0.3, duration: 0.6 } },
    };

     const errorVariants = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: 5, transition: { duration: 0.2, ease: "easeIn" } }
    };

    // --- Queries & Mutations ---
    const {
        data: noteResponse,
        isLoading,
        isError,
        error: fetchError,
        isFetching,
    } = useQuery<AxiosResponse<ApiSingleNote>, AxiosError<ApiErrorData>>({
        queryKey: ['note', noteId],
        queryFn: () => handleGetSingleNote(noteId, getToken()),
        enabled: !!noteId && !!getToken() && !isNaN(parseInt(noteId, 10)),
        retry: 1,
    });

    const deleteMutation = useMutation<
        AxiosResponse<any>,
        AxiosError<ApiErrorData>,
        number
    >({
        mutationFn: (idToDelete) => handleDeleteNote(idToDelete, getToken()),
        onSuccess: (deletedId) => {
            console.log(`Note ${deletedId} deleted successfully.`);
            queryClient.invalidateQueries({ queryKey: ['notes'], exact: false }); // Invalidate potentially related lists
            queryClient.removeQueries({ queryKey: ['note', deletedId] }); // Remove specific note cache

            const folderIdToGoBackTo = noteResponse?.data?.folderId;
            if (folderIdToGoBackTo) {
                queryClient.invalidateQueries({ queryKey: ['notes', folderIdToGoBackTo.toString()] }); // Invalidate specific folder list
                navigate(`/note/${folderIdToGoBackTo}`);
            } else {
                navigate('/folder'); // Fallback
            }
        },
        onError: (error) => {
            console.error("Failed to delete note:", error);
            // Consider using a state variable for error message instead of alert
            alert(`Error deleting note: ${getErrorMessage(error, "Failed to delete note.")}`);
        }
    });

    const noteData = noteResponse?.data;

    const handleDeleteClick = () => {
        if (noteData?.id && window.confirm(`Are you sure you want to delete the note "${noteData.title}"? This action cannot be undone.`)) {
            deleteMutation.mutate(noteData.id);
        }
    };

    // --- Loading and Error States ---
    if (isLoading || isFetching) {
        return <NoteViewSkeleton />;
    }

    if (isError || !noteData) {
        const errorMessage = fetchError
            ? getErrorMessage(fetchError, "Failed to load the note.")
            : "Note not found or could not be loaded.";
        return (
            <motion.div
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="container mx-auto px-4 py-8 mt-10 text-center min-h-screen flex flex-col items-center justify-center"
            >
                <motion.h2 variants={headerVariants} className={`text-2xl font-semibold text-[${colorAccent}] mb-4`}>Error Loading Note</motion.h2>
                <motion.p variants={errorVariants} className={`text-red-700 bg-[${colorLightBg}] p-4 rounded border border-[${colorAccent}] max-w-lg w-full`}>
                    {errorMessage}
                </motion.p>
                <motion.div variants={contentVariants}>
                    <Link to="/folder" // Changed from /folders to /folder based on previous examples
                        className={`mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors`}
                    >
                    Back to Folders
                    </Link>
                </motion.div>
            </motion.div>
        );
    }

    // --- Render Note ---
    return (
        <motion.div
            variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="container mx-auto px-4 py-8 mt-10 max-w-4xl min-h-screen"
        >
            {/* Note Header */}
            <motion.div
                variants={headerVariants}
                className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-300 pb-4 gap-4" // Added gap
            >
                {/* Title and Date */}
                <div className="flex-grow">
                    <h1 className={`text-3xl md:text-4xl font-bold text-[${colorHeading}] mb-2 break-words`}> {/* Added break-words */}
                        {noteData.title}
                    </h1>
                    <p className={`text-sm text-[${colorText}]`}>
                        Last updated: {new Date(noteData.updatedAt).toLocaleString()}
                    </p>
                </div>
                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.2 } }}
                    className="flex space-x-2 flex-shrink-0 mt-1 self-start md:self-center" // Align buttons
                >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                            to={`/note/edit/${noteData.id}`}
                            className={`px-3 py-1.5 text-sm bg-[${colorAccent}] text-white rounded-md shadow-sm hover:bg-[${colorAccentHover}] transition-colors focus:outline-none focus:ring-2 focus:ring-[${colorAccentFocusRing}] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400`}
                            title="Edit note"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline -mt-0.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: deleteMutation.isPending ? 1 : 1.05 }} whileTap={{ scale: deleteMutation.isPending ? 1 : 0.95 }}>
                        <button
                            onClick={handleDeleteClick}
                            disabled={deleteMutation.isPending}
                            className={`px-3 py-1.5 text-sm bg-[${colorAccent}] text-white rounded-md shadow-sm hover:bg-[${colorAccentHover}] transition-colors focus:outline-none focus:ring-2 focus:ring-[${colorAccentFocusRing}] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400`}
                            title="Delete note"
                        >
                            {deleteMutation.isPending ? (
                                <div className='flex items-center'>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </div>
                            ) : (
                                <div className='flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline -mt-0.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </div>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Note Body Rendered with ReactMarkdown */}
            <motion.div
                variants={contentVariants}
                className={`prose prose-lg max-w-none prose-stone text-[${colorText}] prose-headings:text-[${colorHeading}] prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:text-[${colorHeading}]`} // Added prose text/heading colors and link styling
            >
                {/* Add 'break-words' class to handle long non-breaking strings */}
                <ReactMarkdown className="break-words">
                    {noteData.body}
                </ReactMarkdown>
            </motion.div>
        </motion.div>
    );
};

export default NoteView;