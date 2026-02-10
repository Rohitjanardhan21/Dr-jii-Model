import React, { useState } from "react";
import Modal from "./Modal";
import { BiPlus } from "react-icons/bi";
import PatientMedicineServiceModal from "./PatientMedicineServiceModal";
import { Button, Input } from "../Form";

function AddItemModal({ setItemOpen, isOpen,servicesData,setSelectedService,selectedService }) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState({serviceName:"",price:""});
  const [quantity, setQuantity] = useState(1);

  const summery = [
    {
      title: "Service Name",
      value: service?.serviceName,
      color: false,
    },
    {
      title: "Item Price",
      value: `$ ${service?.price}`,
      color: false,
    },
    {
      title: "Quantity",
      value: quantity,
      color: false,
    },
    {
      title: "Total",
      value: `$ ${(service?.price * quantity).toFixed(2)}`,
      color: true,
    },
  ];

  const handleCloseModel = () => {
    setItemOpen(false);
    setSelectedService([...selectedService, { ...service, quantity }]);
    setService({serviceName:"",price:""});
    setQuantity(1);
  }


  return (
    <>
      {open && (
        <PatientMedicineServiceModal
          setOpen={setOpen}
          patientData={servicesData}
          isOpen={open}
          patient={false}
          setPatient={setService}
        />
      )}
      <Modal
        closeModal={handleCloseModel}
        isOpen={isOpen}
        title='Add Item'
        width={"max-w-xl"}
      >
        <div className='flex-colo gap-6'>
          {/* title */}
          <div className='flex w-full flex-col gap-4'>
            <p className='text-sm text-black'>Service</p>
            <button
              onClick={() => setOpen(!open)}
              className='flex-rows w-full gap-2 rounded-lg border border-dashed border-subMain py-4 text-sm text-subMain'
            >
              <BiPlus /> Add Item
            </button>
          </div>
          {/* quantity */}
          <Input label='Quantity' value={quantity} onChange={(e)=>{setQuantity(e.target.value)}} color={true} type={"number"} />
          {/* summery */}
          <div className='flex w-full flex-col gap-4'>
            <p className='text-sm text-black'>Summary</p>
            <div className='flex flex-col gap-4'>
              {summery.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-row items-center justify-between'
                >
                  <p className='text-xs text-textGray'>{item.title}</p>
                  <p
                    className={
                      item.color
                        ? "rounded-full bg-subMain bg-opacity-10 px-4 py-1 text-xs font-semibold text-subMain"
                        : "text-sm font-medium text-textGray"
                    }
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* button */}
          <Button onClick={handleCloseModel} label='Add' Icon={BiPlus} />
        </div>
      </Modal>
    </>
  );
}

export default AddItemModal;
