import React from 'react';
import Markdown from 'markdown-to-jsx';
import { useNavigate } from 'react-router-dom';

interface NoteData {
  title: string;
  color: string;
  body: string;
  id: string;
}

const Note: React.FC<NoteData> = (props) => {
  const navigate = useNavigate();

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
    <div
      className={noteCardClasses}
      onClick={() => navigate("/note/view/" + props.id)}
      title={`View note: ${props.title}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
        {props.title}
      </h3>

      <div className="text-sm text-gray-600 flex-grow line-clamp-5 md:line-clamp-6">
        <Markdown
          options={{
            overrides: {
              p: {
                component: React.Fragment,
              },
            },
          }}
        >
          {props.body}
        </Markdown>
      </div>
    </div>
  );
};

export default Note;