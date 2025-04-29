import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import GeminiImg from '../assets/Gemini.svg'

const ScrollReveal = ({ children , once = true, threshold = 0.1, className = "", variants: propVariants, staggerChildren = 0, delayChildren = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const defaultVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: staggerChildren,
        delayChildren: delayChildren
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={propVariants || defaultVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25, delayChildren: 0.2 }
  }
};

const heroTextItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const heroButtonVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } }
};

const heroBgVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "circOut" } }
};

const meetGeNoteVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const featureSectionParentVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.3 }
    }
};

const featureContentLeftVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } }
};

const featureContentRightVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } }
};

const Home = () => {

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col space-y-20"
    >

      <div className="grid grid-cols-3 grid-rows-3 w-full text-center md:bg-transparent bg-[#b16a6a]">
        <motion.div
            className="col-start-1 col-end-4 row-start-1 -z-30 row-end-4 blur-sm brightness-50 hidden md:block"
            variants={heroBgVariants}
            initial="hidden"
            animate="visible"
        >
            <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1532620651297-482fe21279f2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="hero-bg" />
        </motion.div>
        <motion.div
            className="col-start-1 col-end-4 row-start-2 row-end-3 flex flex-col space-y-8 items-center text-white"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
        >
          <motion.p variants={heroTextItemVariants} className="font-semibold lg:text-6xl md:text-3xl text-5xl font-kalnia">Welcome</motion.p>
          <motion.p variants={heroTextItemVariants} className="font-semibold text-2xl ">Redefine your <span className="font-kalnia underline">note-taking</span> journey today</motion.p>
          <motion.a
            href="/register"
            variants={heroButtonVariants}
            whileHover={{ scale: 1.05, backgroundColor: "#bb4646", color: "#FFFFFF" }}
            whileTap={{ scale: 0.95 }}
            className="font-semibold text-xl px-10 py-3 rounded-lg w-fit bg-white text-[#bb4646] transition-colors duration-200"
          >
            Join now!
          </motion.a>
        </motion.div>
      </div>

      <div className="bg-white">
        <div className="flex flex-col space-y-16 p-3 mx-auto max-w-[1200px] mb-36">
          <ScrollReveal variants={meetGeNoteVariants} className="font-semibold md:text-4xl text-xl text-center my-72 text-[#b16a6a]">
            Meet <span className="font-kalnia">GeNote</span>!
          </ScrollReveal>

          <ScrollReveal className="flex flex-col lg:flex-row gap-4 items-center" variants={featureSectionParentVariants} threshold={0.2}>
            <motion.img variants={featureContentLeftVariants} whileHover={{ scale: 1.03 }} className="w-full md:w-1/2 lg:w-auto max-w-lg rounded-lg shadow-md object-cover lg:h-[370px]" src="https://images.unsplash.com/photo-1527345931282-806d3b11967f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Person writing notes" />
            <motion.div variants={featureContentRightVariants} className="flex flex-col justify-center space-y-5 p-3 lg:h-[370px] w-full lg:w-1/2">
              <p className="w-fit py-2 px-4 font-bold text-gray-800 bg-gray-100 rounded">Notes</p>
              <p className="font-semibold indent-5 text-gray-700">GeNote is a simple and intuitive note-taking website designed for easy organization. Users can effortlessly create, edit, and manage their notes in a clean interface. It offers basic formatting options and allows for quick saving and retrieval of information, making it a convenient tool for capturing thoughts and ideas.</p>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal className="flex flex-col lg:flex-row gap-4 items-center" variants={featureSectionParentVariants} threshold={0.2}>
            <motion.div variants={featureContentRightVariants} className="lg:h-[370px] overflow-hidden w-full md:w-1/2 lg:w-auto max-w-lg flex items-center justify-center rounded-lg shadow-md bg-slate-100 p-4">
              <motion.img whileHover={{ scale: 1.05 }} className="object-contain h-full max-h-[300px] lg:max-h-full" src={GeminiImg} alt="Gemini AI logo" />
            </motion.div>
            <motion.div variants={featureContentLeftVariants} className="lg:order-first flex flex-col justify-center space-y-5 p-3 lg:h-[370px] w-full lg:w-1/2">
              <p className="w-fit py-2 px-4 font-bold text-gray-800 bg-gray-100 rounded">Gemini</p>
              <p className="font-semibold indent-5 text-gray-700">GeNote is a note-taking website enhanced with Gemini AI. This integration allows users to leverage AI for tasks like summarizing notes, generating ideas, and improving writing directly within their documents, boosting productivity and creativity.</p>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal className="flex flex-col lg:flex-row gap-4 items-center" variants={featureSectionParentVariants} threshold={0.2}>
            <motion.img variants={featureContentLeftVariants} whileHover={{ scale: 1.03 }} className="w-full md:w-1/2 lg:w-auto max-w-lg rounded-lg shadow-md object-cover lg:h-[380px]" src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Abstract design elements" />
            <motion.div variants={featureContentRightVariants} className="flex flex-col justify-center space-y-5 p-3 lg:h-[380px] w-full lg:w-1/2">
              <p className="w-fit py-2 px-4 font-bold text-gray-800 bg-gray-100 rounded">React.js</p>
              <p className="font-semibold indent-5 text-gray-700">GeNote's user interface is built using ReactJS, a powerful JavaScript library for creating dynamic and interactive web applications. React's component-based architecture enables a modular and efficient development process, resulting in a smooth, responsive, and engaging user experience for note-taking and interacting with features like Gemini AI integration.</p>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal className="flex flex-col lg:flex-row gap-4 items-center" variants={featureSectionParentVariants} threshold={0.2}>
            <motion.img variants={featureContentRightVariants} whileHover={{ scale: 1.03 }} className="w-full md:w-1/2 lg:w-auto max-w-lg rounded-lg shadow-md object-cover lg:h-[370px]" src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Team working on laptops" />
            <motion.div variants={featureContentLeftVariants} className="lg:order-first flex flex-col justify-center space-y-5 p-3 lg:h-[370px] w-full lg:w-1/2">
              <p className="w-fit py-2 px-4 font-bold text-gray-800 bg-gray-100 rounded">Laravel</p>
              <p className="font-semibold indent-5 text-gray-700">GeNote's robust backend is powered by Laravel, a modern PHP framework known for its elegant syntax and extensive features. Laravel provides a secure and scalable foundation for managing user data, handling note storage and retrieval, and integrating with services like Gemini AI. Its developer-friendly tools streamline the creation of a reliable and efficient application, ensuring a seamless experience for GeNote users.</p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </motion.div>
  )
}

export default Home