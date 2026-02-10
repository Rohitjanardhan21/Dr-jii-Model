import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button, Input, Select, Textarea } from "../Form";
import { BiChevronDown } from "react-icons/bi";
import { sortsDatas } from "../Datas";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";

function AddEditMedicineModal({ closeModal, isOpen, datas }) {
  const [measures, setMeasures] = useState(sortsDatas.measure[0]);

  useEffect(() => {
    if (datas?.name) {
      setMeasures({
        id: datas.measure,
        name: datas.measure,
      });
    }
  }, [datas]);

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={datas?.name ? "Edit Medicine" : "New Medicine"}
      width={"max-w-3xl"}
    >
      <div className='flex-colo gap-6'>
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input
            label='Medicine Name'
            color={true}
            placeholder={datas?.name && datas.name}
          />
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Measure</p>
            <Select
              selectedPerson={measures}
              setSelectedPerson={setMeasures}
              datas={sortsDatas.measure}
            >
              <div className='flex-btn w-full rounded-lg border border-border p-4 text-sm font-light text-textGray focus:border focus:border-subMain'>
                {measures?.name} <BiChevronDown className='text-xl' />
              </div>
            </Select>
          </div>
        </div>

        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input
            label='Price (Tsh)'
            type='number'
            color={true}
            placeholder={datas?.price ? datas.price : 0}
          />
          <Input
            label='Instock'
            type='number'
            color={true}
            placeholder={datas?.stock ? datas.stock : 0}
          />
        </div>

        {/* des */}
        <Textarea
          label='Description'
          placeholder='Write description here...'
          color={true}
          rows={5}
        />
        {/* buttones */}
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <button
            onClick={closeModal}
            className='rounded-lg bg-red-600 bg-opacity-5 p-4 text-sm font-light text-red-600'
          >
            {datas?.name ? "Discard" : "Cancel"}
          </button>
          <Button
            label='Save'
            Icon={HiOutlineCheckCircle}
            onClick={() => {
              toast.error("This feature is not available yet");
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddEditMedicineModal;
