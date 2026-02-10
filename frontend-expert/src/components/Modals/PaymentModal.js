import React, { useState } from "react";
import Modal from "./Modal";
import { Button, Select } from "../Form";
import { sortsDatas } from "../Datas";
import { BiChevronLeft, BiChevronRight, BiPlus, BiTime, BiChevronDown } from "react-icons/bi";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { toast } from "react-hot-toast";

function PaymentModal({ closeModal, isOpen, slug }) {
  const [currency, setCurrency] = useState(sortsDatas.status[0]);
  const [payment, setPayment] = useState(sortsDatas.method[0]);
  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title='Generate Payment'
      width={"max-w-xl"}
    >
      <div className='flex-colo gap-6 pb-8'>
        <div className='w-full'>
          <p className='mb-3 text-sm'>Status</p>
          <Select
            selectedPerson={currency}
            setSelectedPerson={setCurrency}
            datas={sortsDatas?.status}
          >
            <div className='flex h-14 w-full items-center justify-between rounded-md border border-border px-4 text-xs text-main'>
              <p>{currency?.name}</p>
              <BiChevronDown className='text-xl' />
            </div>
          </Select>
        </div>
        {/* card */}
        <div className='w-full'>
          <p className='mb-3 text-sm'>Payment Method</p>
          <Select
            selectedPerson={payment}
            setSelectedPerson={setPayment}
            datas={sortsDatas?.method}
          >
            <div className='flex h-14 w-full items-center justify-between rounded-md border border-border px-4 text-xs text-main'>
              <p>{payment?.name}</p>
              <BiChevronDown className='text-xl' />
            </div>
          </Select>
        </div>
        {/* button */}
        <Button
          label='Generate'
          Icon={CgSpinnerTwoAlt}
          onClick={() => {
            toast.error("This feature is not available yet");
          }}
        />
      </div>
    </Modal>
  );
}

export default PaymentModal;
