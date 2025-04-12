import { useForm } from "react-hook-form";
import GenoteApi from "../utils/GenoteApi";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { data, useNavigate } from "react-router";
import Cookies from "js-cookie";
  interface auth {
    access_token : string
  }

  interface UserData{
    email : string;
    password : string
  }

  const LoginBackend = async (data : UserData) => {
    return await GenoteApi.post<auth>("api/login", data);
  }
  


  const Signin = () => {

    const {register, handleSubmit, formState : {errors}} = useForm<UserData>();

    const {mutate, isSuccess} = useMutation({
      mutationFn : LoginBackend,
      onSuccess : (data) => Cookies.set('token', data.data.access_token, {expires : 7})
    }) 

    const navigate = useNavigate();



    const submitHandler = (data : UserData) => {
        mutate(data)
     }

     useEffect(() => {
      if(isSuccess){
        navigate('/note')
      }
     }, [isSuccess])
    


    return (
      <div className="flex items-center justify-center min-h-screen space-x-24 bg-white">
        <img className="hidden md:block w-1/3" src="https://images.unsplash.com/photo-1518976024611-28bf4b48222e?q=80&w=1885&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
        <div className="w-full max-w-[320px]">
          <div className="flex flex-col h-fit mb-6">
              <h2 className="text-center text-xl font-semibold">Sign up now</h2>
              <a className="text-center text-gray-950 mb-6">
                  Enter your email to sign up for this app
              </a>
          </div>

          <form onSubmit={handleSubmit(submitHandler)} className="bg-white rounded  pt-6 pb-8 ">
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none border-gray-300 focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                {...register("email",{required : "Username is required."})}
              />
            </div>
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none border-gray-300 focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Password"
                {...register("password",{required : "password is required."})}
              />
            </div>
            <div className="flex flex-col space-y-1.5 items-center justify-center mt-15">
              <button
                className="bg-[#A84C4C] w-[200px] hover:bg-red-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign in
              </button>
              <a href="/register" className="text-xs text-sky-500 hover:text-sky-300">Don't have an account?</a>
            </div>
          </form>
        </div>
      </div>
    )
  }

  export default Signin



