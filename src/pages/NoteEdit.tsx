import React, { use, useEffect, useState } from 'react';
import NoteEditor from '../components/NoteEditor'; // Adjust the path
import GenoteApi, { setAuthTokenOnGenoteApi } from '../utils/GenoteApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router';

interface NoteDat {
    title : string;
    body : string;
}

interface NoteType {
    note : NoteDat
}

const NoteEditorSkeleton = () => {
    return (
      // Reuse the exact same container classes for consistent layout
      <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Skeleton for the NoteEditor */}
        <div className="space-y-4">
          {/* Title Placeholder */}
          <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          {/* Body Placeholder - Taller */}
          <div className="h-40 md:h-64 bg-gray-300 rounded w-full animate-pulse"></div>
        </div>
  
        {/* Skeleton for the Button */}
        <div className="mt-5 h-10 w-28 bg-gray-300 rounded-md animate-pulse"></div>
      </div>
    );
  };
  

const handleBackendSave = async (noteId : string | undefined, data : NoteDat) =>{
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.put("api/notes/" + noteId, data)
}

const handleBackendGet = async (noteId : string | undefined) =>{
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.get<NoteType>("api/notes/" + noteId)
}


const NoteAdd: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>("");


  const {id} = useParams();

  const navigate = useNavigate();

  const getNoteDat = useQuery({
    queryKey : ["note", id],
    queryFn : () => handleBackendGet(id)
  })

    const {mutate, isSuccess} = useMutation({
        mutationFn : (data : NoteDat) => handleBackendSave(id, data)
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
        window.location.reload
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


  if(getNoteDat.isFetched && getNoteDat.data?.data.note){
    return (
        // Add padding and center content for the overall page
        <div className="container mx-auto p-4 md:p-8 bg-gray-50  min-h-screen">
            <NoteEditor
            defaultTitle={ getNoteDat.data?.data.note.title}
            defaultText={ getNoteDat.data?.data.note.body}
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
  }else{

    return(
        <NoteEditorSkeleton/>
    );
  }
  
};

export default NoteAdd;