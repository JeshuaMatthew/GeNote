import { useForm, SubmitHandler } from "react-hook-form";
import GenoteApi from "../utils/GenoteApi";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import { AxiosError } from "axios"; // Import AxiosError for typing

// --- Interfaces ---

interface UserData {
  username: string;
  email: string;
  password: string
}

interface RegisterFormFields {
  username: string;
  email: string;
  password: string;
  repassword: string;
}

// Define a potential API error structure
interface ApiErrorData {
  message?: string | { [key: string]: string[] }; // Backend might return object with field errors
  error?: string;
  errors?: { [key: string]: string[] }; // Common Laravel validation error structure
}

// --- API Call Function ---

const BackendHandleRegister = async (data: UserData) => {
  // Explicitly type the potential error response
  return await GenoteApi.post<any, AxiosError<ApiErrorData>>("api/auth/register", data);
}

// --- Component ---

const Register = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterFormFields>();
  const navigate = useNavigate();

  const [passwordMismatchError, setPasswordMismatchError] = useState(false);

  const mutation = useMutation<
    any, // Success type (adjust if backend returns specific data on success)
    AxiosError<ApiErrorData>, // Error type
    UserData // Variables type
  >({
    mutationFn: BackendHandleRegister,
    onSuccess: () => {
      // Navigate on success (consider adding a success message/toast)
      navigate("/signin");
    },
    onError: (error) => {
      // Handle API errors
      console.error("Registration failed:", error);
      const responseData = error.response?.data;

      // Handle Laravel validation errors specifically
      if (responseData?.errors) {
        Object.entries(responseData.errors).forEach(([field, messages]) => {
          // Map backend fields to form fields if necessary
          let formField = field as keyof RegisterFormFields;
          // Example mapping if backend uses 'password_confirmation' but form uses 'repassword'
          // if (field === 'password_confirmation') formField = 'repassword';

          setError(formField, {
            type: "server",
            message: messages[0] // Show the first error message for the field
          });
        });
      }
      // Handle general message/error fields
      else if (responseData?.message && typeof responseData.message === 'string') {
         setError("root.serverError", { type: "server", message: responseData.message });
      } else if (responseData?.error) {
         setError("root.serverError", { type: "server", message: responseData.error });
      }
      // Fallback generic error
      else {
         setError("root.serverError", { type: "server", message: "Registration failed. Please try again." });
      }
    }
  });

  const submitHandler: SubmitHandler<RegisterFormFields> = (data) => {
    // Clear previous errors before submitting
    setPasswordMismatchError(false);
    setError("root.serverError", { message: '' }); // Clear general server error

    if (data.password !== data.repassword) {
      setPasswordMismatchError(true);
      setError("repassword", { type: "manual", message: "Passwords do not match." });
      return; // Stop submission if passwords don't match
    }

    const registerData: UserData = {
      username: data.username,
      email: data.email,
      password: data.password
    };
    mutation.mutate(registerData);
  };

  // --- Animation Variants ---
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const formContainerVariants = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

   const imageVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.2 } },
  };

   const formItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const errorVariants = {
    initial: { opacity: 0, height: 0, marginTop: 0 },
    animate: { opacity: 1, height: 'auto', marginTop: '0.25rem', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }
  };

  const colorDark = '#A84C4C'; // Define color for reuse
  const colorDarkHover = '#8B3E3E'; // Darker hover

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen space-x-24 bg-white p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.img
        className="hidden md:block w-1/3 max-w-md rounded-lg shadow-lg" // Added styling
        src="https://images.unsplash.com/photo-1579017308347-e53e0d2fc5e9?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Abstract background"
        variants={imageVariants} // Apply image animation
      />
      <motion.div
        className="w-full max-w-sm bg-white p-6 md:p-8 rounded-lg shadow-xl" // Enhanced styling
        variants={formContainerVariants} // Apply form container animation
      >
        <motion.div
          className="flex flex-col h-fit mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5 } }}
        >
            <h2 className={`text-2xl font-semibold text-[${colorDark}] mb-1`}>Create an account</h2>
            <p className="text-sm text-gray-600">
                Enter your credentials to register
            </p>
        </motion.div>

        {/* Stagger children animation for form elements */}
        <motion.form
          className="space-y-4" // Use space-y for consistent spacing
          onSubmit={handleSubmit(submitHandler)}
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
        >
          {/* Server Error Display */}
          <AnimatePresence>
             {errors.root?.serverError && (
               <motion.p
                 className="text-sm bg-red-100 text-red-700 p-3 rounded border border-red-300 text-center"
                 variants={errorVariants}
                 initial="initial"
                 animate="animate"
                 exit="exit"
               >
                 {errors.root.serverError.message}
               </motion.p>
             )}
           </AnimatePresence>


          <motion.div variants={formItemVariants}>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <motion.input
              className={`shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none focus:ring-1 focus:ring-[${colorDark}] focus:border-[${colorDark}] ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              id="username"
              type="text"
              placeholder="Your username"
              {...register("username", { required: "Username is required." })}
              whileFocus={{ scale: 1.02 }}
              disabled={mutation.isPending} // Disable while submitting
            />
            <AnimatePresence>
              {errors.username && (
                <motion.p className="text-red-500 text-xs mt-1" variants={errorVariants} initial="initial" animate="animate" exit="exit">
                  {errors.username.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={formItemVariants}>
             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <motion.input
              className={`shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none focus:ring-1 focus:ring-[${colorDark}] focus:border-[${colorDark}] ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              whileFocus={{ scale: 1.02 }}
              disabled={mutation.isPending} // Disable while submitting
            />
            <AnimatePresence>
              {errors.email && (
                 <motion.p className="text-red-500 text-xs mt-1" variants={errorVariants} initial="initial" animate="animate" exit="exit">
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={formItemVariants}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <motion.input
              className={`shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none focus:ring-1 focus:ring-[${colorDark}] focus:border-[${colorDark}] ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required.",
                minLength: { value: 8, message: "Password must be at least 8 characters." }
              })}
              whileFocus={{ scale: 1.02 }}
              disabled={mutation.isPending} // Disable while submitting
            />
            <AnimatePresence>
              {errors.password && (
                <motion.p className="text-red-500 text-xs mt-1" variants={errorVariants} initial="initial" animate="animate" exit="exit">
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={formItemVariants}>
             <label htmlFor="repassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <motion.input
              className={`shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-950 leading-tight focus:outline-none focus:ring-1 focus:ring-[${colorDark}] focus:border-[${colorDark}] ${errors.repassword || passwordMismatchError ? 'border-red-500' : 'border-gray-300'}`}
              id="repassword"
              type="password"
              placeholder="••••••••"
              {...register("repassword", { required: "Please re-enter your password." })}
              whileFocus={{ scale: 1.02 }}
              disabled={mutation.isPending} // Disable while submitting
            />
            <AnimatePresence>
              {errors.repassword && (
                 <motion.p className="text-red-500 text-xs mt-1" variants={errorVariants} initial="initial" animate="animate" exit="exit">
                  {errors.repassword.message}
                </motion.p>
              )}
            </AnimatePresence>
             {/* Removed the separate passwordMismatchError display as it's now handled by setError */}
          </motion.div>

          <motion.div className="flex flex-col space-y-2 items-center justify-center pt-4" variants={formItemVariants}>
            <motion.button
              className={`bg-[${colorDark}] hover:bg-[${colorDarkHover}] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
              type="submit"
              disabled={mutation.isPending} // Disable button when submitting
              whileHover={{ scale: mutation.isPending ? 1 : 1.03 }}
              whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
            >
              {mutation.isPending ? 'Creating Account...' : 'Create Account'}
            </motion.button>
            <motion.a
              href="/signin"
              className="text-xs text-sky-600 hover:text-sky-800 hover:underline transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }} // Slightly delayed appearance
            >
              Already have an account? Sign In
            </motion.a>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

export default Register;