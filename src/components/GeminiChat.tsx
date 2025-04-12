import { useState } from "react";

const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Define colors
  const colorDark = '#A84C4C';
  const colorMedium = '#DEB7B7';
  const colorDarkHover = '#934242';
  // Define Slate color for background
  const slateBg = 'slate-100'; // Chat background

  return (
    <>
      {/* Chat Window */}
      <div
        className={`
          fixed bottom-0 left-0 z-50
          bg-white /* Main window frame remains white */
          rounded-t-lg shadow-xl
          w-full
          h-[70vh] max-h-[500px]
          transition-all duration-300 ease-in-out
          flex flex-col
          ${
            isOpen
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
          }
        `}
        aria-hidden={!isOpen}
      >
        {/* Chat Header */}
        {/* Dark background, WHITE text/icon */}
        <div className={`flex items-center justify-between p-4 bg-[${colorDark}] text-white rounded-t-lg`}>
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
              <h3 className="font-semibold text-lg font-kalnia">Gemini</h3>
              <button
                onClick={toggleChat}
                className={`text-white hover:text-[${colorMedium}] focus:outline-none focus:ring-2 focus:ring-white rounded`}
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
        </div>

        {/* Chat Body (Scrollable) */}
        {/* SLATE background */}
        <div className={`flex-grow p-4 overflow-y-auto bg-${slateBg}`}>
          <div className="max-w-4xl mx-auto">

            {/* User message bubble: REVERTED to Dark background, Light text */}
            <div className="mb-2 text-right">
              <span className={`inline-block bg-[${colorDark}] text-white text-sm p-2 rounded-lg max-w-[80%] sm:max-w-[70%]`}> {/* Reverted bg and text */}
                Okay, the user bubble is back to the dark red background.
              </span>
            </div>

            {/* Agent message bubble: Medium background, Dark text (unchanged) */}
            <div className="mb-2 text-left">
              <span className={`inline-block bg-[${colorMedium}] text-[${colorDark}] text-sm p-2 rounded-lg max-w-[80%] sm:max-w-[70%]`}>
                Got it. User bubbles are dark red again, chat background is slate, and header text is white.
              </span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        {/* White background, Medium border */}
        <div className={`p-4 border-t border-[${colorMedium}] bg-white`}>
          <div className="flex items-center space-x-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Type your message..."
              className={`flex-grow p-2 border border-[${colorMedium}] rounded-md focus:outline-none focus:ring-2 focus:ring-[${colorDark}]`}
              aria-label="Chat message input"
            />
            <button
              // Dark background/hover, WHITE icon, Dark focus ring
              className={`p-2 bg-[${colorDark}] text-white rounded-md hover:bg-[${colorDarkHover}] focus:outline-none focus:ring-2 focus:ring-[${colorDark}] focus:ring-offset-1`}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Button */}
      {/* Dark background/hover, WHITE emoji, Dark focus ring */}
      <button
        onClick={toggleChat}
        className={`
          fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50
          bg-[${colorDark}] text-white
          p-3 rounded-full shadow-lg
          text-2xl md:text-3xl
          flex items-center justify-center
          hover:bg-[${colorDarkHover}] focus:outline-none
          focus:ring-2 focus:ring-[${colorDark}] focus:ring-offset-2
          transition-all duration-200 ease-in-out
          ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
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