import React from "react";

export default function PrescriptionHeader(props) {
  return (
    <div className='flex w-full flex-col items-center bg-[white] p-1 pr-4 md:flex-row md:justify-between'>
      <div className='flex flex-col items-center md:flex-row'>
        <img
          src={require("../Assets/images/blackLeft.png")}
          className='ml-4 h-[26px] w-[26px]'
        />
        <img
          src={require("../Assets/images/profile.png")}
          className='ml-6 h-[30px] w-[30px] rounded-[58px]'
        />
        <div className='ml-4'>
          <div className='flex flex-col items-center md:flex-row'>
            <h4 className='text-[24px] text-[Gilroy-SemiBold] text-[black]'>
              Imtiyaz
            </h4>
            <span className='ml-2 text-[14px] text-[Gilroy-SemiBold]'>
              31y.9mM
            </span>
          </div>
          <div className='flex flex-col items-center justify-center md:flex-row'>
            <h4 className='text-[14px] text-[Gilroy-SemiBold]'>
              eka101 . 6364766400
            </h4>
            <img
              src={require("../Assets/images/blackDown.png")}
              className='ml-2 h-[18px] w-[18px]'
            />
          </div>
        </div>
        <div className='ml-6 flex flex-row items-center'>
          {props.show && (
            <img
              src={require("../Assets/images/edit.png")}
              className='ml-2 h-[40px] w-[40px]'
            />
          )}
          <img
            src={require("../Assets/images/video.png")}
            className='ml-2 h-[40px] w-[40px]'
          />
          {props.show && (
            <img
              src={require("../Assets/images/link.png")}
              className='ml-2 h-[40px] w-[40px]'
            />
          )}
        </div>
        {props.show && (
          <div className='ml-6 flex flex-row items-center'>
            <img
              src={require("../Assets/images/dots.png")}
              className='ml-4 h-[22px] w-[22px]'
            />
            <span className='ml-2 text-[12px] text-[Gilroy-SemiBold]'>
              Patient Overview
            </span>
          </div>
        )}
        {props.show && (
          <div className='ml-6 flex flex-row items-center'>
            <img
              src={require("../Assets/images/Prescription.png")}
              className='mb-2 h-[14px] w-[14px]'
            />
            <span className='ml-1 border-b-2 border-[black] pb-2 text-[16px] text-[Gilroy-SemiBold]'>
              Prescription Pad
            </span>
          </div>
        )}
        {props.show && (
          <div className='ml-6 mt-2 flex w-[180px] flex-row items-start md:items-center'>
            <img
              src={require("../Assets/images/t.png")}
              className='ml-4 h-[30px] w-[30px]'
            />
            <span className='ml-2 text-[12px] text-[Gilroy-SemiBold]'>
              Templates
            </span>
          </div>
        )}
      </div>
      <div className='ml-6 mt-2 flex w-[180px] flex-row items-start md:items-center'>
        <img
          src={require("../Assets/images/settings.png")}
          className='ml-4 h-[30px] w-[30px]'
        />
        <span className='ml-2 text-[12px] text-[Gilroy-SemiBold]'>
          Confgure your pad
        </span>
      </div>
    </div>
  );
}
