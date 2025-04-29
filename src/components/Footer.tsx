import React from 'react';

const Footer = () => {
  const bgColor = '#3a1d1d';
  const primaryTextColor = 'text-white';
  const secondaryTextColor = 'text-gray-300';
  const linkHoverColorUni = 'hover:text-yellow-400';
  const linkHoverColorMembers = 'hover:text-sky-400';
  const headingFont = 'font-kalnia';

  return (
    <footer className={`flex flex-col text-sm ${primaryTextColor} bg-[${bgColor}] p-6 md:p-8`}>
      <div className="container mx-auto">
        <h3 className={`text-2xl font-bold ${headingFont} mb-6`}>GeNote</h3>

        <div className='flex flex-col md:flex-row md:justify-between gap-8 mb-8'>
          <div className={`flex flex-col sm:flex-row sm:justify-start gap-8 md:gap-16 ${secondaryTextColor} md:order-last`}>
            <div className='flex flex-col space-y-3'>
              <h5 className={`text-lg ${headingFont} mb-1 ${primaryTextColor}`}>Our University</h5>
              <a href='https://unai.edu/' target="_blank" rel="noopener noreferrer" className={`${linkHoverColorUni} transition-colors duration-200`}>UNAI</a>
              <a href='https://fti.unai.edu/' target="_blank" rel="noopener noreferrer" className={`${linkHoverColorUni} transition-colors duration-200`}>FTI UNAI</a>
            </div>

            <div className="flex flex-col space-y-3">
              <h5 className={`text-lg ${headingFont} mb-1 ${primaryTextColor}`}>Our Members</h5>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <a href='https://www.instagram.com/bryan_hurss/' target="_blank" rel="noopener noreferrer" className={`${linkHoverColorMembers} transition-colors duration-200`}>@bryan_hurss</a>
                <a href='https://www.instagram.com/nuelrmb/' target="_blank" rel="noopener noreferrer" className={`${linkHoverColorMembers} transition-colors duration-200`}>@nuelrmb</a>
                <a href='https://www.instagram.com/alviindamanik_/' target="_blank" rel="noopener noreferrer" className={`${linkHoverColorMembers} transition-colors duration-200`}>@alviindamanik_</a>
                <a href='https://www.instagram.com/bioscum/' target="_blank" rel="noopener noreferrer" className={`${linkHoverColorMembers} transition-colors duration-200`}>@bioscum</a>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-gray-700 pt-6 flex flex-col md:flex-row md:justify-between items-center gap-4'>
          <p className={`font-normal ${secondaryTextColor} text-xs leading-relaxed max-w-xl text-center md:text-left`}>
            This build does not represent the final application; features and pages may change. This version is intended for demonstration purposes only.
          </p>
          <p className={`font-semibold ${secondaryTextColor} text-xs flex-shrink-0`}>
            © GeNote 2024
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;