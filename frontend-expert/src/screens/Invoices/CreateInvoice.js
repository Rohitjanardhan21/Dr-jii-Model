// import React, { useEffect, useState } from "react";
// import Layout from "../../Layout";
// import {
//   Button,
//   FromToDate,
//   Input,
//   Select,
//   Textarea,
// } from "../../components/Form";
// import { BiChevronDown, BiPlus } from "react-icons/bi";
// import PatientMedicineServiceModal from "../../components/Modals/PatientMedicineServiceModal";
// import AddItemModal from "../../components/Modals/AddItemInvoiceModal";
// import { invoicesData, sortsDatas } from "../../components/Datas";
// import { toast } from "react-hot-toast";
// import { BsSend } from "react-icons/bs";
// import { IoArrowBackOutline } from "react-icons/io5";
// import { Link, useNavigate } from "react-router-dom";
// import { InvoiceProductsTable } from "../../components/Tables";
// import SenderReceverComp from "../../components/SenderReceverComp";

// function CreateInvoice() {
//   const [dateRange, setDateRange] = useState([
//     new Date(),
//     new Date(new Date().setDate(new Date().getDate() + 7)),
//   ]);
//   const [startDate, endDate] = dateRange;
//   const [isOpen, setIsOpen] = useState(false);
//   const [itemOpen, setItemOpen] = useState(false);
//   const [currency, setCurrency] = useState(sortsDatas.currency[0]?.name);
//   const [uniquePatients, setUniquePatients] = React.useState([]);
//   const [patient, setPatient] = useState({ fullName: "", id: "" });
//   const [servicesData, setServicesData] = useState([]);
//   const [selectedService, setSelectedService] = useState([]);
//   const [discount, setDiscount] = useState(0);
//   const [tax, setTax] = useState(0);
//   const [notes, setNotes] = useState("");
//   const subTotal = selectedService.reduce((acc, item) => {
//     return acc + (item.price * item.quantity || 1);
//   }, 0);

//   const navigate = useNavigate();

//   const fetchDataForService = async () => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services`, {
//         credentials: "include",
//       });
//       const json = await response.json();
//       setServicesData(json);
//       console.log("json:", json);
//     } catch (e) {
//       console.log("error fetching...", e);
//     }
//   };

//   useEffect(() => {
//     fetchDataForService();
//   }, []);

//   const taxValue = (subTotal * tax) / 100;

//   const amount = subTotal + Number(taxValue) - discount;

//   const sendRequest = async () => {
//     const services = selectedService.map((item) => ({
//       serviceId: item._id,
//       quantity: item.quantity || 1,
//     }));

//     const payload = {
//       patientId: patient._id,
//       services,
//       currency,
//       discount: Number(discount),
//       tax: Number(tax),
//       notes,
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(),
//       amount: Number(amount),
//     };

//     try {
//       const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payment/create`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Success:", data);
//         toast.success("Invoice created successfully!");
//         navigate("/payments");
//       } else {
//         console.error(`Error ${response.status}: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Network error:", error);
//     }
//   };

//   const onChangeDates = (update) => {
//     setDateRange(update);
//   };

//   const fetchData = async () => {
//     try {
//       const getProfileId = await fetch(
//         `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/unique/patients`,
//         { credentials: "include" }
//       );
//       const json = await getProfileId.json();
//       setUniquePatients(json?.patients);
//     } catch (e) {
//       console.log("Error fetching data:", e);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <Layout>
//       {isOpen && (
//         <PatientMedicineServiceModal
//           setOpen={setIsOpen}
//           isOpen={isOpen}
//           patient={true}
//           patientData={uniquePatients}
//           setPatient={setPatient}
//         />
//       )}
//       {itemOpen && (
//         <AddItemModal
//           setItemOpen={setItemOpen}
//           isOpen={itemOpen}
//           servicesData={servicesData}
//           setSelectedService={setSelectedService}
//           selectedService={selectedService}
//         />
//       )}
//       <div className='flex items-center gap-4'>
//         <Link
//           to='/payments'
//           className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
//         >
//           <IoArrowBackOutline />
//         </Link>
//         <h1 className='text-xl font-semibold'>Create Invoice</h1>
//       </div>
//       <div
//         data-aos='fade-up'
//         data-aos-duration='1000'
//         data-aos-delay='100'
//         data-aos-offset='200'
//         className='my-8 rounded-xl border-[1px] border-border bg-white p-5'
//       >
//         {/* header */}
//         <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-2 lg:grid-cols-4'>
//           <div className='lg:col-span-3'>
//             <img
//               src='/images/logo.png'
//               alt='logo'
//               className='w-32 object-contain'
//             />
//           </div>

//           <div className='flex flex-col gap-4'>
//             <FromToDate
//               startDate={startDate}
//               endDate={endDate}
//               label='Dates'
//               onChange={onChangeDates}
//             />
//           </div>
//         </div>
//         {/* sender and recever */}
//         <SenderReceverComp
//           item={patient}
//           functions={{
//             openModal: () => {
//               setIsOpen(!isOpen);
//             },
//           }}
//           button={true}
//         />
//         {/* products */}
//         <div className='mt-8 grid grid-cols-6 gap-6 w-full'>
//           <div className='col-span-6 overflow-hidden rounded-xl border-2 border-border p-6'>
//             <InvoiceProductsTable
//               data={selectedService}
//               functions={{
//                 deleteItem: (id) => {
//                   console.log("id", id);
//                   setSelectedService((prev) =>
//                     prev.filter((item) => item._id != id)
//                   );
//                 },
//               }}
//               button={true}
//             />

//             {/* add */}
//             <button
//               onClick={() => setItemOpen(!itemOpen)}
//               className='flex-rows mt-4 w-full gap-2 rounded-lg border border-dashed border-subMain py-4 text-sm text-subMain'
//             >
//               <BiPlus /> Add Item
//             </button>
//           </div>
//           <div className='col-span-6 flex flex-col gap-6'>
//             <Select
//               selectedPerson={currency}
//               setSelectedPerson={setCurrency}
//               datas={sortsDatas?.currency}
//             >
//               <div className='flex h-14 w-full items-center justify-between rounded-md border border-border px-4 text-xs text-main'>
//                 <p>{currency}</p>
//                 <BiChevronDown className='text-xl' />
//               </div>
//             </Select>
//             <div className='grid gap-6 sm:grid-cols-2'>
//               <Input
//                 label='Discount'
//                 color={true}
//                 type='number'
//                 placeholder={"Enter Discount"}
//                 value={discount}
//                 onChange={(e) => setDiscount(e.target.value)}
//               />
//               <Input
//                 label='Tax(%)'
//                 color={true}
//                 type='number'
//                 placeholder={"Enter Tax Percentage"}
//                 value={tax}
//                 onChange={(e) => setTax(e.target.value)}
//               />
//             </div>
//             <div className='flex-btn gap-4'>
//               <p className='text-sm font-extralight'>Sub Total:</p>
//               <h6 className='text-sm font-medium'>{subTotal}</h6>
//             </div>
//             <div className='flex-btn gap-4'>
//               <p className='text-sm font-extralight'>Discount:</p>
//               <h6 className='text-sm font-medium'>{discount}</h6>
//             </div>
//             <div className='flex-btn gap-4'>
//               <p className='text-sm font-extralight'>Tax:</p>
//               <h6 className='text-sm font-medium'>{taxValue}</h6>
//             </div>
//             <div className='flex-btn gap-4'>
//               <p className='text-sm font-extralight'>Grand Total:</p>
//               <h6 className='text-sm font-medium text-green-600'>{amount}</h6>
//             </div>
//             {/* notes */}
//             <Textarea
//               label='Notes'
//               placeholder='Thank you for your business. We hope to work with you again soon!'
//               color={true}
//               rows={3}
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//             />
//             {/* button */}
//             <Button
//               label='Save & Send'
//               onClick={() => {
//                 sendRequest();
//               }}
//               Icon={BsSend}
//             />
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default CreateInvoice;
import React, { useEffect, useState } from "react";
import {
  Button,
  FromToDate,
  Input,
  Select,
  Textarea,
} from "../../components/Form";
import { BiChevronDown, BiPlus } from "react-icons/bi";
import PatientMedicineServiceModal from "../../components/Modals/PatientMedicineServiceModal";
import AddItemModal from "../../components/Modals/AddItemInvoiceModal";
import { invoicesData, sortsDatas } from "../../components/Datas";
import { toast } from "react-hot-toast";
import { BsSend } from "react-icons/bs";
import { IoArrowBackOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { InvoiceProductsTable } from "../../components/Tables";
import SenderReceverComp from "../../components/SenderReceverComp";
import { FaMagnifyingGlass } from "react-icons/fa6";

 
function CreateInvoice({ closeModal, onSuccess, defaultPatient }) {
  const [dateRange, setDateRange] = useState([
    new Date(),
    new Date(new Date().setDate(new Date().getDate() + 7)),
  ]);
  const [startDate, endDate] = dateRange;
  const [isOpen, setIsOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [currency, setCurrency] = useState(sortsDatas.currency[4]?.name);
  const [uniquePatients, setUniquePatients] = useState([]);
  const [patient, setPatient] = useState(defaultPatient || { fullName: "", id: "" });
  const [servicesData, setServicesData] = useState([]);
  const [selectedService, setSelectedService] = useState([{
    _id: Date.now().toString(),
    serviceName: "",
    price: 0,
    quantity: 1,
    //serviceId: null,
  },]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState(sortsDatas?.method?.[1]?.name || "Cash");
  
  // States for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const subTotal = selectedService.reduce((acc, item) => {
    return acc + (item.price * item.quantity || 1);
  }, 0);

  const navigate = useNavigate();

  const fetchDataForService = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services`, {
        credentials: "include",
      });
      const json = await response.json();
      setServicesData(json);
      console.log("Fetched Services:", json);
    } catch (e) {
      console.log("error fetching...", e);
    }
  };

  useEffect(() => {
    fetchDataForService();
  }, []);

  // If defaultPatient changes, sync it to local state
  useEffect(() => {
    if (defaultPatient && defaultPatient._id) {
      setPatient({
        fullName: defaultPatient.fullName || "",
        _id: defaultPatient._id,
        email: defaultPatient.email || defaultPatient.contactDetails?.email || "",
        phone: defaultPatient.phone || defaultPatient.contactDetails?.primaryContact || "",
      });
      setSelected({ fullName: defaultPatient.fullName, _id: defaultPatient._id });
      setSearchQuery("");
      setDropdownVisible(false);
    }
  }, [defaultPatient]);

  const filteredPatients = (uniquePatients || []).filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (user) => {
    setSelected(user);
    setPatient({
      fullName: user.fullName || "",
      _id: user._id || "",
      email: user.email || "",
      phone: user.phone || "",
      image: user.image || ""
    });
    setDropdownVisible(false);
    setSearchQuery("");
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelected(null);
    setDropdownVisible(true);
  };

  const taxValue = (subTotal * tax) / 100;

  const amount = subTotal + Number(taxValue) - discount;

  const sendRequest = async () => {
    const services = selectedService.map((item) => ({
      serviceId: item._id,
      quantity: item.quantity || 1,
      price: item.price,
      name: item.serviceName,
      amount: item.price*item.quantity,
    }));

    const payload = {
      patientId: patient._id,
      services,
      currency,
      discount: Number(discount),
      tax: Number(tax),
      notes,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount: Number(amount),
      method: method || "Cash",
    };
    // console.log("payload for Payment:",payload);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Invoice created successfully!");
        // navigate("/payments");
        onSuccess();
        closeModal();
      } else {
        console.error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const onChangeDates = (update) => {
    setDateRange(update);
  };

  const fetchData = async () => {
    try {
      const getProfileId = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/unique/patients`,
        { credentials: "include" }
      );
      const json = await getProfileId.json();
      console.log("Patient Data:",json?.patients);
      setUniquePatients(json?.patients);
    } catch (e) {
      console.log("Error fetching data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {/* {isOpen && (
        <PatientMedicineServiceModal
          setOpen={setIsOpen}
          isOpen={isOpen}
          patient={true}
          patientData={uniquePatients}
          setPatient={setPatient}
        />
      )}
      {itemOpen && (
        <AddItemModal
          setItemOpen={setItemOpen}
          isOpen={itemOpen}
          servicesData={servicesData}
          setSelectedService={setSelectedService}
          selectedService={selectedService}
        />
      )} */}
      <div className='flex items-center gap-4'>
        {/* <Link
          to='/payments'
          className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
        >
          <IoArrowBackOutline />
        </Link> */}
        {/* <button
          onClick={closeModal}
          className='text-sm rounded-lg border border-dashed border-subMain bg-white px-3 py-2'
        >
          <IoArrowBackOutline />
        </button> */}

        {/* <h1 className='text-lg font-semibold'>Create Payment Receipt</h1> */}
      </div>
      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-6 rounded-xl border-[1px] border-border bg-white p-4'
      >
        {/* header */}
        {/* <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='lg:col-span-3'>
            
          </div>

          <div className='flex flex-col gap-2'>
            <FromToDate
              startDate={startDate}
              endDate={endDate}
              label='Dates'
              onChange={onChangeDates}
            />
          </div>
        </div> */}
        {/* Patient Name Section - Same as Add Appointment */}
        <div className='mt-6 w-full'>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Patient Name</p>
            {defaultPatient ? (
              // Locked patient mode: Display patient name with profile
              <div className="w-full">
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {patient.fullName || defaultPatient?.fullName || "Unknown Patient"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Search mode: Show search functionality
              <div className="w-full relative">
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  {selected ? (
                    <div className="w-8 h-8 rounded-md bg-gray-200 mr-2 flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">
                        {selected?.fullName?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                    </div>
                  ) : (
                    <FaMagnifyingGlass className="text-gray-400 mr-2" style={{ fontSize: '14px' }} />
                  )}
                  <input
                    type="text"
                    placeholder="Search Patient"
                    className="w-full border-none outline-none text-sm text-gray-600 placeholder:text-sm placeholder:text-gray-400"
                    value={searchQuery || selected?.fullName || ""}
                    onChange={handleInputChange}
                  />
                </div>

                {searchQuery && dropdownVisible && (
                  <div className="absolute w-full mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 shadow bg-white z-10">
                    {filteredPatients.length === 0 ? (
                      <p className="p-2 text-xs text-gray-500">No results found</p>
                    ) : (
                      filteredPatients.map((user) => (
                        <div
                          key={user._id}
                          className="cursor-pointer p-2 hover:bg-gray-100"
                          onClick={() => handleSelect(user)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-600 font-medium">
                                {user?.fullName?.charAt(0)?.toUpperCase() || "P"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.fullName}</p>
                              <p className="text-xs text-gray-500">{user.email || user.contactDetails?.email}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* products */}
        <div className='mt-6 grid w-full grid-cols-6 gap-4'>
          <div className='col-span-6 rounded-xl py-4'>
            <InvoiceProductsTable
              data={selectedService}
              setData={setSelectedService}
              servicesData={servicesData}
              currency={currency}
            />

            {/* add */}
            {/* <button
              onClick={() => setItemOpen(!itemOpen)}
              className='flex-rows mt-4 w-full gap-2 rounded-lg border border-dashed border-subMain py-4 text-sm text-subMain'
            >
              <BiPlus /> Add Item
            </button> */}

            <button
              onClick={() =>
                setSelectedService((prev) => [
                  ...prev,
                  {
                    _id: Date.now().toString(), // temp ID
                    serviceName: "",
                    price: 0,
                    quantity: 1,
                  },
                ])
              }
              className='flex-rows mt-3 w-full gap-2 rounded-lg border border-dashed border-subMain py-3 text-sm text-subMain'
            >
              <BiPlus /> Add Order or Service
            </button>
          </div>
          <div className='col-span-6 flex flex-col gap-4'>
            <Select
              selectedPerson={currency}
              setSelectedPerson={setCurrency}
              datas={sortsDatas?.currency}
            >
              <div className='flex h-12 w-full items-center justify-between rounded-md border border-border px-3 text-xs text-main'>
                <p>{currency}</p>
                <BiChevronDown className='text-lg' />
              </div>
            </Select>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='w-full'>
                <label className='text-sm font-semibold text-black'>Discount</label>
                <input
                  type='number'
                  placeholder='Enter Discount'
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                />
              </div>
              <div className='w-full'>
                <label className='text-sm font-semibold text-black'>Tax(%)</label>
                <input
                  type='number'
                  placeholder='Enter Tax Percentage'
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                />
              </div>
            </div>
            <div className='w-full'>
              <label className='text-sm font-semibold text-black'>Payment Method</label>
              <Select
                selectedPerson={method}
                setSelectedPerson={setMethod}
                datas={sortsDatas?.method?.filter(item => item.name !== "Payment method") || []}
              >
                <div className='flex h-12 w-full items-center justify-between rounded-md border border-border px-3 text-xs text-main'>
                  <p>{method}</p>
                  <BiChevronDown className='text-lg' />
                </div>
              </Select>
            </div>
            <div className='space-y-2 rounded-xl border border-border p-3'>
              <div className='flex-btn gap-3'>
                <p className='text-xs font-extralight'>Sub Total:</p>
                <h6 className='text-xs font-medium'>{subTotal}</h6>
              </div>
              <div className='flex-btn gap-3'>
                <p className='text-xs font-extralight'>Discount:</p>
                <h6 className='text-xs font-medium'>{discount}</h6>
              </div>
              <div className='flex-btn gap-3'>
                <p className='text-xs font-extralight'>Tax:</p>
                <h6 className='text-xs font-medium'>{taxValue}</h6>
              </div>
              <div className='flex-btn gap-3'>
                <p className='text-xs font-extralight'>Grand Total:</p>
                <h6 className='text-xs font-medium text-green-600'>{amount}</h6>
              </div>
            </div>

            {/* notes */}
            <div className='w-full'>
              <label className='text-sm font-semibold text-black'>Notes</label>
              <textarea
                placeholder='Thank you for your business. We hope to work with you again soon!'
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none'
              />
            </div>
            {/* button */}
            <button
              onClick={() => {
                sendRequest();
              }}
              className='flex items-center justify-center gap-2 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors'
            >
              <BsSend className='text-sm' />
              Create Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateInvoice;
