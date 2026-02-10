import React, { useEffect, useState } from "react";
import "../../src/styles/index.css";
import GenerateId from "./GenerateId";
import DoctorLogin from "../components/DoctorLogin/DoctorLogin";
import DoctorSignUp from "../components/DoctorLogin/DoctorSignUp";
import MainHeader from "../Layout/MainHeader";

function AbdmLogin() {
  const [tabs, setTabs] = useState(1);

  useEffect(() => {
    localStorage.setItem("myPath", window.location.pathname);
  }, []);

  return (
    <>
      <MainHeader />
      <div className='mx-auto w-11/12 max-w-7xl bg-gray-100 mt-3 pb-4'>
        <div className='flex justify-center gap-2 sm:gap-4 md:gap-[1rem] border-b border-gray-200 text-lg sm:text-xl md:text-2xl'>
          {["Login", "Generate ID"].map((item, index) => (
            <span
              key={index}
              onClick={() => setTabs(index)}
              className={`cursor-pointer px-4 sm:px-8 md:px-[5rem] py-2 sm:py-3 md:py-[1rem] text-center transition-colors ${tabs === index ? "border-b-2 sm:border-b-3 md:border-b-4 border-[#0097DB] text-[#0097DB] font-semibold" : "text-gray-500 hover:text-gray-700"}`}
            >
              {item}
            </span>
          ))}
        </div>
        {tabs === 0 ? <DoctorLogin /> : <DoctorSignUp />}
      </div>
    </>
  );
}
export default AbdmLogin;
