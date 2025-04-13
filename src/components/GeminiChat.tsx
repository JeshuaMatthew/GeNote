import React, { useState, useEffect, useRef } from "react"; // Import React, useEffect, useRef
import UserBubble from "./UserBubble";
import GeminiBubble from "./GeminiBubble";
import GeminiApi from "../utils/GeminiApi"; // Assuming GeminiApi is your configured Axios instance
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios"; // Import AxiosResponse type

// --- Interfaces ---

interface GeminiTextInput {
  text: string;
}

interface GeminiPart {
  parts: GeminiTextInput[]; // Gemini API expects an array of parts
}

interface GeminiContentRequest {
  contents: GeminiPart[]; // Gemini API expects an array of contents (for history)
}

// Define the expected structure of the successful API response
interface GeminiApiResponseData {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
            role: string;
        };
        // Add other potential fields if needed, like finishReason, safetyRatings
    }[];
    // Add other potential top-level fields if needed, like promptFeedback
}

interface ChatMessage {
  userPrompt: string;
  aiAns: string;
}

// --- API Call Function ---

// Define expected type for Axios response based on Gemini API structure
const handleGeminiRequest = async (data: GeminiContentRequest): Promise<AxiosResponse<GeminiApiResponseData>> => {
  // Type the expected response data structure
  return await GeminiApi.post<GeminiApiResponseData>("", data); // Pass type argument to post
};


// --- Component ---

const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GeminiTextInput>();

  const { mutate, isPending, isError, error } = useMutation<
    AxiosResponse<GeminiApiResponseData>, // Success response type
    Error,                            // Error type
    GeminiContentRequest              // Variables type (data sent to mutation)
  >({
    mutationFn: handleGeminiRequest,
    onSuccess: (response, variables) => {
      // Extract the AI's response text
      // Use optional chaining for safety in case the structure is unexpected
      const aiAns = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that response.";

      // Extract the user's prompt from the variables sent to mutate
      // Assuming single content and single part for user input based on submitHandler
      const userPrompt = variables.contents[0]?.parts[0]?.text || "";

      // Update chat history
      const newChatEntry: ChatMessage = { userPrompt, aiAns };
      setChatHistory(prevHistory => [...prevHistory, newChatEntry]);

      // Clear the form input
      reset({ text: "" });
    },
    onError: (error) => {
      console.error("Gemini API Error:", error);
      // Optionally add an error message to the chat history
      setChatHistory(prevHistory => [...prevHistory, { userPrompt: "Error", aiAns: `Failed to get response: ${error.message}` }]);
    },
  });

  const submitHandler = (promptData: GeminiTextInput) => {
    // Basic validation: Don't submit empty prompts
    if (!promptData.text.trim()) {
      return;
    }

    const userParts: GeminiPart = {
      parts: [promptData] // API expects parts as an array
    };

    // Prepare the request payload
    // For simplicity, we're sending only the current prompt.
    // For a conversational context, you'd include previous messages here.
    const userContent: GeminiContentRequest = {
      contents: [userParts] // API expects contents as an array
    };

    // Trigger the mutation
    mutate(userContent);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Scroll to bottom when chat history updates or chat opens/closes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);


  // Define colors (using direct hex values for Tailwind compatibility)
  const colorDark = '#A84C4C';
  const colorMedium = '#DEB7B7';
  const colorDarkHover = '#934242';
  const slateBg = 'bg-slate-100'; // Chat background

  return (
    <>
      {/* Chat Window */}
      <div
        className={`
          fixed bottom-0 left-0 z-50
          bg-white 
          rounded-t-lg shadow-xl
          w-full 
          
          h-[70vh] max-h-[500px]
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
          }
        `}
        aria-hidden={!isOpen}
      >
        {/* Chat Header */}
        {/* Use direct hex values or pre-defined Tailwind colors */}
        <div className={`flex items-center justify-between p-4 bg-[#A84C4C] text-white rounded-t-lg flex-shrink-0`}>
           {/* Removed max-w-4xl mx-auto from header as it seems too wide for a chat popup */}
          <h3 className="font-semibold text-lg font-kalnia">Gemini</h3>
          <button
            onClick={toggleChat}
            className={`text-white hover:text-[#DEB7B7] focus:outline-none focus:ring-2 focus:ring-white rounded`}
            aria-label="Close chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chat Body (Scrollable) */}
        <div ref={chatBodyRef} className={`flex-grow p-4 overflow-y-auto ${slateBg}`}>
          {/* Removed max-w-4xl mx-auto, content should fill chat body width */}
          <div className="space-y-4"> {/* Add spacing between bubbles */}
            {chatHistory.map((chatItem, index) => (
              <React.Fragment key={index}> {/* Use Fragment for keys */}
                <UserBubble prompt={chatItem.userPrompt} />
                {/* Add conditional rendering for error messages if needed */}
                {chatItem.userPrompt !== "Error" && <GeminiBubble Ans={chatItem.aiAns} />}
                {/* Or display error differently */}
                {chatItem.userPrompt === "Error" && <div className="text-red-600 text-sm text-center p-2 bg-red-100 rounded">{chatItem.aiAns}</div>}
              </React.Fragment>
            ))}

            {/* Show loading indicator */}
            {isPending && <GeminiBubble Ans="..." />}

            {/* Optional: Display a general error message if mutation failed but wasn't added to history */}
            {/* {isError && !isPending && ( // Avoid showing general error if specific error added
                 <div className="text-red-600 text-sm text-center p-2 bg-red-100 rounded">
                    {`Error: ${error?.message || 'Failed to fetch response'}`}
                 </div>
            )} */}
          </div>
        </div>

        {/* Chat Input */}
        <div className={`p-4 border-t border-[#DEB7B7] bg-white flex-shrink-0`}>
           {/* Removed max-w-4xl mx-auto */}
          <form className="flex items-center space-x-2" onSubmit={handleSubmit(submitHandler)}>
            <input
              type="text"
              placeholder="Type your message..."
              className={`flex-grow p-2 border border-[#DEB7B7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A84C4C] disabled:bg-gray-100`}
              aria-label="Chat message input"
              {...register("text")} // No need for required validation here if handled in submitHandler
              disabled={isPending} // Disable input while loading
            />
            <button
              className={`p-2 bg-[#A84C4C] text-white rounded-md hover:bg-[#934242] focus:outline-none focus:ring-2 focus:ring-[#A84C4C] focus:ring-offset-1 disabled:opacity-50`}
              aria-label="Send message"
              type="submit"
              disabled={isPending} // Disable button while loading
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
           {errors.text && <p className="text-red-500 text-xs mt-1">Message cannot be empty.</p>} {/* Optional: Display validation error */}
        </div>
      </div>

      {/* Sticky Button */}
      <button
        onClick={toggleChat}
        className={`
          fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 /* Lower z-index than chat window */
          bg-[#A84C4C] text-white
          p-3 rounded-full shadow-lg
          text-2xl md:text-3xl
          flex items-center justify-center
          hover:bg-[#934242] focus:outline-none
          focus:ring-2 focus:ring-[#A84C4C] focus:ring-offset-2
          transition-all duration-200 ease-in-out
          ${isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}
        `}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        style={{ width: '56px', height: '56px' }}
      >
        ✨
      </button>
    </>
  );
}

export default GeminiChat;