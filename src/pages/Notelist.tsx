// src/pages/Notelist.tsx (or wherever your Notelist component is)
import { useState, useEffect } from 'react'; // Import useState and useEffect
import Note from "../components/Note";
import NoteListSkeleton from '../components/NoteListSkeleton.tsx'; // Import the skeleton
import GenoteApi, { setAuthTokenOnGenoteApi } from '../utils/GenoteApi.tsx';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';

interface NoteData {
  id: string; // Add an ID for the key prop
  title: string;
  color: string;
  body: string;
}

interface NoteAttributes{
  title : string;
  id : string;
  body : string
  user_id : string
}

interface Notes {
  notes : NoteAttributes[]
}

function getRandomInt(max : number) {
  return Math.floor(Math.random() * max);
}

const handleGetNote = async () => {
  setAuthTokenOnGenoteApi(Cookies.get('token'))
  return await GenoteApi.get<Notes>("api/notes/");
} 

const selectRandColor = (): string =>{
  const colorSelection : string[] = ["FFEEEE", "DEB7B7", "fea2a2"]
  return colorSelection[getRandomInt(3)]
}

const generateRandColor = (fetchedNote : Notes): NoteData[] =>{
    let newNoteDat : NoteData[] = []
    for(let i = 0; i < fetchedNote.notes.length; i++){
      newNoteDat.push({
        id : fetchedNote.notes[i].id,
        title : fetchedNote.notes[i].title,
        body : fetchedNote.notes[i].body,
        color : selectRandColor()
      })
    }

    return newNoteDat;
}

const Notelist = () => {
  const [notes, setNotes] = useState<NoteData[]>([]); // Initialize notes as empty

  const userId = Cookies.get('userId')

  const getNoteData = useQuery({
    queryKey : ['notes', userId],
    queryFn : handleGetNote
  })

  useEffect(() => {
    if(getNoteData.isFetched){

      if(getNoteData.data?.data.notes){
        setNotes(generateRandColor(getNoteData.data.data))
        console.log("masuk")
      }
    }
  }, [getNoteData.isFetched]);

  return (
    <div className="flex flex-col min-h-screen mt-10 space-y-8 pb-10"> {/* Added pb-10 */}
      <h2 className="font-kalnia text-2xl font-semibold max-w-2xs md:ml-20 ml-2">
        Manage your notes and task!
      </h2>

      {/* --- Today's Quotes Section (Remains the same) --- */}
      <div className="flex mx-auto items-center rounded-lg space-x-4 px-3 py-3 bg-[#FFEEEE] max-w-md w-full">
        <div className="w-[45px] bg-[#eec2c2] rounded-xl p-2 flex-shrink-0">
          <svg data-slot="icon" aria-hidden="true" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <div className="flex flex-col text-center flex-grow min-w-0"> {/* Allow text to wrap */}
          <h4 className="font-kalnia font-semibold">Today's Quotes !</h4>
          <p className="text-sm md:text-base">Success is not final, failure is not fatal: it is the courage to continue that counts.</p> {/* Slightly longer quote */}
        </div>
      </div>

      {/* --- Conditional Rendering for Notes/Skeleton --- */}
      {getNoteData.isFetching ? (
        <NoteListSkeleton /> // Show Skeleton when loading
      ) : (
        // Show actual notes when loaded
        // Using gap for better grid spacing instead of space-y
        <div className="flex flex-wrap gap-6 md:gap-8 mx-auto max-w-[800px] justify-around">
          {notes.length > 0 ? (
             notes.map((note) => (
                <Note
                    id={note.id} // Use unique ID for key
                    title={note.title}
                    body={note.body}
                    color={note.color} // Pass color prop
                />
            ))
          ) : (
            <p className="text-center mt-40 text-gray-500 col-span-full">You haven't added any notes yet</p> // Handle empty state
          )}
        </div>
      )}
    </div>
  );
}

export default Notelist;