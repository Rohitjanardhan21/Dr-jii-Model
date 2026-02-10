import React, { useState } from "react";
import Modal from "./Modal";
import { Button, Input, Select } from "../Form";
import { BiChevronDown } from "react-icons/bi";
import { sortsDatas } from "../Datas";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";
import Access from "../Access";
import Uploader from "../Uploader";

function AddDoctorModal({ closeModal, isOpen, doctor, datas }) {
  const [instraction, setInstraction] = useState(sortsDatas.title[0]);
  const [access, setAccess] = useState({});

  const onSubmit = () => {
    toast.error("This feature is not available yet");
  };

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={doctor ? "Add Doctor" : datas?.id ? "Edit Stuff" : "Add Stuff"}
      width={"max-w-3xl"}
    >
      <div className='col-span-6 mb-6 flex flex-col gap-3'>
        <p className='text-sm'>Profile Image</p>
        <Uploader />
      </div>

      <div className='flex-colo gap-6'>
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input label='Full Name' color={true} placeholder='John Doe' />

          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Title</p>
            <Select
              selectedPerson={instraction}
              setSelectedPerson={setInstraction}
              datas={sortsDatas.title}
            >
              <div className='flex-btn w-full rounded-lg border border-border p-4 text-sm font-light text-textGray focus:border focus:border-subMain'>
                {instraction.name} <BiChevronDown className='text-xl' />
              </div>
            </Select>
          </div>
        </div>

        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input label='Email' color={true} />
          <Input label='Phone Number' color={true} />
        </div>

        {/* password */}
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input label='Password' color={true} />
          <Input label='HP id' color={true} />
        </div>

        {/* table access */}
        <div className='w-full'>
          <Access setAccess={setAccess} />
        </div>

        {/* buttones */}
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <button
            onClick={closeModal}
            className='rounded-lg bg-red-600 bg-opacity-5 p-4 text-sm font-light text-red-600'
          >
            Cancel
          </button>
          <Button label='Save' Icon={HiOutlineCheckCircle} onClick={onSubmit} />
        </div>
      </div>
    </Modal>
  );
}

export default AddDoctorModal;
