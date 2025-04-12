import { useForm } from "react-hook-form";
import GenoteApi from "../utils/GenoteApi";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

interface UserData{
  name : string;
  email : string;
  password : string
}

interface RegisterFormFields{
  username : string;
  email : string;
  password : string;
  repassword : string

}

const BackendHandleRegister = async (data : UserData) =>{
  return await GenoteApi.post("api/register", data);
}




const Register = () => {
  const {register, handleSubmit, formState : {errors}} = useForm<RegisterFormFields>();

  const [isPwCorrect, setisPwCorrect]  = useState(false);

  const {mutate, isSuccess} = useMutation({
    mutationFn : BackendHandleRegister
  });

  const navigate = useNavigate();


  useEffect(() =>{
    if(isSuccess){
      navigate("/signin");
    }
  }, [isSuccess]);


  const submitHandler = (data : RegisterFormFields) =>{
    if(data.password == data.repassword){
      const registerDat : UserData = {
        name : data.username,
        email : data.email,
        password : data.password
      }
      mutate(registerDat)
    }else{
      setisPwCorrect(true);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen space-x-24 bg-white">
      <img className="hidden md:block w-1/3" src="https://images.unsplash.com/photo-1579017308347-e53e0d2fc5e9?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
      <div className="w-full max-w-[320px]">
        <div className="flex flex-col h-fit mb-6">
            <h2 className="text-center text-xl font-semibold">Create an account</h2>
            <a className="text-center text-gray-950 mb-6">
                Enter your credentials to register for this app
            </a>
        </div>

        <form className="bg-white rounded  pt-6 pb-8" onSubmit={handleSubmit(submitHandler)}>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none border-gray-300 focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              {...register("username",{required: "Username is required."})}
            />
            {
              errors.username && (
                <p className="text-red-500 italic">{errors.username.message}</p>
              )
            }
          </div>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none border-gray-300 focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              {...register("email",{required: "Email is required."})}
            />
            {
              errors.email && (
                <p className="text-red-500 italic">{errors.email.message}</p>
              )
            }
          </div>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none border-gray-300 focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              {...register("password",{required: "Password is required."})}
            />
             {
              errors.email && (
                <p className="text-red-500 italic">{errors.email.message}</p>
              )
            }
          </div>
          <div className="mb-6">
            <input
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none border-gray-300 focus:shadow-outline"
              id="re-password"
              type="password"
              placeholder="Re-password"
              {...register("repassword",{required: "Please re-enter your password"})}
            />
            {
              errors.email && (
                <p className="text-red-500 italic">{errors.email.message}</p>
              )
            }
            {
              isPwCorrect && (
                <p className="text-red-500 italic">Please make sure the password you enter are the same.</p>
              )
            }
          </div>
          <div className="flex flex-col space-y-1.5 items-center justify-center mt-15">
            <button
              className="bg-[#A84C4C] w-[200px] hover:bg-red-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Account
            </button>
            <a href="/signin" className="text-xs text-sky-500 hover:text-sky-300">Do you have account?</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register