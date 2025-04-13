import axios from 'axios';
import React, { useState, useEffect, useRef, FC, MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate, NavigateFunction, useMatch } from 'react-router-dom'; // Assuming react-router-dom v6+
import GenoteApi, { setAuthTokenOnGenoteApi } from '../utils/GenoteApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

// Define Props type if needed (none in this case, but good practice)
// interface UserDropdownButtonProps {
//   userId: number; // Example prop
// }

interface UserType{
    user : UserData
  }


interface UserData{
    name : string;
    email : string;
    password : string;
    id :  number
}

const GetUserDataBackend = async (id : string | undefined) => {
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.get<UserType>("api/users/" + id)
}

const LogoutBackendHandle = async (userDat : UserType) =>{
    setAuthTokenOnGenoteApi(Cookies.get('token'))
    return await GenoteApi.post("api/logout", userDat)
}

const UserDropdownButton: FC = () => { // Using FC (Functional Component) type
  const navigate: NavigateFunction = useNavigate(); // Type the navigate function
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // State typed as boolean
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Ref typed for a DIV element or null
  const id = Cookies.get('userId')

  const {mutate, isSuccess} = useMutation({
    mutationFn : LogoutBackendHandle
  })

  // Function to toggle dropdown visibility
  const toggleDropdown = (): void => { // Explicitly void return type
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to handle navigation to user page
  const handleUserClick = (): void => {
    navigate("/user/"+id); // Or your dynamic user route: navigate(`/user/${props.userId}`);
    setIsDropdownOpen(false); // Close dropdown after click
  };

  const getUserDetail = useQuery({
    queryKey: ["userdata", id],
    queryFn : () => GetUserDataBackend(id)
})


  // Function to handle logout action
  const handleLogoutClick = (): void => {
    // --- Add your actual logout logic here ---
    
    setIsDropdownOpen(false); 
    if(!confirm("Are you sure you wan't to logout ?")) return;

    if(getUserDetail.data?.data){
        mutate(getUserDetail.data?.data)
        navigate("/")
    }else{
        return
    }
  };

  useEffect(()=>{
    if(isSuccess){
        Cookies.remove('token')
        Cookies.remove('userId')
        window.location.reload()
    }
    },[isSuccess])

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    // Type the event as MouseEvent (from the browser DOM)
    const handleClickOutside = (event: MouseEvent): void => {
      // Check if the ref exists, if the clicked target is a Node, and if it's outside the ref'd element
      if (
        dropdownRef.current &&
        event.target instanceof Node && // Type guard to ensure target is a Node
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };


    // Add listener only when dropdown is open
    if (isDropdownOpen) {
      // Use 'mousedown' event type which corresponds to MouseEvent
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function to remove listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]); // Dependency array remains the same

  return (
    // Use a relative container to position the absolute dropdown correctly
    // Attach the ref to the container div
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        {/* Button element with type="button" */}
        <button
          type="button"
          // onClick handler type is inferred correctly by React's TS types (React.MouseEvent<HTMLButtonElement>)
          onClick={toggleDropdown}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:bg-gray-300"
          id="options-menu-button"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <span className="sr-only">Open user menu</span>
          <svg
            className="h-5 w-5 text-gray-500"
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
        </button>
      </div>

      {/* Dropdown Panel - Conditional Rendering */}
      {isDropdownOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu-button"
          tabIndex={-1} // Note: lowercase 'i' for tabIndex in React/TSX
        >
          <div className="py-1" role="none">
            <button
              // onClick type inferred as React.MouseEvent<HTMLButtonElement>
              onClick={handleUserClick}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              tabIndex={-1}
              id="options-menu-item-0"
            >
              User Profile
            </button>
            <button
              // onClick type inferred as React.MouseEvent<HTMLButtonElement>
              onClick={handleLogoutClick}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              tabIndex={-1}
              id="options-menu-item-1"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdownButton;