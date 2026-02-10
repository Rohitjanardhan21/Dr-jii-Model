// import React from "react";
// import { BiPlus } from "react-icons/bi";
// import { useDoctorAuthStore } from "../store/useDoctorAuthStore";

// function SenderReceverComp({ item, functions, button }) {

//   const {doctor} = useDoctorAuthStore();

//   return (
//     <div className='mt-4 grid items-stretch gap-6 sm:grid-cols-2'>
//       <div className='rounded-xl border border-border py-3 px-4 h-full'>
//         <div className='flex-btn gap-4'>
//           <h1 className='text-md font-semibold'>From:</h1>
//         </div>
//         <div className='mt-4 flex flex-col gap-2'>
//           <h6 className='text-xs font-medium'>Dr. {doctor?.fullName}</h6>
//           <p className='text-xs text-textGray'>{doctor?.emailId}</p>
//           <p className='text-xs text-textGray'>{doctor?.mobileNumber}</p>
//         </div>
//       </div>
//       <div className='rounded-xl border border-border py-3 px-4 h-full'>
//         <div className='flex-btn gap-4'>
//           <h1 className='text-md font-semibold'>To:</h1>
//           {button && (
//             <button
//               onClick={() => functions.openModal()}
//               className='flex-rows gap-2 rounded-lg border border-border bg-dry px-4 py-2 text-sm text-subMain'
//             >
//               <BiPlus /> Add
//             </button>
//           )}
//         </div>
//         <div className='mt-4 flex flex-col gap-2'>
//           <h6 className='text-xs font-medium'>{item?.fullName}</h6>
//           <p className='text-xs text-textGray'>{item?.email}</p>
//           <p className='text-xs text-textGray'>{item?.mobileNumber}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SenderReceverComp;
import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "./SenderReceverComp.css";

function SenderReceverComp({ patientData, setSelectedPatient, lockedPatient }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const filteredPatients = (patientData || []).filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (user) => {
    setSelected(user);
    setSelectedPatient(user);
    setDropdownVisible(false);
    setSearchQuery("");
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setDropdownVisible(true); // show dropdown again when typing
  };

  // When a locked patient is provided, set and freeze selection
  useEffect(() => {
    if (lockedPatient) {
      setSelected(lockedPatient);
      if (typeof setSelectedPatient === "function") {
        setSelectedPatient(lockedPatient);
      }
    }
  }, [lockedPatient]);

  return (
    <div className='w-full rounded-xl px-1'>
      <div className='flex w-full flex-col gap-1'>
        <label
          className='text-lg mb-2 font-semibold text-black'
        >
          Patient Name
        </label>
        {lockedPatient ? (
          <div className='flex items-center h-12 rounded-lg border border-gray-300 px-3 py-1 bg-gray-50'>
            <span className='text-sm font-medium text-black'>
              {lockedPatient.fullName}
            </span>
          </div>
        ) : (
          <div className='flex items-center h-12 rounded-lg border border-gray-300 px-3 py-1'>
            <FaMagnifyingGlass
              className='text-gray-400 ml-2'
              style={{ height: "14px", width: "14px" }}
            />
            <input
              type='text'
              placeholder='Search Patient'
              className='ml-2 w-full border-none text-sm outline-none placeholder:text-sm placeholder:text-gray-400'
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>
        )}

        {searchQuery && dropdownVisible && (
          <div className='custom-scrollbar mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 shadow'>
            {filteredPatients.length === 0 ? (
              <p className='p-2 text-xs text-gray-500'>No results found</p>
            ) : (
              filteredPatients.map((user) => (
                <div
                  key={user.id}
                  className='cursor-pointer p-2 ml-1 text-sm hover:bg-gray-100'
                  onClick={() => handleSelect(user)}
                >
                  {user.fullName}
                </div>
              ))
            )}
          </div>
        )}

        {selected && (
          <div className='mt-3 flex flex-col gap-1'>
            <h6 className='text-sm font-medium text-black'>{selected.fullName}</h6>
            <p className='text-xs text-gray-500'>{selected.email}</p>
            <p className='text-xs text-gray-500'>{selected.mobileNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SenderReceverComp;
