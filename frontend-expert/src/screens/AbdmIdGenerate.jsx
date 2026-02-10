import React, { useEffect, useState } from "react";
import "../../src/styles/index.css";
import GenerateId from "./GenerateId";
// import Login from "./Login";
import DoctorIdGenerate from "../components/DoctorLogin/DocterIdGenrate";
import DoctorLogin from "../components/DoctorLogin/DoctorLogin";
import MainHeader from "../Layout/MainHeader";


function AbdmIdGenerate() {
  const [tabs, setTabs] = useState(1);
  
  useEffect(() => {
    localStorage.setItem("myPath", window.location.pathname);
  }, []);

  return (
    <>
      <MainHeader />
      <div className='mx-auto w-11/12 bg-gray-100 mt-3'>
        <div className='flex justify-center gap-[1rem] border-b border-gray-200 text-2xl'>
          {[ "Login","Generate ID"].map((item, index) => (
            <span
              key={index}
              onClick={() => setTabs(index)}
              className={`cursor-pointer px-[5rem] py-[1rem] text-center ${tabs === index ? "border-b-4 m border-[#0097DB] text-[#0097DB]" : "text-gray-500"} px-4 py-2`}
            >
              {item}
            </span>
          ))}
        </div>
        {tabs === 0 ?  <DoctorLogin /> : <DoctorIdGenerate /> }
      </div>
    </>
  );
}
export default AbdmIdGenerate;