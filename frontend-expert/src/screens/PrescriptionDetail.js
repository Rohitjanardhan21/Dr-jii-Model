import React from "react";
import PrescriptionHeader from "../components/PrescriptionHeader";
import Layout from "../Layout";
import {
  AiOutlineChrome,
  AiOutlineCloud,
  AiOutlineCloudDownload,
  AiOutlineEdit,
  AiOutlinePaperClip,
  AiOutlineWhatsApp,
  AiTwotonePrinter,
} from "react-icons/ai";
import { BsCapsulePill, BsLink, BsNewspaper, BsSend } from "react-icons/bs";
import { TbFilterEdit } from "react-icons/tb";
import { FaCheckSquare, FaEdit, FaRegCheckSquare } from "react-icons/fa";

export default function PrescriptionDetail() {
  return (
    <Layout>
      <div>
        <PrescriptionHeader show={false} />
        <div className='mb-[3%] mt-[3%] flex flex-col items-center justify-center bg-[white] pb-[3%] pl-[2%] pr-[2%] md:flex-row md:items-start md:justify-between'>
          <FirstSect />
          <SecondSec />
        </div>
        <div className='flex w-full flex-row justify-end'>
          <div className='mb-[5%] flex w-[80%] flex-row items-center justify-between bg-[white] p-4 pl-6 pr-6'>
            <div className='flex flex-row items-center rounded-[5px] border border-[#39D2C0] p-2 pl-4 pr-4'>
              <FaCheckSquare className='text-[#39D2C0]' />
              <span className='ml-2 text-[16px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
                Monetize Rx
              </span>
            </div>
            <div className='flex flex-row items-center rounded-[5px] border border-[#39D2C0] p-2 pl-4 pr-4'>
              {/* <FaCheckSquare className="text-[#39D2C0]"/> */}
              <span className='ml-2 text-[16px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
                Edit Prescription
              </span>
            </div>
            <div className='flex flex-row items-center rounded-[5px] border border-[#39D2C0] p-2 pl-4 pr-4'>
              <BsCapsulePill className='text-[#39D2C0]' />
              <span className='ml-2 text-[16px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
                Order Medicines
              </span>
            </div>
            <div className='flex flex-row items-center rounded-[5px] border border-[#39D2C0] p-2 pl-4 pr-4'>
              <AiTwotonePrinter className='text-[#39D2C0]' />
              <span className='ml-2 text-[16px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
                Print
              </span>
            </div>
            <div className='flex flex-row items-center rounded-[5px] bg-[#39D2C0] p-2 pl-4 pr-4'>
              {/* <FaCheckSquare className="text-[#39D2C0]"/> */}
              <span className='ml-2 text-[16px] text-[Gilroy-SemiBold] text-white'>
                Send Rx & End Visit
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const Option = (props) => {
  return (
    <div className='flex flex-row rounded-full bg-[#39D2C0] p-3 pl-4 pr-4'>
      {props.icon}
      <span className='ml-2 text-[14px] text-[Gilroy-Medium] text-[white]'>
        {props.text}
      </span>
    </div>
  );
};

const FirstSect = () => {
  return (
    <div className='flex-colo mt-[10%] flex h-full w-1/2 items-center justify-center'>
      <div className='flex flex-row items-center'>
        <AiOutlineWhatsApp className='h-[32px] w-[32px]' />
        <span className='ml-4 text-[18px] text-[Gilroy-SemiBold] text-[black]'>
          Prescription Saved Successfully.
        </span>
        <span className='text-[16px] text-[#39D2C0] text-[Gilroy-Medium]'>
          {" "}
          +91 4759573857537
        </span>
        <AiOutlineEdit className='h-[16px] w-[16px] text-[#39D2C0]' />
      </div>
      <div className='mt-[5%] flex w-[85%] flex-row items-center justify-between'>
        <Option
          icon={
            <AiOutlinePaperClip className='h-[20px] w-[20px] text-[white]' />
          }
          text='Send Attachment'
        />
      </div>
      <div className='mt-4 flex w-[85%] flex-row items-center justify-between'>
        <Option
          icon={<AiTwotonePrinter className='h-[20px] w-[20px] text-[white]' />}
          text='Print'
        />
        <Option
          icon={
            <AiOutlineCloudDownload className='h-[20px] w-[20px] text-[white]' />
          }
          text='Download'
        />
        <Option
          icon={<BsSend className='h-[20px] w-[20px] text-[white]' />}
          text='Send Via Own Whatsapp'
        />
      </div>
      <div className='mt-4 flex w-[85%] flex-row items-center justify-start'>
        <Option
          icon={<BsLink className='h-[20px] w-[20px] text-[white]' />}
          text='Send Payment Link'
        />
        <div className='ml-4'>
          <Option
            icon={<BsNewspaper className='h-[20px] w-[20px] text-[white]' />}
            text='Bill Patient'
          />
        </div>
      </div>
      <div className='mt-4 flex w-[85%] flex-row items-center justify-start'>
        <Option
          icon={<AiOutlineChrome className='h-[20px] w-[20px] text-[white]' />}
          text='Send Google Review Link'
        />
        <div className='ml-4'>
          <Option
            icon={<FaEdit className='h-[20px] w-[20px] text-[white]' />}
            text='Request Vitals'
          />
        </div>
      </div>
      <div className='mt-[5%] flex w-[80%] flex-row items-center'>
        <div className='border-b-2 border-[black] pb-2'>
          <span className='text-[16px] text-[#676767] text-[Gilroy-SemiBold]'>
            New Template
          </span>
        </div>
        <div className='ml-4 pb-2'>
          <span className='text-[16px] text-[#676767] text-[Gilroy-SemiBold]'>
            Update existing Template
          </span>
        </div>
      </div>
      <div className='mt-4 flex w-[80%] flex-row items-center justify-between'>
        <input
          className='h-[40px] w-[80%] rounded-[5px] border border-[black] pl-2 text-[16px] text-[Gilroy-SemiBold]'
          placeholder='Template name'
        />
        <div className='flex-colo flex h-[40px] w-[15%] items-center justify-center rounded-[5px] bg-[#39D2C0]'>
          <span className='text-[white]'>Save</span>
        </div>
      </div>
    </div>
  );
};

const SecondSec = () => {
  return (
    <div className='mt-[3%] flex h-full w-1/2 flex-col items-center justify-center'>
      <div className='flex w-[90%] flex-row items-start justify-between border-b-2 border-[black] pb-4'>
        <div className='bg-[#39D2C026] p-6'>
          <span className='text-[35px] text-[#39D2C0] text-[Gilroy-Medium]'>
            avijo
          </span>
        </div>
        <div className='flex flex-col items-start justify-center'>
          <span className='text-[14px] text-[Gilroy-SemiBold] text-[black]'>
            Dr. Bhaskar Chaudhary
          </span>
          <span className='text-[12px] text-[#575757] text-[Gilroy-SemiBold]'>
            MBBS/MD
          </span>
          <span className='text-[12px] text-[#575757] text-[Gilroy-SemiBold]'>
            General Physician
          </span>
        </div>
        <div className='flex flex-col items-start justify-center'>
          <span className='text-[14px] text-[Gilroy-SemiBold] text-[black]'>
            Metropolis Vidhyavihar
          </span>
          <span className='text-[12px] text-[Gilroy-SemiBold] text-[black]'>
            Kohinoor Mall, VidhyaVihar, 69970
          </span>
        </div>
      </div>
      <div className='mt-4 flex w-[90%] flex-row items-center justify-between'>
        <div className='flex flex-row items-center'>
          <span className='text-[18px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
            Imtiyaz
          </span>
          <span className='ml-2 text-[14px] text-[Gilroy-SemiBold] text-[black]'>
            Male, 32 year(s), +5768683454
          </span>
        </div>
        <span className='text-[16px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
          12/04/2024, 12:24 PM{" "}
        </span>
      </div>
      <div className='flex w-[90%] flex-row items-center'>
        <span className='text-[18px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
          UHID
        </span>
        <span className='ml-2 text-[14px] text-[Gilroy-SemiBold] text-[black]'>
          eka101
        </span>
      </div>
      <div className='flex w-[90%] flex-row items-center'>
        <span className='text-[18px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
          Chief Complaints
        </span>
        <span className='ml-2 text-[14px] text-[Gilroy-SemiBold] text-[black]'>
          Chest pain (Since 1 week)
        </span>
      </div>
      <div className='flex w-[90%] flex-row items-center'>
        <span className='text-[18px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
          Diagnosis
        </span>
        <span className='ml-2 text-[14px] text-[Gilroy-SemiBold] text-[black]'>
          Typhoid Fever
        </span>
      </div>
      <div className='mt-[3%] w-[90%]'>
        {/* Heading Row */}
        <div className='mb-2 flex items-center justify-between'>
          <span className='w-[10%] text-[14px] text-[Gilroy-SemiBold] text-[black]'></span>
          <span className='w-[20%] text-[15px] text-[Gilroy-SemiBold] text-[black]'>
            Medications
          </span>
          <span className='w-[20%] text-[15px] text-[Gilroy-SemiBold] text-[black]'>
            Frequency
          </span>
          <span className='w-[20%] text-[15px] text-[Gilroy-SemiBold] text-[black]'>
            Duration
          </span>
          <span className='w-[20%] text-[15px] text-[Gilroy-SemiBold] text-[black]'>
            Remarks
          </span>
        </div>

        {/* Data Row */}
        <div className='flex flex-row items-center justify-between border-b-2 border-[black] pb-4'>
          <div className='flex h-[50px] w-[10%] flex-col items-center justify-center'>
            <span className='text-[14px] text-[Gilroy-Medium] text-[black]'>
              1
            </span>
          </div>
          <div className='flex w-[20%] flex-col items-start justify-center'>
            <span className='text-[10px] text-[Gilroy-SemiBold] text-[black]'>
              Telma H tablet
            </span>
            <span className='text-[10px] text-[#575757] text-[Gilroy-SemiBold]'>
              Telmisaartan (40mg) Hydrochloronic (125mg)
            </span>
          </div>
          <div className='flex w-[20%] flex-col items-start justify-center'>
            <span className='text-[10px] text-[Gilroy-SemiBold] text-[black]'>
              1-1-1-1
            </span>
            <span className='text-[10px] text-[#575757] text-[Gilroy-SemiBold]'>
              After Meal
            </span>
          </div>
          <div className='flex w-[20%] flex-col items-start justify-center'>
            <span className='text-[10px] text-[#575757] text-[Gilroy-SemiBold]'>
              60 Days
            </span>
          </div>
          <div className='flex w-[20%] flex-col items-start justify-center'>
            <span className='text-[10px] text-[#575757] text-[Gilroy-SemiBold]'>
              60 Days
            </span>
          </div>
        </div>
      </div>
      <div className='mt-[5%] w-[90%]'>
        <span className='text-[18px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
          Advice
        </span>
        <ul className='list-disc pl-6'>
          <li className='text-[16px] text-[Gilroy-SemiBold] text-[black]'>
            Lorem ipsum dummy text{" "}
          </li>
          <li className='text-[16px] text-[Gilroy-SemiBold] text-[black]'>
            Lorem ipsum dummy text{" "}
          </li>
          <li className='text-[16px] text-[Gilroy-SemiBold] text-[black]'>
            Lorem ipsum dummy text{" "}
          </li>
        </ul>
      </div>
      <div className='mt-4 flex w-[90%] flex-row items-center'>
        <span className='text-[18px] text-[#39D2C0] text-[Gilroy-SemiBold]'>
          Follow Up
        </span>
        <span className='ml-4 text-[14px] text-[Gilroy-SemiBold] text-[black]'>
          <span className='text-[#9C9C9C]'>Visit on</span> Monday, May 12 2024
        </span>
      </div>
    </div>
  );
};
