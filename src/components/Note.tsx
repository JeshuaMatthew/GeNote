import React from 'react'; // No longer need useEffect or useMutation here
import ReactMarkdown from "react-markdown";
import { useNavigate } from 'react-router-dom';
// Removed GenoteApi, useMutation, useEffect, useAuth as delete is gone

interface NoteData {
  title: string;
  color: string; // Keep color for accent
  body: string;
  id: string;
}

const Note: React.FC<NoteData> = (props) => {
  const navigate = useNavigate();



  // Define base styles and hover effects using Tailwind classes
  const noteCardClasses = `
    bg-[${props.color}] 
    text-black    
    w-full max-w-[180px] md:max-w-[300px] 
    min-h-[200px] md:min-h-[240px]
    min-w-[250px]
    p-5                            
    rounded-lg                     
    shadow-md                        
    border-t-4    
    border-gray-300                  
    flex flex-col                    
    overflow-hidden                  
    cursor-pointer                   
    transition-all duration-200 ease-in-out 
    hover:shadow-xl                 
    hover:-translate-y-1            
  `;

  return (
    // Apply combined classes and the dynamic border color style
    <div
      className={noteCardClasses}
      onClick={() => navigate("/note/view/" + props.id)} // Navigate on click
      title={`View note: ${props.title}`} // Accessibility tooltip
    >
      {/* Note Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
        {props.title}
      </h3>

      {/* Note Body Preview using ReactMarkdown */}
      {/* Apply line-clamp to limit visible lines and show ellipsis */}
      <div className="text-sm text-gray-600 flex-grow line-clamp-5 md:line-clamp-6">
        {/* Using a div wrapper around ReactMarkdown can sometimes help with styling/clamping */}
        <ReactMarkdown components={{ p: React.Fragment }}>{/* Render paragraphs without extra margins potentially */}
          {props.body}
        </ReactMarkdown>
      </div>

      {/* Removed the Edit/Delete button section */}

    </div>
  );
};

export default Note;