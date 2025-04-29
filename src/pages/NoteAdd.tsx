import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import NoteEditor from '../components/NoteEditor';
import GenoteApi from '../utils/GenoteApi';
import { useAuth } from '../utils/AuthProvider';

// --- Interfaces ---
interface NoteData {
    title: string;
    body: string;
    folderId: number;
}

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

// --- API Call Functions ---
const handleGetFolderById = async (
    folderId: number,
    token: string | undefined
): Promise<AxiosResponse<ApiFolder>> => {
    if (!token) throw new Error("Authentication token is required.");
    if (typeof folderId !== 'number' || isNaN(folderId)) {
        throw new Error("Valid Folder ID is required to fetch folder details.");
    }
    return await GenoteApi.get<ApiFolder>(`api/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

const handleBackendSave = async (
    data: NoteData,
    token: string | undefined
): Promise<AxiosResponse<any>> => {
    if (!token) throw new Error("Authentication token is required.");
    if (typeof data.folderId !== 'number' || isNaN(data.folderId)) {
        throw new Error("Valid Folder ID is required for saving the note.");
    }
    return await GenoteApi.post('api/notes', data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

// --- Animation Variants ---
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const headingVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5, ease: "easeOut" } },
};

const editorVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
};

const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', marginTop: '1rem', marginBottom: '1rem', transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 5, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.4, ease: "easeOut" } },
};

const loadingVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const colorAccent = '#A84C4C';
const colorAccentHover = '#c55a5a';

// --- Component ---
const NoteAdd: React.FC = () => {
    const { folderId: folderIdStr } = useParams<{ folderId: string }>();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const [noteTitle, setNoteTitle] = useState<string>('');
    const [noteContent, setNoteContent] = useState<string>('');
    const [displayError, setDisplayError] = useState<string | null>(null); // Combined error state for display
    const [folderId, setFolderId] = useState<number | undefined>(undefined);
    const [isInitialValidationDone, setIsInitialValidationDone] = useState(false);

    useEffect(() => {
        let currentError: string | null = null;
        if (folderIdStr) {
            const id = parseInt(folderIdStr, 10);
            if (!isNaN(id)) {
                setFolderId(id);
            } else {
                console.error("Invalid Folder ID in URL:", folderIdStr);
                currentError = "Invalid Folder ID provided in the URL.";
                setFolderId(undefined);
            }
        } else {
            console.error("Folder ID missing from URL.");
            currentError = "Cannot add note: Folder ID is missing from the URL.";
            setFolderId(undefined);
        }
        setDisplayError(currentError);
        setIsInitialValidationDone(true); // Mark validation as done
    }, [folderIdStr]);

    const {
        data: folderDataResponse,
        isLoading: isLoadingFolder,
        isError: isFolderError,
    } = useQuery<AxiosResponse<ApiFolder>, AxiosError<ApiErrorData>>({
        queryKey: ['folder', folderId],
        queryFn: () => handleGetFolderById(folderId as number, getToken()),
        enabled: typeof folderId === 'number' && !isNaN(folderId) && !!getToken(),
        retry: false,
        staleTime: 5 * 60 * 1000,
        // Set error state if folder fetch fails *after* initial validation passed
    });

    const {
        mutate,
        isPending: isSaving,
        error: mutationErrorObject, // Store mutation error object
    } = useMutation<AxiosResponse<any>, AxiosError<ApiErrorData>, NoteData>({
        mutationFn: (data: NoteData) => handleBackendSave(data, getToken()),
        onSuccess: (response) => {
            console.log('Note saved successfully!', response.data);
            setDisplayError(null); // Clear error on success
            if (folderId) {
                queryClient.invalidateQueries({ queryKey: ['notes', folderId.toString()] }); // Ensure key matches query
                queryClient.invalidateQueries({ queryKey: ['folders'] });
                navigate(`/note/${folderId}`);
            } else {
                navigate('/folder'); // Fallback
            }
        },
        onError: (err) => {
            const apiErrorMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail;
            const message = apiErrorMessage || err.message || "An unknown error occurred while saving the note.";
            setDisplayError(message); // Update display error
            console.error("Save failed:", err);
        },
    });

    const handleTitleChange = (newTitle: string) => setNoteTitle(newTitle);
    const handleContentChange = (newContent: string) => setNoteContent(newContent);

    const handleSave = () => {
        // Clear previous save error before attempting save
        if (mutationErrorObject) setDisplayError(null);

        if (typeof folderId !== 'number') {
            setDisplayError("Cannot save: Invalid or missing Folder ID.");
            return;
        }
        if (isFolderError || !folderDataResponse?.data) {
            setDisplayError("Cannot save: Failed to load parent folder details or folder does not exist.");
            return;
        }

        const finalTitle = noteTitle.trim() || "Untitled Note";
        if (!confirm(`Save this note?\n\nTitle: ${finalTitle}\nFolder: ${folderDataResponse.data.name}`)) return;

        mutate({ folderId, title: finalTitle, body: noteContent });
    };

    const getFolderNameStatus = (): string => {
        if (!isInitialValidationDone && !folderId) return '...'; // Initial state before validation
        if (typeof folderId !== 'number') return '(Invalid Folder)';
        if (isLoadingFolder) return 'Loading folder...';
        if (isFolderError) return '(Error Loading Folder)';
        if (folderDataResponse?.data?.name) return `to ${folderDataResponse.data.name}`;
        return `to Folder ${folderId}`;
    };

    // Combined disabled state check
    const isDisabled = typeof folderId !== 'number' || isLoadingFolder || isFolderError || isSaving;

    return (
        <motion.div
            variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen"
        >
            <motion.h2
                variants={headingVariants}
                className="text-2xl font-semibold mb-4 text-gray-700"
            >
                Add New Note {getFolderNameStatus()}
            </motion.h2>

            <AnimatePresence>
                {displayError && (
                    <motion.p
                        variants={errorVariants} initial="initial" animate="animate" exit="exit"
                        className="text-red-600 bg-red-100 p-3 rounded border border-red-300"
                    >
                        Error: {displayError}
                    </motion.p>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLoadingFolder && (
                    <motion.p
                        variants={loadingVariants} initial="initial" animate="animate" exit="exit"
                        className="text-gray-500 mb-4"
                    >
                        Loading folder details...
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Render editor and button container only if initial validation passed and no folder loading error */}
             {isInitialValidationDone && typeof folderId === 'number' && !isFolderError && (
                <motion.div variants={editorVariants} initial="initial" animate="animate">
                    <NoteEditor
                        defaultTitle={noteTitle}
                        defaultText={noteContent}
                        onTitleChange={handleTitleChange}
                        onContentChange={handleContentChange}
                    />

                    <motion.button
                        variants={buttonVariants}
                        onClick={handleSave}
                        disabled={isDisabled} // Use combined disabled state
                        whileHover={{ scale: isDisabled ? 1 : 1.05, backgroundColor: isDisabled ? '#9CA3AF' : colorAccentHover }}
                        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                        className={`
                            mt-5 px-6 py-2 bg-[${colorAccent}] text-white rounded-md font-medium
                            focus:outline-none focus:ring-2 focus:ring-[${colorAccentHover}] focus:ring-offset-2
                            dark:focus:ring-offset-gray-900 transition-colors duration-150 ease-in-out
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400
                        `} // Standard disabled styles
                    >
                        {isSaving ? 'Saving...' : 'Save Note'}
                    </motion.button>
                 </motion.div>
            )}

            {/* Message for invalid initial folder ID */}
            {isInitialValidationDone && typeof folderId !== 'number' && (
                 <motion.p
                    variants={loadingVariants} initial="initial" animate="animate" exit="exit" // Reuse loading variant for fade-in
                    className="text-gray-500 mt-4"
                 >
                    Please check the URL or navigate from a valid folder to add a note.
                 </motion.p>
             )}
        </motion.div>
    );
};

export default NoteAdd;