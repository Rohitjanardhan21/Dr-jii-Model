import React, { useState } from "react";
import Layout from "../Layout";
import PrescriptionHeader from "../components/PrescriptionHeader";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToggleButton from "../components/ToggleButton";
import Switch from "react-switch";

export default function Prescription() {
  const [switch1, setSwitch] = useState(false);

  const handleChange = () => {
    setSwitch(!switch1);
  };

  return (
    <Layout>
      <div>
        <PrescriptionHeader show={true} />
        <Vitals />
        <Symptoms />
        <Diagnosis />
        <Medications />
        <Notes />
        <div className='mt-[5%] flex items-start justify-between bg-[white] pl-[2%] pr-[2%] md:flex-row'>
          <FollowUp />
          <Advices />
        </div>
        <div className='mb-[5%] mt-[3%] flex flex-row items-center justify-between bg-[white] p-2'>
          <div className='flex flex-row items-center p-[2%]'>
            <img
              src={require("../Assets/images/notes.png")}
              className='h-[30px] w-[30px]'
            />
            <h2 className='ml-4 text-[18px] text-[Gilroy-SemiBold]'>
              Short Procedure
            </h2>
          </div>
          <div className='flex flex-row items-center p-[2%]'>
            <span className='mr-4 text-[16px] text-[Gilroy-SemiBold]'>
              Print on prescription
            </span>
            <Switch
              onColor='#0097DB'
              onChange={handleChange}
              checked={switch1}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

const VitalInput = (props) => {
  return (
    <div>
      <div className='flex flex-row items-center'>
        <img
          src={require(`../Assets/images/${props.image}.png`)}
          className='h-[30px] w-[30px]'
        />
        <span className='ml-4 text-[16px] text-[Gilroy-SemiBold]'>
          {props.Text}
        </span>
      </div>
      <div className='mt-4 flex h-[40px] w-[220px] flex-row items-center rounded-[5px] border p-1'>
        <input
          className='w-[80%]'
          type='text'
          value={props.value}
          onChange={props.onChange}
        />
        <span className='w-[20%] pr-2 text-end text-[12px] text-[#CDCED0]'>
          {props.unit}
        </span>
      </div>
    </div>
  );
};

const Vitals = () => {
  return (
    <div className='mt-[3%] bg-[white]'>
      <div className='flex flex-row items-center p-[2%]'>
        <img
          src={require("../Assets/images/vitals.png")}
          className='h-[30px] w-[30px]'
        />
        <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>vitals</h2>
      </div>
      <div className='flex flex-col items-center justify-between p-[1%] pl-[4%] pr-[4%] md:flex-row'>
        <VitalInput Text='Body Temperature' image='temperature' unit='F' />
        <VitalInput Text='Body height' image='height' unit='Cms' />
        <VitalInput Text='Body mass index' image='mass' unit='kg/m2' />
      </div>
      <div className='flex flex-row items-center justify-center p-[1%] pl-[4%] pr-[4%] md:justify-between'>
        <VitalInput Text='Body weight' image='weight' unit='Kg/s' />
      </div>
    </div>
  );
};

const Symptoms = () => {
  return (
    <div className='mt-[3%] items-center bg-[white] pb-4'>
      <div className='flex flex-row items-center justify-between p-[2%]'>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/symptom.png")}
            className='h-[30px] w-[30px]'
          />
          <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>Symptoms</h2>
        </div>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/file.png")}
            className='h-[20px] w-[20px]'
          />
          <img
            src={require("../Assets/images/Tsx.png")}
            className='ml-4 h-[18px] w-[22px]'
          />
        </div>
      </div>
      <div className='mx-auto flex h-[40px] w-[95%] flex-row items-center justify-center rounded-[5px] border p-1'>
        <img
          src={require("../Assets/images/search.png")}
          className='mr-4 h-[20px] w-[20px] text-[#CDCED0]'
        />
        <input
          className='w-full text-start'
          type='text'
          placeholder='Start typing Symptoms/Chief Complaints'
        />
      </div>
    </div>
  );
};

const Diagnosis = () => {
  return (
    <div className='mt-[3%] items-center bg-[white] pb-4'>
      <div className='flex flex-row items-center justify-between p-[2%]'>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/diagnosis.png")}
            className='h-[30px] w-[30px]'
          />
          <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>Diagnosis</h2>
        </div>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/file.png")}
            className='h-[20px] w-[20px]'
          />
          <img
            src={require("../Assets/images/Tsx.png")}
            className='ml-4 h-[18px] w-[22px]'
          />
        </div>
      </div>
      <div className='mx-auto flex h-[40px] w-[95%] flex-row items-center justify-center rounded-[5px] border p-1'>
        <img
          src={require("../Assets/images/search.png")}
          className='mr-4 h-[20px] w-[20px] text-[#CDCED0]'
        />
        <input
          className='w-full text-start'
          type='text'
          placeholder='Start typing diagnosis'
        />
      </div>
    </div>
  );
};

const Medications = () => {
  return (
    <div className='mt-[3%] items-center bg-[white] pb-4'>
      <div className='flex flex-row items-center justify-between p-[2%]'>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/medication.png")}
            className='h-[30px] w-[30px]'
          />
          <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>
            Medications
          </h2>
        </div>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/Info.png")}
            className='mr-2 h-[20px] w-[20px]'
          />
          <span className='text-[12px] text-[Gilroy-Medium]'>
            Delivery Pincode:
          </span>
          <span className='ml-2 rounded-full border border-[#39D2C0] pl-2 pr-2 text-[12px] text-[#39D2C0] text-[Gilroy-Medium]'>
            Pincode
          </span>
          <div className='ml-2 flex flex-row items-center rounded-full border border-[black] pl-2 pr-2'>
            <img
              src={require("../Assets/images/check.png")}
              className='mr-1 h-[14px] w-[14px]'
            />
            <span className='mr-1 text-[11px] text-[Gilroy-Medium] text-[black]'>
              Check
            </span>
          </div>
          <img
            src={require("../Assets/images/info2.png")}
            className='ml-4 mr-2 h-[20px] w-[20px]'
          />
          <span className='text-[12px] text-[Gilroy-Medium]'>
            Default instructions: Hindi
          </span>
          <img
            src={require("../Assets/images/blackDown.png")}
            className='ml-4 h-[16px] w-[16px]'
          />
        </div>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/blackFile.png")}
            className='h-[20px] w-[20px]'
          />
          <img
            src={require("../Assets/images/blackTdx.png")}
            className='ml-4 h-[18px] w-[22px]'
          />
        </div>
      </div>
      <div className='mx-auto flex h-[40px] w-[95%] flex-row items-center justify-center rounded-[5px] border p-1'>
        <img
          src={require("../Assets/images/search.png")}
          className='mr-4 h-[20px] w-[20px]'
        />
        <input
          className='w-full text-start'
          type='text'
          placeholder='Start typing Medications'
        />
      </div>
    </div>
  );
};

const Notes = () => {
  return (
    <div className='mt-[3%] items-center bg-[white] pb-4'>
      <div className='flex flex-row items-center justify-between p-[2%]'>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/notes.png")}
            className='h-[30px] w-[30px]'
          />
          <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>Notes</h2>
        </div>
        <div className='flex flex-row items-center p-[2%]'>
          <img
            src={require("../Assets/images/blackFile.png")}
            className='h-[20px] w-[20px]'
          />
          <img
            src={require("../Assets/images/blackTdx.png")}
            className='ml-4 h-[18px] w-[22px]'
          />
        </div>
      </div>
      <div className='mx-auto flex h-[40px] w-[95%] flex-row items-center justify-between rounded-[5px] border p-1'>
        <input
          className='w-[40%] pl-4 text-start'
          type='text'
          placeholder='NOTICE FOR PATIENT(TREATMENT/SURGICAL/OTHERS)'
        />
        <span className='text-[16px] text-[#676767] text-[Gilroy-SemiBold]'>
          PRIVATE NOTES
        </span>
        <div className='flex flex-row items-center'>
          <img
            src={require("../Assets/images/info2.png")}
            className='mr-2 h-[20px] w-[20px]'
          />
          <span className='text-[16px] text-[#676767] text-[Gilroy-SemiBold]'>
            These will not be printed
          </span>
        </div>
      </div>
    </div>
  );
};

const FollowUp = () => {
  return (
    <div className='mb-[5%] mt-[3%] w-[48%] items-center justify-center rounded-sm bg-[white] pb-4 shadow-lg'>
      <div className='flex flex-row items-center justify-between p-[2%]'>
        <div className='flex flex-row items-center p-[2%] pl-6'>
          <img
            src={require("../Assets/images/followUp.png")}
            className='h-[30px] w-[30px]'
          />
          <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>Follow up</h2>
        </div>
      </div>
      <div className='mx-auto flex h-[40px] w-[90%] flex-row items-center justify-center p-1'>
        <div className='mx-auto flex h-[40px] w-full flex-row items-center justify-center rounded-[5px] border p-1'>
          <input
            className='w-full pl-2 text-start'
            type='text'
            placeholder='Start typing Medications'
          />
          <img
            src={require("../Assets/images/cross.png")}
            className='mr-2 h-[20px] w-[20px]'
          />
        </div>
        <img
          src={require("../Assets/images/calendar.png")}
          className='ml-4 h-[20px] w-[20px]'
        />
      </div>
      <div className='mx-auto mt-4 flex w-[90%] flex-row items-center justify-between'>
        <span className='text-[16px] text-[#676767] text-[Gilroy-SemiBold]'>
          Sunday, 12 May 24
        </span>
        <div className='flex flex-row items-center'>
          <img
            src={require("../Assets/images/tick.png")}
            className='mr-2 h-[20px] w-[20px]'
          />
          <span className='text-[16px] text-[#676767] text-[Gilroy-SemiBold]'>
            Auto Fill from Rx
          </span>
        </div>
      </div>
      <div className='mx-auto mt-4 flex h-[200px] w-[90%] items-center'>
        <textarea
          className='w-full border pl-2 text-start'
          type='text'
          placeholder='Start typing Medications'
        />
      </div>
    </div>
  );
};

const Advices = () => {
  return (
    <div className='mb-[5%] mt-[3%] w-[48%] items-center justify-center rounded-sm bg-[white] pb-[5%] pt-4 shadow-lg'>
      <div className='flex flex-row items-center justify-between p-[2%]'>
        <div className='flex flex-row items-center p-[2%] pl-6'>
          <img
            src={require("../Assets/images/advice.png")}
            className='h-[30px] w-[30px]'
          />
          <h2 className='ml-4 text-[24px] text-[Gilroy-SemiBold]'>Advices</h2>
        </div>
        <div className='flex w-[45%] flex-row items-center justify-between p-[2%] pl-6'>
          <div className='flex flex-row items-center'>
            <img
              src={require("../Assets/images/tick.png")}
              className='mr-2 h-[18px] w-[18px]'
            />
            <span className='text-[14px] text-[#676767] text-[Gilroy-SemiBold]'>
              Auto Fill from Rx
            </span>
          </div>
          <div className='flex flex-row items-center'>
            <img
              src={require("../Assets/images/eye.png")}
              className='h-[16px] w-[16px]'
            />
            <span className='ml-2 text-[16px] text-[Gilroy-SemiBold]'>hi</span>
          </div>
        </div>
      </div>
      <div className='mb-4 w-full border'>
        <ReactQuill
          className='w-full'
          // value={value}
          // onChange={setValue}
          theme='snow'
        />
      </div>
      <div className='mt-[5%]'>
        <div className='ml-4 flex w-[70%] flex-row items-center'>
          <img
            src={require("../Assets/images/box.png")}
            className='h-[18px] w-[18px]'
          />
          <span className='ml-2 text-[12px] text-[Gilroy-SemiBold]'>
            Advised Home isolation and treatment of now. Warning signs explained
            and revew sos
          </span>
        </div>
        <div className='ml-4 mt-[3%] flex w-[70%] flex-row items-center'>
          <img
            src={require("../Assets/images/box.png")}
            className='h-[18px] w-[18px]'
          />
          <span className='ml-2 text-[12px] text-[Gilroy-SemiBold]'>
            Steaming gargling
          </span>
        </div>
        <div className='ml-4 mt-[3%] flex w-[70%] flex-row items-center'>
          <img
            src={require("../Assets/images/box.png")}
            className='h-[18px] w-[18px]'
          />
          <span className='ml-2 text-[12px] text-[Gilroy-SemiBold]'>
            Dr. whatsapp number 72587585996
          </span>
        </div>
      </div>
    </div>
  );
};
