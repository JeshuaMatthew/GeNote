const Footer = () => {
  return (
    <div className="flex flex-col space-y-15 mt-4 p-3 bg-[#3a1d1d]">
        <p className="text-xl font-bold font-kalnia text-white mt-5">GeNote</p>
        <div className='flex flex-col md:flex-row'>
          <div className='flex flex-col  justify-between md:w-[500px] md:flex-row md:space-x-10 space-y-5 text-gray-300 text-sm order-first md:order-last'>
            <div className='flex flex-col space-y-6'>
              <p className="text-lg font-kalnia">Our university</p>
              <a className="hover:text-yellow-400" href='https://unai.edu/'>UNAI</a>
              <a className="hover:text-yellow-400" href='https://fti.unai.edu/'>FTI</a>
            </div>
            <div className="flex flex-col space-y-6">
              <h5 className="text-lg font-kalnia">Our members</h5>
              <div className="flex space-x-3.5">
                <div className='flex flex-col space-y-5'>
                  <a className="hover:text-sky-400" href='https://www.instagram.com/bryan_hurss/'>@bryan_hurss</a>
                  <a className="hover:text-sky-400" href='https://www.instagram.com/alviindamanik_/'>@alviindamanik_</a>
                </div>
                <div className='flex flex-col space-y-5'>
                  <a className="hover:text-sky-400" href='https://www.instagram.com/nuelrmb/'>@nuelrmb</a>
                  <a className="hover:text-sky-400"  href='https://www.instagram.com/bioscum/'>@bioscum</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-between md:flex-row flex-col space-y-5'>
          <p className='font-semibold text-gray-300 text-xs leading-5 overflow-ellipsis overflow-hidden '>This build does not represent the final application, the current features and pages may change in the future iteration of this project. This build is only meant as a demonstration for judges, and viewers.</p>
          <p className='font-semibold text-gray-300 text-xs'>©GeNote 2025.</p>
        </div>
    </div>
  )
}

export default Footer