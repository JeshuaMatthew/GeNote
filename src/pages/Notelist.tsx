import { useState, useEffect } from 'react';
import Note from "../components/Note";
import NoteListSkeleton from '../components/NoteListSkeleton.tsx';
import GenoteApi from '../utils/GenoteApi.tsx';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom'; // Corrected import for Link
import { AxiosResponse, AxiosError } from 'axios';
import { useAuth } from '../utils/AuthProvider.tsx';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion

// --- Interfaces ---
interface ApiResponseNote {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteData {
  id: string;
  title: string;
  color: string;
  body: string;
}

interface ApiErrorData {
    message?: string;
    error?: string;
    detail?: string;
}

// --- Helper Functions ---
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

const selectRandColor = (): string => {
  const colorSelection: string[] = ["#FFEEEE", "#DEB7B7", "#FEA2A2", "#F8AD9D", "#FBC4AB"];
  return colorSelection[getRandomInt(colorSelection.length)];
};

const generateNotesWithColors = (fetchedNotes: ApiResponseNote[]): NoteData[] => {
  if (!fetchedNotes) return [];

  return fetchedNotes.map((note) => ({
    id: note.id.toString(),
    title: note.title,
    body: note.body,
    color: selectRandColor(),
  }));
};

const getErrorMessage = (err: AxiosError<ApiErrorData> | null): string => {
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
    return "Failed to load notes. Please check your connection or try again later.";
  };


// --- API Call ---
const handleGetNote = async (folderId: string | undefined, token : string | undefined): Promise<AxiosResponse<ApiResponseNote[]>> => {
  if (!folderId) {
     throw new Error("Folder ID is required to fetch notes.");
  }
  if (!token) {
    throw new Error("Authentication token is required.")
  }
  return await GenoteApi.get<ApiResponseNote[]>(`api/notes/folder/${folderId}`, {
     headers: { Authorization: `Bearer ${token}` },
  });
};


// --- Component ---
const Notelist = () => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const { id: folderId } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const getNoteData = useQuery<AxiosResponse<ApiResponseNote[]>, AxiosError<ApiErrorData>>({
    queryFn: () => handleGetNote(folderId, getToken()),
    queryKey: ['notes', folderId], // Key depends on folderId
    enabled: !!folderId && !!getToken(),
    retry: false,
  });

  useEffect(() => {
    if (getNoteData.isSuccess && getNoteData.data) {
       const fetchedApiNotes = getNoteData.data.data;
       if (fetchedApiNotes) {
         setNotes(generateNotesWithColors(fetchedApiNotes));
       } else {
         console.warn("Fetched notes data is undefined/null despite success status.");
         setNotes([]);
       }
    } else if (getNoteData.isError) {
        console.error("Error fetching notes:", getNoteData.error.response?.data || getNoteData.error.message);
        setNotes([]);
    }
  }, [getNoteData.isSuccess, getNoteData.isError, getNoteData.data, getNoteData.error]); // Removed folderId, getToken as query handles dependency

  const isLoading = getNoteData.isLoading || getNoteData.isFetching;
  const isError = getNoteData.isError;
  const error = getNoteData.error;

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
    animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }, // Stagger children animation
  };

   const itemVariants = {
    initial: { opacity: 0, scale: 0.85, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
        className="flex flex-col min-h-screen mt-10 space-y-8 pb-10 "
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
    >

    {/* Floating Action Button */}
    <motion.div
        className="fixed bottom-20 right-5 md:right-10 z-50"
        variants={fabVariants}
        initial="initial" // Already handled by parent stagger, but can be explicit
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
            to={`/notes/add/${folderId}`}
            className="
            bg-[#A84C4C] hover:bg-[#934242]
            text-white
            p-3
            rounded-full
            shadow-lg
            transition-colors duration-200 ease-in-out
            flex items-center justify-center
            "
            title="Add new note"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </Link>
    </motion.div>

      <motion.h2
        className="font-kalnia text-2xl font-semibold max-w-2xs md:ml-20 ml-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.4 } }}
       >
        Manage your notes and task!
      </motion.h2>

      {/* Quote section */}
       <motion.div
        className="flex mx-auto items-center rounded-lg space-x-4 px-3 py-3 bg-[#FFEEEE] max-w-md w-full shadow"
        variants={quoteVariants}
        initial="initial"
        animate="animate"
      >
         <div className="w-[45px] bg-[#eec2c2] rounded-xl p-2 flex-shrink-0">
          <svg data-slot="icon" aria-hidden="true" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className='text-white'>
            <path d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <div className="flex flex-col text-center flex-grow min-w-0">
          <h4 className="font-kalnia font-semibold">Today's Quotes !</h4>
          <p className="text-sm md:text-base">Success is not final, failure is not fatal: it is the courage to continue that counts.</p>
        </div>
      </motion.div>

      {/* Content Area: Loading, Error, Notes, or Empty State */}
      <div className="flex flex-wrap gap-6 md:gap-8 mx-auto max-w-[1200px] justify-center md:justify-start px-4 "> {/* Added padding */}
        {isLoading ? (
          // Skeleton doesn't need complex animation, maybe a simple fade if desired
          <NoteListSkeleton count={6} /> // Increased count for better visual
        ) : isError ? (
           <motion.p
             className="text-center mt-40 text-red-500 w-full px-4"
             variants={messageVariants}
             initial="initial"
             animate="animate"
             exit="exit"
           >
              {getErrorMessage(error)}
           </motion.p>
        ) : notes.length > 0 ? (
            <motion.div
                className="flex flex-wrap gap-6 md:gap-8 justify-center md:justify-start w-full" // Ensure container takes width
                variants={listVariants}
                initial="initial"
                animate="animate" // Trigger stagger animation
            >
                <AnimatePresence>
                    {notes.map((note) => (
                        <motion.div
                            key={note.id} // Key must be on the motion component for AnimatePresence
                            layout // Animate layout changes smoothly
                            variants={itemVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            whileHover={{ y: -5, transition: { duration: 0.2 } }} // Subtle lift on hover
                        >
                            <Note
                                id={note.id}
                                title={note.title}
                                body={note.body}
                                color={note.color}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
          ) : (
            <motion.p
              className="text-center mt-40 text-gray-500 w-full"
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              You haven't added any notes to this folder yet. Click the '+' button to add one!
            </motion.p>
          )}
       </div>
    </motion.div>
  );
};

export default Notelist;