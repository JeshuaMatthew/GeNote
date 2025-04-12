

const Home = () => {

  return (
    <div className="flex flex-col space-y-20">

      <div className="grid grid-cols-3 grid-rows-3 w-full text-center md:bg-transparent bg-[#b16a6a]">
        <div className="col-start-1 col-end-4 row-start-1 -z-30 row-end-4 blur-xs brightness-50 hidden md:block">
            <img className="w-full" src="https://images.unsplash.com/photo-1532620651297-482fe21279f2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="hero-bg" />
        </div>
        <div className="col-start-1 col-end-4 row-start-2 row-end-3 flex flex-col space-y-8 items-center text-white">
          <p className="font-semibold lg:text-6xl md:text-3xl text-5xl font-kalnia">Welcome</p>
          <p className="font-semibold text-2xl ">Redefine your <span className="font-kalnia underline">note-taking</span> journey today</p>
          <a href="/register" className="font-semibold text-xl  px-10 py-3 rounded-lg w-fit bg-white hover:text-white hover:bg-[#bb4646] text-[#bb4646]">Join now!</a>
          
        </div>

      </div>
      <div className="bg-white">
        <div className="flex flex-col space-y-15 p-3 mx-auto max-w-[1200px] mb-36">
          <p className=" font-semibold md:text-4xl text-xl text-center my-72 text-[#b16a6a]">Meet <span className="font-kalnia">GeNote</span>!</p>
          <div className=" flex flex-col lg:flex-row gap-4 items-center">
            <img className=" w-lg" src="https://images.unsplash.com/photo-1527345931282-806d3b11967f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <div className="flex flex-col justify-center space-y-5 p-3 lg:h-[370px]">
              <p className="w-fit py-2 px-4 font-bold text-gray-800">Notes</p>
              <p className="font-semibold  indent-5">GeNote is a simple and intuitive note-taking website designed for easy organization. Users can effortlessly create, edit, and manage their notes in a clean interface. It offers basic formatting options and allows for quick saving and retrieval of information, making it a convenient tool for capturing thoughts and ideas.</p>
            </div>
          </div>
          <div className=" flex flex-col lg:flex-row gap-4 items-center">
            <div className="lg:h-[370px] overflow-clip w-full">
              <img className="bg-slate-900" src="..\src\assets\Gemini.svg" alt="" />
            </div>
            <div className="lg:order-first flex flex-col justify-center space-y-5 p-3 lg:h-[370px]">
              <p className="w-fit py-2 px-4 font-bold text-gray-800">Gemini</p>
              <p className="font-semibold indent-5">GeNote is a note-taking website enhanced with Gemini AI. This integration allows users to leverage AI for tasks like summarizing notes, generating ideas, and improving writing directly within their documents, boosting productivity and creativity.</p>
            </div>
          </div>
          <div className=" flex flex-col lg:flex-row gap-4 items-center">
            <img className="w-lg" src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <div className="flex flex-col justify-center space-y-5 p-3 lg:h-[380px]">
              <p className="w-fit py-2 px-4 font-bold text-gray-800">React.js</p>
              <p className="font-semibold indent-5">GeNote's user interface is built using ReactJS, a powerful JavaScript library for creating dynamic and interactive web applications. React's component-based architecture enables a modular and efficient development process, resulting in a smooth, responsive, and engaging user experience for note-taking and interacting with features like Gemini AI integration.</p>
            </div>
          </div>
          <div className=" flex flex-col lg:flex-row gap-4 items-center">
            <img className="w-lg" src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <div className="lg:order-first flex flex-col justify-center space-y-5 p-3 lg:h-[370px]">
              <p className="w-fit py-2 px-4 font-bold text-gray-800">Laravel</p>
              <p className="font-semibold indent-5">GeNote's robust backend is powered by Laravel 12, a modern PHP framework known for its elegant syntax and extensive features. Laravel 12 provides a secure and scalable foundation for managing user data, handling note storage and retrieval, and integrating with services like Gemini AI. Its developer-friendly tools streamline the creation of a reliable and efficient application, ensuring a seamless experience for GeNote users.</p>
            </div>
          </div>
        </div>
      </div>

        

    </div>
  )
}

export default Home