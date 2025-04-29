import  { useState, useEffect, useRef } from "react";
import UserBubble from "./UserBubble";
import GeminiBubble from "./GeminiBubble";
import GeminiApi from "../utils/GeminiApi";
import GenoteApi from "../utils/GenoteApi";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse, AxiosError } from "axios";
import { useAuth } from "../utils/AuthProvider";
import { motion, AnimatePresence } from 'framer-motion'; // <-- Import motion

// --- Interfaces ---
interface GeminiTextInput { text: string; }
interface GeminiPart { parts: GeminiTextInput[]; }
interface GeminiContentRequest { contents: GeminiPart[]; editingId?: number; }
interface GeminiApiResponseData { candidates: { content: { parts: { text: string }[], role: string }; }[]; }
interface ApiChatHistory { id: number; userId: number; prompt: string; ans: string; createdAt: string; updatedAt: string; }
interface SaveChatData { prompt: string; ans: string; }
interface ChatMessage { id?: number; userPrompt: string; aiAns: string; }
interface ApiErrorData { message?: string; error?: string; detail?: string; }

// --- API Call Functions ---
const handleGeminiRequest = async (data: GeminiContentRequest): Promise<AxiosResponse<GeminiApiResponseData>> => {
  const geminiPayload = { contents: data.contents };
  return await GeminiApi.post<GeminiApiResponseData>("", geminiPayload);
};

const handleGetChatHistory = async (token: string | undefined): Promise<AxiosResponse<ApiChatHistory[]>> => {
    if (!token) throw new Error("Authentication token required for fetching history.");
    return await GenoteApi.get<ApiChatHistory[]>('/api/chat-histories', {
        headers: { Authorization: `Bearer ${token}` },
    });
};

const handleSaveChatHistory = async (data: SaveChatData, token: string | undefined): Promise<AxiosResponse<ApiChatHistory>> => {
     if (!token) throw new Error("Authentication token required for saving history.");
     return await GenoteApi.post<ApiChatHistory>('/api/chat-histories', data, {
         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
     });
};

const handleUpdateChatHistory = async (chatId: number, data: SaveChatData, token: string | undefined): Promise<AxiosResponse<ApiChatHistory>> => {
    if (!token) throw new Error("Authentication token required for updating history.");
    if (!chatId) throw new Error("Chat ID required for update.");
    return await GenoteApi.put<ApiChatHistory>(`/api/chat-histories/${chatId}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
};

const handleDeleteChatHistory = async (chatId: number, token: string | undefined): Promise<AxiosResponse<any>> => {
    if (!token) throw new Error("Authentication token required for deleting history.");
    if (!chatId) throw new Error("Chat ID required for deletion.");
    return await GenoteApi.delete(`/api/chat-histories/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// --- Component ---
const GeminiChat = () => {
  // --- State & Hooks ---
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [mutationError, setMutationError] = useState<string | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<GeminiTextInput>();

  // --- Style Constants ---
  const colorDark = '#A84C4C';
  const colorMedium = '#DEB7B7';
  const colorDarkHover = '#934242';
  const slateBg = 'bg-slate-100';

  // --- React Query ---
  const historyQuery = useQuery<AxiosResponse<ApiChatHistory[]>, AxiosError<ApiErrorData>>({
    queryKey: ['chatHistory'],
    queryFn: () => handleGetChatHistory(getToken()),
    enabled: isOpen && !!getToken(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const geminiMutation = useMutation<AxiosResponse<GeminiApiResponseData>, AxiosError<ApiErrorData>, GeminiContentRequest>({
    mutationFn: handleGeminiRequest,
    onSuccess: (response, variables) => {
      const aiAns = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't process that response.";
      const userPrompt = variables.contents[0]?.parts[0]?.text ?? "";
      const editedId = variables.editingId;

      if (typeof editedId === 'number') {
        setChatHistory(prev => prev.map(item =>
            item.id === editedId ? { ...item, userPrompt: userPrompt, aiAns: aiAns } : item
        ));
        updateHistoryMutation.mutate({ chatId: editedId, data: { prompt: userPrompt, ans: aiAns } });
        setEditingChatId(null);
        setEditText('');
        setMutationError(null);
      } else {
        const newChatEntry: ChatMessage = { userPrompt, aiAns };
        // Add placeholder optimistically FIRST
        setChatHistory(prevHistory => [...prevHistory, newChatEntry]);
        reset({ text: "" });
        // Then trigger save
        saveHistoryMutation.mutate({ prompt: userPrompt, ans: aiAns });
      }
    },
    onError: (error, variables) => {
      console.error("Gemini API Error:", error);
      const errorMessage = (error.response?.data as ApiErrorData)?.message || error.message || "Failed to get response from AI.";
      if (variables.editingId) {
        setMutationError(`Error getting updated response: ${errorMessage}`);
      } else {
        setChatHistory(prevHistory => [...prevHistory, { userPrompt: "Error contacting AI", aiAns: errorMessage }]);
      }
    },
  });

  const saveHistoryMutation = useMutation<AxiosResponse<ApiChatHistory>, AxiosError<ApiErrorData>, SaveChatData>({
      mutationFn: (data) => handleSaveChatHistory(data, getToken()),
      onSuccess: (savedData) => {
          console.log("Chat history saved successfully:", savedData.data.id);
          // Update the item added optimistically with the real ID
          setChatHistory(prev => prev.map(item =>
              item.userPrompt === savedData.data.prompt && item.aiAns === savedData.data.ans && !item.id
              ? { ...item, id: savedData.data.id }
              : item
          ));
          setMutationError(null); // Clear error on successful save
      },
      onError: (error) => {
          console.error("Failed to save chat history:", error);
          setMutationError(`Failed to save message: ${(error.response?.data as ApiErrorData)?.message || error.message}`);
           // Optional: Remove the optimistic message on save failure? Or leave it with an error indicator?
           // setChatHistory(prev => prev.filter(item => !(item.userPrompt === error.variables.prompt && !item.id)));
      }
  });

  const updateHistoryMutation = useMutation<AxiosResponse<ApiChatHistory>, AxiosError<ApiErrorData>, { chatId: number; data: SaveChatData }>({
    mutationFn: ({ chatId, data }) => handleUpdateChatHistory(chatId, data, getToken()),
    onSuccess: (updatedData) => {
        console.log("Chat history updated successfully (Backend PUT):", updatedData.data);
        // No need to invalidate historyQuery here as the local state was updated optimistically
        setMutationError(null);
    },
    onError: (error, variables) => {
        console.error("Failed to update chat history (Backend PUT):", error);
        setMutationError(`Failed to save update for prompt ID ${variables.chatId}: ${(error.response?.data as ApiErrorData)?.message || error.message}`);
        // Consider reverting optimistic update here if needed, though often showing an error is enough
    }
  });

  const deleteHistoryMutation = useMutation<AxiosResponse<any>, AxiosError<ApiErrorData>, number>({
      mutationFn: (chatId) => handleDeleteChatHistory(chatId, getToken()),
      // Optimistic update for deletion
      onMutate: async (chatIdToDelete) => {
          // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          await queryClient.cancelQueries({ queryKey: ['chatHistory'] });
          // Snapshot the previous value
          const previousHistory = queryClient.getQueryData<AxiosResponse<ApiChatHistory[]>>(['chatHistory']);
          // Optimistically remove the item from the local state
          setChatHistory(prev => prev.filter(item => item.id !== chatIdToDelete));
          // Return a context object with the snapshotted value
          return { previousHistory };
      },
      onError: (err) => {
          console.error("Failed to delete chat history:", err);
          setMutationError(`Error deleting chat: ${(err.response?.data as ApiErrorData)?.message || err.message}`);
      },
      onSettled: () => {
          // Always refetch after error or success:
          queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
      },
      onSuccess: (chatId) => {
          console.log("Chat history deleted successfully:", chatId);
          setMutationError(null); // Clear error on successful deletion
      },
  });

  // --- Effects ---
  useEffect(() => {
    if (historyQuery.isSuccess && historyQuery.data) {
      const fetchedMessages: ChatMessage[] = historyQuery.data.data.map(item => ({
        id: item.id, userPrompt: item.prompt, aiAns: item.ans,
      }));
      // Prevent replacing local state if an edit is in progress, to avoid losing the edit text/state
      if (editingChatId === null) {
          setChatHistory(fetchedMessages);
      }
    } else if (historyQuery.isError) {
         console.error("Error fetching chat history:", historyQuery.error);
         setChatHistory([{ userPrompt: "System", aiAns: `Could not load previous chat history: ${historyQuery.error.message}` }]);
    }
     if (!isOpen || (historyQuery.isSuccess && editingChatId !== null && !historyQuery.data?.data.find(item => item.id === editingChatId))) {
        // Auto-cancel edit if chat closes or the item being edited disappears from fetched history
        setEditingChatId(null);
        setEditText('');
     }
  }, [historyQuery.isSuccess, historyQuery.isError, historyQuery.data, isOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      // Debounce or use a small delay if needed to ensure layout is complete after animations
      setTimeout(() => {
          if (chatBodyRef.current) {
              chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
          }
      }, 50); // Small delay might help after animations
    }
  }, [chatHistory, isOpen]); // Scroll when history changes or chat opens

  // --- Event Handlers ---
  const submitHandler: SubmitHandler<GeminiTextInput> = (promptData) => {
    if (!promptData.text.trim() || editingChatId !== null) return;
    setMutationError(null); // Clear previous errors
    const userParts: GeminiPart = { parts: [promptData] };
    const userContent: GeminiContentRequest = { contents: [userParts] };
    geminiMutation.mutate(userContent);
  };

  const toggleChat = () => { setIsOpen(!isOpen); };

  const handleEditClick = (chatItem: ChatMessage) => {
      if (isProcessing || editingChatId !== null || !chatItem.id) return;
      setEditingChatId(chatItem.id);
      setEditText(chatItem.userPrompt);
      setMutationError(null);
  };

  const handleCancelEdit = () => {
      setEditingChatId(null);
      setEditText('');
      setMutationError(null);
  };

  const handleSaveEdit = () => {
      if (editingChatId === null || !editText.trim() || isProcessing) return;
      setMutationError(null); // Clear previous errors
      const userParts: GeminiPart = { parts: [{ text: editText.trim() }] };
      const userContent: GeminiContentRequest = { contents: [userParts], editingId: editingChatId };
      geminiMutation.mutate(userContent);
  };

  const handleDeleteClick = (chatId: number | undefined) => {
      if (typeof chatId !== 'number' || isProcessing || editingChatId !== null) return;
      if (window.confirm("Are you sure you want to delete this chat entry?")) {
          setMutationError(null); // Clear previous errors
          deleteHistoryMutation.mutate(chatId);
      }
  };

  // --- UI ---
  const isLoadingHistory = historyQuery.isLoading || historyQuery.isFetching;
  const isProcessing = geminiMutation.isPending || saveHistoryMutation.isPending || updateHistoryMutation.isPending || deleteHistoryMutation.isPending;

  // --- Animation Variants ---
  const chatWindowVariants = {
      closed: { y: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
      open: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const fabVariants = {
      hidden: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
      visible: { scale: 1, opacity: 1, transition: { duration: 0.3, delay: 0.1 } }
  };

  const messageItemVariants = {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
      exit: { opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } }
  };

   const errorBoxVariants = {
        initial: { opacity: 0, height: 0, y: -10 },
        animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }
    };

   const editFormVariants = {
       initial: { opacity: 0, height: 0 },
       animate: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
       exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" } }
   };

  return (
    <>
      {/* Chat Window Container */}
      <motion.div
        className={`
          fixed bottom-0 left-0 z-[60] bg-white rounded-t-lg shadow-xl
          w-full h-[70vh] max-h-[600px] md:max-h-[500px] {/* Adjusted max-height */}
          flex flex-col overflow-hidden {/* Prevents content spill */}
        `}
        variants={chatWindowVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        aria-hidden={!isOpen}
      >
        {/* Chat Header */}
        <motion.div
            // Simple fade for header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
            className={`flex items-center justify-between p-4 bg-[${colorDark}] text-white rounded-t-lg flex-shrink-0`}
        >
          <h3 className="font-semibold text-lg font-kalnia">Gemini</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className={`text-white hover:text-[${colorMedium}] focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1`} // Added padding and rounded-full
            aria-label="Close chat"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>
          </motion.button>
        </motion.div>

        {/* Chat Body (Scrollable) */}
        <div ref={chatBodyRef} className={`flex-grow p-4 overflow-y-auto ${slateBg}`}>
          <div className="space-y-4 pb-4">
            {/* Loading Indicator */}
            <AnimatePresence>
              {isLoadingHistory && (
                  <motion.div
                     key="loading-history"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="text-center text-gray-500 text-sm"
                  >
                    Loading history...
                 </motion.div>
              )}
            </AnimatePresence>

             {/* General Mutation Error Display */}
             <AnimatePresence>
               {mutationError && (
                  <motion.div
                      key="mutation-error"
                      variants={errorBoxVariants} initial="initial" animate="animate" exit="exit"
                      className="text-red-600 text-sm text-center p-2 my-2 bg-red-100 rounded border border-red-300"
                  >
                      Error: {mutationError}
                  </motion.div>
               )}
             </AnimatePresence>

            {/* Empty State */}
             <AnimatePresence>
              {!isLoadingHistory && chatHistory.length === 0 && !mutationError && (
                  <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} exit={{ opacity: 0 }}
                      className="text-center text-gray-500 text-sm mt-10"
                  >
                      Chat history is empty. Ask something!
                  </motion.div>
              )}
             </AnimatePresence>

            {/* Chat History */}
             <AnimatePresence initial={false}> {/* initial=false prevents initial animation on load */}
              {!isLoadingHistory && chatHistory.map((chatItem) => (
                <motion.div
                    key={chatItem.id ?? `temp-${chatItem.userPrompt.slice(0,10)}-${Math.random()}`} // Ensure unique key for optimistic items
                    variants={messageItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout // Animate layout changes (e.g., when edit buttons appear/disappear)
                    className="relative" // Needed for absolute positioning of buttons
                >
                    {/* System/Error Messages */}
                    {chatItem.userPrompt === "System" || chatItem.userPrompt === "Error contacting AI" ? (
                        <div className={`text-sm text-center p-2 rounded ${chatItem.userPrompt === "System" ? 'text-gray-600 bg-gray-200' : 'text-red-600 bg-red-100'}`}>
                            {chatItem.aiAns}
                        </div>
                    ) : (
                        // --- User Prompt / Edit Area ---
                        <div className="mb-2"> {/* Group user prompt/edit with buttons */}
                            <AnimatePresence mode="wait"> {/* Smooth transition between display/edit */}
                                {editingChatId === chatItem.id ? (
                                    // --- Edit Mode UI ---
                                    <motion.div
                                        key="edit-mode"
                                        variants={editFormVariants} initial="initial" animate="animate" exit="exit"
                                        className="p-3 rounded-lg bg-blue-100 max-w-[80%] ml-auto shadow"
                                    >
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-none"
                                            rows={3} autoFocus
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } else if (e.key === 'Escape') { handleCancelEdit(); }}}
                                            disabled={isProcessing}
                                        />
                                        <div className="flex justify-end space-x-2 mt-1">
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveEdit} className="px-2 py-0.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={isProcessing || !editText.trim()}>
                                                {geminiMutation.isPending && geminiMutation.variables?.editingId === chatItem.id ? 'Saving...' : 'Save'}
                                            </motion.button>
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancelEdit} className="px-2 py-0.5 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded disabled:opacity-50" disabled={isProcessing}>
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    // --- Display Mode UI ---
                                    <motion.div key="display-mode" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                        <UserBubble prompt={chatItem.userPrompt} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Edit/Delete Buttons (Only in Display Mode & if ID exists) */}
                            {editingChatId !== chatItem.id && chatItem.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute -bottom-3 right-0 flex space-x-1 z-10" // Ensure buttons are clickable
                                >
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEditClick(chatItem)} disabled={isProcessing || editingChatId !== null} className="p-0.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed" title="Edit prompt">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"> <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /> </svg>
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDeleteClick(chatItem.id)} disabled={isProcessing || editingChatId !== null} className="p-0.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed" title="Delete chat entry">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg>
                                    </motion.button>
                                </motion.div>
                             )}
                        </div> // End user prompt/edit group
                    )}

                    {/* AI Answer Bubble */}
                    {chatItem.userPrompt !== "System" && chatItem.userPrompt !== "Error contacting AI" && editingChatId !== chatItem.id && (
                        // Fade in answer bubble
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}>
                            <GeminiBubble Ans={chatItem.aiAns} />
                        </motion.div>
                    )}
                </motion.div>
              ))}
             </AnimatePresence>

             {/* Loading Indicator for a *new* AI Response */}
             <AnimatePresence>
                {geminiMutation.isPending && !geminiMutation.variables?.editingId && (
                    <motion.div
                        key="loading-new-response"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <GeminiBubble Ans="Thinking..." /> {/* Use a specific thinking message */}
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Chat Input Area */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
            className={`p-4 border-t border-[${colorMedium}] bg-white flex-shrink-0`}
        >
          {/* Show input form only if NOT editing */}
          <AnimatePresence mode="wait">
            {editingChatId === null ? (
                <motion.form
                    key="input-form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center space-x-2"
                    onSubmit={handleSubmit(submitHandler)}
                >
                    <input
                        type="text"
                        placeholder="Ask Gemini..."
                        className={`flex-grow p-2 border border-[${colorMedium}] rounded-md focus:outline-none focus:ring-2 focus:ring-[${colorDark}] disabled:bg-gray-100 text-sm`}
                        aria-label="Chat message input"
                        {...register("text")}
                        disabled={isLoadingHistory || isProcessing}
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 bg-[${colorDark}] text-white rounded-md hover:bg-[${colorDarkHover}] focus:outline-none focus:ring-2 focus:ring-[${colorDark}] focus:ring-offset-1 disabled:opacity-50`}
                        aria-label="Send message"
                        type="submit"
                        disabled={isLoadingHistory || isProcessing}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </motion.button>
                </motion.form>
            ) : (
                <motion.div
                    key="edit-message"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center text-sm text-gray-500 italic py-2" // Added padding
                >
                    Finish editing the message above.
                </motion.div>
             )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Sticky Button to Toggle Chat */}
      <motion.button
        onClick={toggleChat}
        variants={fabVariants}
        initial="hidden" // Start hidden if chat is initially closed (or vice versa)
        animate={isOpen ? "hidden" : "visible"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[55] {/* Ensure FAB is below open chat */}
          bg-[${colorDark}] text-white
          p-3 rounded-full shadow-lg
          text-2xl md:text-3xl flex items-center justify-center
          hover:bg-[${colorDarkHover}] focus:outline-none
          focus:ring-2 focus:ring-[${colorDark}] focus:ring-offset-2
          transition-colors duration-200 ease-in-out {/* Added transition for colors */}
        `}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        style={{ width: '56px', height: '56px' }}
      >
        ✨ {/* Sparkles Icon */}
      </motion.button>
    </>
  );
}

export default GeminiChat;