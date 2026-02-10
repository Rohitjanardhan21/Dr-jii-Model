import React, { useDebugValue, useEffect, useState } from "react";
import Modal from "./Modal";
import { BiSearch, BiPlus } from "react-icons/bi";
import { memberData, servicesData, medicineData } from "../Datas";
import { RadioGroup } from "@headlessui/react";
import { Button } from "../Form";

function PatientMedicineServiceModal({
  setOpen,
  setPatient,
  isOpen,
  patient,
  patientData = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");
  // const [selected, setSelected] = useState(null);
  const [selectedId, setSelectedId] = useState("");

 useEffect(() => {
  if (isOpen) {
    setSelectedId(""); // or patientData[0]?._id
    setSearchQuery("");
  }
}, [isOpen]);


  const filteredData = patientData.filter((user) => {
  const query = searchQuery.toLowerCase();

  if (patient) {
    return user.fullName?.toLowerCase().includes(query);
  }

  // Check for both serviceName and medicineName
  return (
    user.serviceName?.toLowerCase().includes(query) ||
    user.medicineName?.toLowerCase().includes(query)
  );
});


  const closeModal = () => {
  const selectedItem = patientData.find((item) => item._id === selectedId);
  if (selectedItem) {
    setPatient({ ...selectedItem }); // This updates the parent
  }
  setOpen(false);
};


  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={patient ? "Patients" : "Medicine & Services"}
      width={"max-w-xl"}
    >
      <div className='flex-colo gap-6'>
        {/* search */}
        <div className='flex w-full items-center gap-4 rounded-lg border border-border p-3'>
          <input type='text' placeholder='Search' className='w-full' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <BiSearch className='text-xl' />
        </div>
        {/* data */}
        <div className='h-[500px] w-full overflow-y-scroll'>
          {filteredData.length === 0 ? (
            <p className="text-sm text-textGray">No results found</p>
          ) : (
            <div className="space-y-2">
          {filteredData.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedId(user._id)}
              className={`${
                selectedId === user._id
                  ? "border-subMain bg-subMain text-white"
                  : "border-border"
              } group rounded-xl border-[1px] p-4 hover:bg-subMain hover:text-white cursor-pointer`}
            >
              <h6 className="text-sm">
                {patient ? user.fullName : user.serviceName}
              </h6>
              {patient && (
                <p
                  className={`${
                    selectedId === user._id ? "text-white" : "text-textGray"
                  } mt-1 text-xs group-hover:text-white`}
                >
                  {user.email}
                </p>
              )}
            </div>
          ))}
        </div>

          )}
        </div>
        {/* button */}

        <Button onClick={closeModal} label='Add' Icon={BiPlus} />
      </div>
    </Modal>
  );
}

export default PatientMedicineServiceModal;
