import { useNavigate, Link } from "react-router-dom"; // Use Link for client-side routing
import UserDropdownButton from "./UserDropDownButton";
import { useAuth } from "../utils/AuthProvider";
import { motion } from "framer-motion"; // Import motion

const Navbar = () => {
    const navigate = useNavigate(); // Still useful for programmatic navigation if needed
    const { isAuthenticated } = useAuth();

    // --- Animation Variants ---
    const navbarVariants = {
        hidden: { y: -40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const navContentVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.1, delayChildren: 0.1 } // Stagger link appearance
        }
    };

    const linkItemVariants = {
        hidden: { y: -10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
    };

    // --- Style Constants ---
    const linkStyle = `px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150`;
    const brandStyle = `text-xl font-bold font-kalnia text-[#A84C4C]`; // Example accent color

    return (
        <motion.nav
            className="text-black bg-white px-4 sm:px-8 py-3 fixed z-50 w-full shadow-md" // Adjusted padding, increased z-index
            variants={navbarVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto flex items-center justify-between">

                {/* Use Link for client-side navigation */}
                <motion.div variants={linkItemVariants}>
                    <Link to="/" className={brandStyle}>
                        GeNote
                    </Link>
                </motion.div>


                <motion.div
                    className="space-x-1 sm:space-x-3 flex items-center" // Adjusted spacing
                    variants={navContentVariants} // Apply stagger parent variant
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={linkItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {/* Use Link component */}
                        <Link to="/" className={linkStyle}>
                            Home
                        </Link>
                    </motion.div>

                    {!isAuthenticated
                        ? (
                            <motion.div variants={linkItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/signin" className={linkStyle}>
                                    Sign In
                                </Link>
                            </motion.div>
                          )
                        : (
                            <>
                                <motion.div variants={linkItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/folder" className={linkStyle}>
                                        My Folders
                                    </Link>
                                </motion.div>
                                {/* Wrap dropdown in motion.div if you want it to animate in as a block */}
                                <motion.div variants={linkItemVariants}>
                                    <UserDropdownButton />
                                </motion.div>
                            </>
                          )}
                </motion.div>
            </div>
        </motion.nav>
    );
}

export default Navbar;