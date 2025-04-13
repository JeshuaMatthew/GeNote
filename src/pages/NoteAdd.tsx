import React, { useEffect, useState } from 'react';
import NoteEditor from '../components/NoteEditor'; // Adjust the path
import GenoteApi, { setAuthTokenOnGenoteApi } from '../utils/GenoteApi';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';

interface NoteDat {
    title : string;
    body : string;
}

const handleBackendSave = async (data : NoteDat) =>{
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.post("api/notes", data)
}


const NoteAdd: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState<string>('My Note');
  const [noteContent, setNoteContent] = useState<string>('');

  const navigate = useNavigate();

    const {mutate, isSuccess} = useMutation({
        mutationFn : handleBackendSave
    }) 

  const handleTitleChange = (newTitle: string) => {
    console.log("Title changed in parent:", newTitle);
    setNoteTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    console.log("Content changed in parent:", newContent);
    setNoteContent(newContent);
  };

  useEffect(() => {
    if(isSuccess){
        navigate('/note')
    }

  }, [isSuccess])

  


  const handleSave = () => {
    if(!confirm(`Saving Note:\nTitle: ${noteTitle}`))return

    const note : NoteDat = {
        title : noteTitle,
        body : noteContent
    }
    mutate(note);

  }

  return (
    // Add padding and center content for the overall page
    <div className="container mx-auto p-4 md:p-8 bg-gray-50  min-h-screen">
      <NoteEditor
        defaultTitle={noteTitle}
        defaultText=""
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
      />

        <button
          onClick={handleSave}
          // Standard button styling with hover and focus states
          className="mt-5 px-4 py-2 bg-[#A84C4C] text-white rounded-md hover:bg-[#DEB7B7] focus:outline-none focus:ring-2 focus:ring-[#DEB7B7] focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        >
          Save Note
        </button>

    </div>
  );
};

export default NoteAdd;