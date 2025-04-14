import ReactMarkdown from "react-markdown";
import { useNavigate } from 'react-router-dom';
import GenoteApi, {  setAuthTokenOnGenoteApi } from "../utils/GenoteApi";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

interface NoteData {
  title: string;
  color: string;
  body: string;
  id : string
}

const handleDeleteNote = async (id : string | undefined) => {
  setAuthTokenOnGenoteApi(Cookies.get('token'))
  return await GenoteApi.delete("api/notes/"+ id)
}


const Note: React.FC<NoteData> = (props) => {
  const navigate = useNavigate();
  const noteBgStyle: string = `relative bg-[#${props.color}] h-[280px] md:h-[300px] w-[180px] md:w-[300px] flex flex-col space-y-3 py-4 px-7 rounded-lg overflow-clip justify-center prose group`;

  const handleEdit = () => {
    navigate("/edit/"+ props.id);
  };

  const {mutate, isSuccess} = useMutation({
    mutationFn : () => handleDeleteNote(props.id)
  })

  const handleDelete = () => {
    mutate()
    window.location.reload
  }

  useEffect(() => {
    if(isSuccess){
      window.location.reload
    }
  },[isSuccess])


  return (
    <div className={noteBgStyle}>

      <p className="text-center text-lg font-semibold">{props.title}</p>

      <ReactMarkdown className="h-36   text-sm overflow-clip">{props.body}</ReactMarkdown>

      <div className="flex justify-center space-x-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={handleEdit} className="bg-transparent text-black px-2 py-1 rounded-lg text-xs flex flex-col items-center hover:text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
          Edit
        </button>

        <button onClick={handleDelete} className="bg-transparent text-black px-2 py-1 rounded-lg text-xs flex flex-col items-center hover:text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 ">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Delete
        </button>
      </div>
    </div>
    
  );
};

export default Note;