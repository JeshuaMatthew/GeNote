import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import GenoteApi, { setAuthTokenOnGenoteApi } from '../utils/GenoteApi';
import { useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { set, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';





interface EditFormFields{
  name : string;
  email : string;
  password : string;
  id :  number
}

interface UserType{
  user : EditFormFields
}


  
  
  const BackendHandleEdit = async (id : string | undefined ,data : EditFormFields) =>{
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.put("api/users/"+ id, data);
  }

  const BackendHandleGet = async (id : string | undefined) =>{
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.get<UserType>("api/users/" + id);
  }


const colorDark = '#A84C4C';
const colorLight = '#FFEEEE';
const colorWhite = '#FFFFFF';
const colorDarkHover = '#934242';
const borderColor = 'border-gray-300';



const Users: React.FC = () => {

    const id = Cookies.get('userId')

    const {register, setValue ,handleSubmit,formState : {errors}} = useForm<EditFormFields>()

    const {mutate, isSuccess} = useMutation({
        mutationFn : (data : EditFormFields) => BackendHandleEdit(id,data)
      });

    const getUserDetail = useQuery({
        queryKey: ["userdata", id],
        queryFn : () => BackendHandleGet(id)
    })

    const submitHandler = (data : EditFormFields) => {

        mutate(data)
    }

    
    const [isEditing, setIsEditing] = useState<boolean>(false);
    
    
    
    useEffect(() =>{
        if(isEditing && getUserDetail.data?.data){
            setValue("name", getUserDetail.data?.data.user.name);
            setValue("email", getUserDetail.data?.data.user.email);
        }
    },[isEditing]);





  

  // --- Common Button Styles (unchanged) ---
  const primaryButtonStyle = `
    bg-[${colorDark}] hover:bg-[${colorDarkHover}] text-[${colorLight}]
    font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
    transition duration-150 ease-in-out w-full
  `;
  const secondaryButtonStyle = `
    bg-gray-300 hover:bg-gray-400 text-gray-800
    font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
    transition duration-150 ease-in-out w-full
  `;
  const inputStyle = `
    shadow appearance-none border ${borderColor} rounded-lg w-full
    py-2 px-3 text-gray-950 leading-tight
    focus:outline-none focus:shadow-outline
  `;

  // --- Base Transition Classes ---
  // Apply this to both display and edit blocks
  const transitionBaseClasses = `
    transition-all duration-300 ease-in-out
    absolute top-0 left-0 w-full
  `;

  if(!getUserDetail.isFetching){
    return (
      <div className={`min-h-screen bg-[${colorWhite}] p-4 md:p-8 flex justify-center items-center`}>
        <div className={`w-full max-w-md bg-[${colorWhite}] rounded-lg p-6 md:p-8`}>
  
          {/* --- Icon and Header (unchanged) --- */}
          <div className="mb-6 flex flex-col items-center">
            {/* ... (icon and h1 code remains the same) ... */}
             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 ">
                <svg
                  className="h-10 w-10 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="none"
                  aria-hidden="true"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
            </div>
            <h1 className={`text-xl md:text-2xl font-semibold text-[${colorDark}] text-center`}>
              User Profile
            </h1>
          </div>
          {/* --- End Icon and Header --- */}
          {/* --- Container for Absolute Positioned Content --- */}
          {/* Added 'relative' and 'min-h-[...]'. Adjust min-height as needed! */}
          <div className="relative min-h-[380px]"> {/* <-- Adjust min-height */}
  
              {/* --- Display Mode --- */}
              {/* Always rendered, controlled by opacity/transform/pointer-events */}
              <div
                className={`
                  ${transitionBaseClasses}
                  ${isEditing
                    ? 'opacity-0 -translate-y-3 pointer-events-none' // Hidden state
                    : 'opacity-100 translate-y-0'                 // Visible state
                  }
                  space-y-4 {/* Keep internal styles */}
                `}
                aria-hidden={isEditing} // Hide from accessibility tree when not visible
              >
                {/* Display content remains the same */}
                <div>
                  <label className={`block text-xs font-medium text-gray-600 mb-1`}>name</label>
                  <p className="text-base text-gray-800 py-1">{getUserDetail.data?.data.user.name}</p>
                </div>
                <hr className={borderColor}/>
                <div>
                  <label className={`block text-xs font-medium text-gray-600 mb-1`}>Email</label>
                  <p className="text-base text-gray-800 py-1">{getUserDetail.data?.data.user.email}</p>
                </div>
                <hr className={borderColor}/>
                <div className="pt-6">
                  <button onClick={() => setIsEditing(true)} className={primaryButtonStyle}>
                    Edit Profile
                  </button>
                </div>
              </div> 
              <form
                onSubmit={handleSubmit(submitHandler)}
                className={`
                  ${transitionBaseClasses}
                   ${isEditing
                     ? 'opacity-100 translate-y-0'                   // Visible state
                     : 'opacity-0 translate-y-3 pointer-events-none' // Hidden state
                   }
                  space-y-4 {/* Keep internal styles */}
                `}
                aria-hidden={!isEditing} // Hide from accessibility tree when not visible
              >
               
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-1`}>name</label>
                  <input type="text" id="name" {...register("name",{required: "name is required."})} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-1`}>Email</label>
                  <input type="email" id="email" {...register("email",{required: "Email is required."})} className={inputStyle} />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1`}>New Password <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input type="password" id="password"  {...register("password",{required: "Password is required."})} className={inputStyle} />
                </div>
                <div className="flex flex-col space-y-3 pt-4">
                  <button type="submit" className={primaryButtonStyle}>Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className={secondaryButtonStyle}>Cancel</button>
                </div>
              </form> 
  
          </div>
  
        </div>
      </div>
    );
  }
  
};

export default Users;