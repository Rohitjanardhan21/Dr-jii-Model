import React from "react";


const MainHeader = () => {
  return (
    <>
      <div className="w-full h-px bg-gray-300" />

      <nav className='mx-auto flex w-12/13 flex-row justify-between p-2 sm:p-3 shadow'>
        <div className='flex flex-row items-center'>
          <h4 className='text-xl sm:text-[26px] font-semibold text-black leading-none'>
            avijo
            <span className='ml-0 sm:ml-1 text-xs sm:text-[14px] md:text-[16px] font-[500] italic text-[#FD7979]'>
              Expert
            </span>
          </h4>
        </div>

        <div className='flex flex-row gap-2 sm:gap-4'>
          {/* <button className='no-underline'>
            <Link to={"/"}>For Provider</Link>
          </button> */}
          <a
            href="https://www.avijo.in/safety"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 px-1.5 sm:px-2 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Safety of your data</span>
            <span className="sm:hidden">Safety</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0 0L10 21l-7-7 11-11z" />
            </svg>
          </a>

          <button className='rounded-md border-2 border-black p-1.5 sm:p-2 px-2 sm:px-4'>
            <a
            href="https://www.avijo.in/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="p-0.5 sm:p-1 px-1 sm:px-2 inline-flex items-center gap-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Contact Us</span>
            <span className="sm:hidden">Contact</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0 0L10 21l-7-7 11-11z" />
            </svg>
          </a>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MainHeader;
