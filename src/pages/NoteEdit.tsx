import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import NoteEditor from '../components/NoteEditor';
import GenoteApi from '../utils/GenoteApi';
import { useAuth } from '../utils/AuthProvider';

// --- Interfaces ---
interface ApiNote {
    id: number;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}

interface UpdateNoteData {
    title: string;
    body: string;
}

interface ApiErrorData {
    message?: string;
    error?: string;
    detail?: string;
}

// --- API Call Functions ---
const handleBackendGet = async (
    noteId: string | undefined,
    token: string | undefined
): Promise<AxiosResponse<ApiNote>> => {
    if (!token) throw new Error("Authentication token is required.");
    if (!noteId) throw new Error("Note ID is required for fetching.");
    return await GenoteApi.get<ApiNote>(`api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

const handleBackendSave = async (
    noteId: string | undefined,
    data: UpdateNoteData,
    token: string | undefined
): Promise<AxiosResponse<ApiNote>> => {
    if (!token) throw new Error("Authentication token is required.");
    if (!noteId) throw new Error("Note ID is required for saving.");
    return await GenoteApi.put<ApiNote>(`api/notes/${noteId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

// --- Skeleton Component ---
const NoteEditorSkeleton: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen"
    >
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            <div className="h-40 md:h-64 bg-gray-300 rounded w-full animate-pulse"></div>
        </div>
        <div className="mt-6 h-10 w-32 bg-gray-300 rounded-md animate-pulse"></div>
    </motion.div>
);

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
};

const errorVariants = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 5, height: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.4, ease: "easeOut" } },
};

const colorAccent = '#A84C4C';
const colorAccentHover = '#c55a5a';

// --- NoteEdit Component ---
const NoteEdit: React.FC = () => {
    const { id: noteId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const [noteTitle, setNoteTitle] = useState<string>('');
    const [noteContent, setNoteContent] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        data: noteDataResponse,
        isLoading: isLoadingNote,
        isError: isNoteFetchError,
        error: noteFetchErrorObject,
        isSuccess: isNoteFetchSuccess,
    } = useQuery<AxiosResponse<ApiNote>, AxiosError<ApiErrorData>>({
        queryKey: ['note', noteId],
        queryFn: () => handleBackendGet(noteId, getToken()),
        enabled: !!noteId && !!getToken(),
        retry: false,
    });

    useEffect(() => {
        if (isNoteFetchSuccess && noteDataResponse?.data) {
            const fetchedNote = noteDataResponse.data;
            setNoteTitle(fetchedNote.title);
            setNoteContent(fetchedNote.body);
            setErrorMessage(null);
        } else if (isNoteFetchError) {
            const apiErrorMessage = noteFetchErrorObject?.response?.data?.message ||
                                   noteFetchErrorObject?.response?.data?.error ||
                                   noteFetchErrorObject?.response?.data?.detail;
            setErrorMessage(apiErrorMessage || noteFetchErrorObject?.message || "Failed to load note details.");
        }
    }, [isNoteFetchSuccess, isNoteFetchError, noteDataResponse, noteFetchErrorObject]);

    const {
        mutate: updateNote,
        isPending: isSaving,
        error: saveErrorObject, // Can be used if needed, but errorMessage state is primary
    } = useMutation<
        AxiosResponse<ApiNote>,
        AxiosError<ApiErrorData>,
        UpdateNoteData
    >({
        mutationFn: (data: UpdateNoteData) => handleBackendSave(noteId, data, getToken()),
        onSuccess: (savedNoteResponse) => {
            console.log('Note updated successfully!', savedNoteResponse.data);
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['note', noteId] });
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            navigate('/folder');
        },
        onError: (err) => {
            const apiErrorMessage = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail;
            const message = apiErrorMessage || err.message || "An unknown error occurred while saving the note.";
            setErrorMessage(message);
            console.error("Save failed:", err);
        },
    });

    const handleTitleChange = (newTitle: string) => setNoteTitle(newTitle);
    const handleContentChange = (newContent: string) => setNoteContent(newContent);

    const handleSave = () => {
        const finalTitle = noteTitle.trim() || "Untitled Note";
        if (!confirm(`Save changes to this note?\n\nTitle: ${finalTitle}`)) return;
        setErrorMessage(null);
        updateNote({ title: finalTitle, body: noteContent });
    };

    if (isLoadingNote) {
        return <NoteEditorSkeleton />;
    }

    if (!noteId) {
        return (
             <motion.div
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center"
            >
                 <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-600">Error</motion.h2>
                <motion.p variants={editorVariants} className="text-red-500 mb-6">Note ID is missing from the URL.</motion.p>
                 <motion.button
                    variants={buttonVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/folder')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Go to Folders
                 </motion.button>
            </motion.div>
        );
    }

    const initialTitle = noteDataResponse?.data?.title;

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen"
        >
            <motion.h2
                variants={headingVariants}
                className="text-2xl font-semibold mb-6 text-gray-700"
            >
                Edit Note: <span className="font-normal italic">{initialTitle ?? 'Loading...'}</span>
            </motion.h2>

            <AnimatePresence>
                {errorMessage && (
                    <motion.div
                        variants={errorVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"
                    >
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{errorMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isNoteFetchError || errorMessage ? (
                 <motion.div variants={editorVariants}>
                     <NoteEditor
                         key={noteDataResponse?.data?.id || 'note-editor'}
                         defaultTitle={noteTitle}
                         defaultText={noteContent}
                         onTitleChange={handleTitleChange}
                         onContentChange={handleContentChange}
                     />
                 </motion.div>
            ) : null}


            {isNoteFetchSuccess && (
                <motion.button
                    variants={buttonVariants}
                    onClick={handleSave}
                    disabled={isSaving}
                    whileHover={{ scale: isSaving ? 1 : 1.05, backgroundColor: isSaving ? '#6B7280' : colorAccentHover }} // Conditional hover
                    whileTap={{ scale: isSaving ? 1 : 0.98 }}
                    className={`
                        mt-6 px-6 py-2 bg-[${colorAccent}] text-white rounded-md font-medium
                        focus:outline-none focus:ring-2 focus:ring-[${colorAccentHover}] focus:ring-offset-2
                        dark:focus:ring-offset-gray-900 transition-colors duration-150 ease-in-out
                        disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-500
                    `} // Use disabled: styles for cleaner state handling
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
            )}
        </motion.div>
    );
};

export default NoteEdit;