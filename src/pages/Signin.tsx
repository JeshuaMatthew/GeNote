import { useForm, SubmitHandler } from "react-hook-form";
import GenoteApi from "../utils/GenoteApi";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../utils/AuthProvider";
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import { AxiosError, AxiosResponse } from "axios"; // Import Axios types

// --- Interfaces ---

interface AuthResponse {
  access_token: string;
}

interface UserData {
  email: string;
  password: string;
}

// Define potential API error structure
interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: { [key: string]: string[] }; // For validation errors
}

// Define structure of decoded JWT (adjust based on your actual token payload)
interface DecodedToken {
  sub?: string | number; // Standard subject claim often holds user ID
  userId?: string | number; // Custom claim might be 'userId'
  // Add other claims if needed (e.g., name, roles)
  exp?: number; // Expiration time
  iat?: number; // Issued at time
}

// --- API Call Function ---

const LoginBackend = async (data: UserData): Promise<AxiosResponse<AuthResponse>> => {
  // Explicitly type the potential error response
  return await GenoteApi.post<AuthResponse>("api/auth/login", data);
}

// --- Helper Function ---

function getUserIdFromToken(token: string): string | null {
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    // Prioritize 'userId' claim, fallback to 'sub', return as string or null
    const userId = decodedToken.userId ?? decodedToken.sub;
    return userId ? String(userId) : null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// --- Component ---

const Signin = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<UserData>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation<
    AxiosResponse<AuthResponse>, // Success type
    AxiosError<ApiErrorData>,    // Error type
    UserData                     // Variables type
  >({
    mutationFn: LoginBackend,
    onSuccess: (response) => {
      const token = response.data.access_token;
      const userId = getUserIdFromToken(token);

      login(token); // Update auth context

      if (userId) {
        Cookies.set('userId', userId, { expires: 7, secure: true, sameSite: 'Strict' }); // Add security attributes
      } else {
        console.warn("Could not extract userId from token.");
        // Handle cases where userId isn't found if necessary
      }

      navigate('/note'); // Navigate after successful login and setup
    },
    onError: (error) => {
      console.error("Login failed:", error);
      const responseData = error.response?.data;

      // Clear previous server errors
      setError("root.serverError", { message: '' });

      // Handle specific API error messages
      if (responseData?.message && typeof responseData.message === 'string') {
        setError("root.serverError", { type: "server", message: responseData.message });
      } else if (responseData?.error) {
        setError("root.serverError", { type: "server", message: responseData.error });
      }
      // Handle validation errors (less common for login, but possible)
      else if (responseData?.errors) {
         // Often login errors are general, but handle field-specific if backend provides them
        const firstErrorField = Object.keys(responseData.errors)[0];
        const firstErrorMessage = responseData.errors[firstErrorField][0];
        setError("root.serverError", { type: "server", message: firstErrorMessage || "Invalid credentials or server error." });
      }
      // Fallback generic error
      else if (error.response?.status === 401) {
           setError("root.serverError", { type: "server", message: "Invalid email or password." });
      } else {
         setError("root.serverError", { type: "server", message: "Login failed. Please check your connection or try again later." });
      }
    }
  });

  const submitHandler: SubmitHandler<UserData> = (data) => {
    setError("root.serverError", { message: '' }); // Clear previous errors
    mutation.mutate(data);
  };

  // --- Animation Variants (Reusing from Register where applicable) ---
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

  const colorDark = '#A84C4C';
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
        className="hidden md:block w-1/3 max-w-md rounded-lg shadow-lg"
        src="https://images.unsplash.com/photo-1518976024611-28bf4b48222e?q=80&w=1885&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Desk with laptop"
        variants={imageVariants}
      />
      <motion.div
        className="w-full max-w-sm bg-white p-6 md:p-8 rounded-lg shadow-xl"
        variants={formContainerVariants}
      >
        <motion.div
          className="flex flex-col h-fit mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5 } }}
        >
          <h2 className={`text-2xl font-semibold text-[${colorDark}] mb-1`}>Welcome Back!</h2>
          <p className="text-sm text-gray-600">
            Sign in to access your notes
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-4"
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
              disabled={mutation.isPending}
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
              {...register("password", { required: "Password is required." })}
              whileFocus={{ scale: 1.02 }}
              disabled={mutation.isPending}
            />
             <AnimatePresence>
              {errors.password && (
                <motion.p className="text-red-500 text-xs mt-1" variants={errorVariants} initial="initial" animate="animate" exit="exit">
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div className="flex flex-col space-y-2 items-center justify-center pt-4" variants={formItemVariants}>
            <motion.button
              className={`bg-[${colorDark}] hover:bg-[${colorDarkHover}] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
              type="submit"
              disabled={mutation.isPending}
              whileHover={{ scale: mutation.isPending ? 1 : 1.03 }}
              whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
            >
              {mutation.isPending ? 'Signing In...' : 'Sign In'}
            </motion.button>
            <motion.a
              href="/register"
              className="text-xs text-sky-600 hover:text-sky-800 hover:underline transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
            >
              Don't have an account? Register
            </motion.a>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

export default Signin;