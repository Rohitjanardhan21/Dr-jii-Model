import React, { useEffect, useState , useRef} from "react";
import { MenuSelect } from "./Form";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FiEdit, FiEye } from "react-icons/fi";
import { RiDeleteBin6Line, RiDeleteBinLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {  formatDate } from "../Assets/Data";
import "./SenderReceverComp.css";
import moment from "moment";

const thclass = "text-start text-sm font-medium py-3 px-2 whitespace-nowrap";
const tdclass = "text-start text-sm py-4 px-2 whitespace-nowrap";

export function Transactiontable({ data, action, functions }) {
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>#</th>
          <th className={thclass}>Patient</th>
          <th className={thclass}>Date</th>
          <th className={thclass}>Status</th>
          <th className={thclass}>
            Amout <span className='text-xs font-light'>(Tsh)</span>
          </th>
          <th className={thclass}>Method</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={item?._id}
            className='transitions border-b border-border hover:bg-greyed cursor-pointer'
            onClick={() => functions.edit(item?._id)}
          >
            <td className={tdclass}>{index + 1}</td>
            <td className={tdclass}>
              <div className='flex items-center gap-4'>
                <span className='w-12'>
                  <img
                    src={item?.patient?.userImage}
                    alt={item?.patient?.fullName}
                    className='h-12 w-full rounded-full border border-border object-cover'
                  />
                </span>

                <div>
                  <h4 className='text-sm font-medium'>
                    {item?.patient?.fullName}
                  </h4>
                  <p className='mt-1 text-xs text-textGray'>
                    {item?.patient?.contactDetails?.primaryContact}
                  </p>
                </div>
              </div>
            </td>
            <td className={tdclass}>{item?.date}</td>
            <td className={tdclass}>
              <span
                className={`px-4 py-1 ${
                  item.status === "Approved"
                    ? "bg-subMain text-subMain"
                    : item.status === "Pending"
                      ? "bg-orange-500 text-orange-500"
                      : item.status === "Cancelled" && "bg-red-600 text-red-600"
                } rounded-xl bg-opacity-10 text-xs`}
              >
                {item?.status}
              </span>
            </td>
            {/* <td className={`${tdclass} font-semibold`}>{item?.amount.toFixed(2)}</td> */}
            <td className={`${tdclass} font-semibold`}>{parseInt(item?.amount)}</td>
            <td className={tdclass}>{item?.method}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// invoice table
export function InvoiceTable({ data }) {
  const navigate = useNavigate();
  const DropDown1 = [
    {
      title: "Edit",
      icon: FiEdit,
      onClick: (item) => {
        navigate(`/invoices/edit/${item._id}`);
      },
    },
    {
      title: "View",
      icon: FiEye,
      onClick: (item) => {
        navigate(`/invoices/preview/${item._id}`);
      },
    },
    {
      title: "Delete",
      icon: RiDeleteBin6Line,
      onClick: () => {
        toast.error("This feature is not available yet");
      },
    },
  ];
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>Invoice ID</th>
          <th className={thclass}>Patients</th>
          <th className={thclass}>Created Date</th>
          <th className={thclass}>Due Date</th>
          <th className={thclass}>
            Amout <span className='text-xs font-light'>(Tsh)</span>
          </th>
          <th className={thclass}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className='transitions border-b border-border hover:bg-greyed'
          >
            <td className={tdclass}>#{item?.invoiceId}</td>
            <td className={tdclass}>
              <div className='flex items-center gap-4'>
                <span className='w-12'>
                  <img
                    src={item?.to?.image}
                    alt={item?.to?.title}
                    className='h-12 w-full rounded-full border border-border object-cover'
                  />
                </span>
                <div>
                  <h4 className='text-sm font-medium'>{item?.to?.title}</h4>
                  <p className='mt-1 text-xs text-textGray'>
                    {item?.to?.email}
                  </p>
                </div>
              </div>
            </td>
            <td className={tdclass}>{formatDate(item?.createdDate)}</td>
            <td className={tdclass}>{formatDate(item?.dueDate)}</td>
            <td className={`${tdclass} font-semibold`}>{item?.amount}</td>
            <td className={tdclass}>
              <MenuSelect datas={DropDown1} item={item}>
                <div className='rounded-lg border bg-dry px-4 py-2 text-xl text-main'>
                  <BiDotsHorizontalRounded />
                </div>
              </MenuSelect>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// prescription table
export function MedicineTable({ data, onEdit }) {
  const DropDown1 = [
    {
      title: "Edit",
      icon: FiEdit,
      onClick: (item) => {
        onEdit(item);
      },
    },
    {
      title: "Delete",
      icon: RiDeleteBin6Line,
      onClick: () => {
        toast.error("This feature is not available yet");
      },
    },
  ];
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>Name</th>
          <th className={thclass}>
            Price <span className='text-xs font-light'>(Tsh)</span>
          </th>
          <th className={thclass}>Status</th>
          <th className={thclass}>InStock</th>
          <th className={thclass}>Measure</th>
          <th className={thclass}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={item.id}
            className='transitions border-b border-border hover:bg-greyed'
          >
            <td className={tdclass}>
              <h4 className='text-sm font-medium'>{item?.name}</h4>
            </td>
            <td className={`${tdclass} font-semibold`}>{item?.price}</td>
            <td className={tdclass}>
              <span
                className={`text-xs font-medium ${
                  item?.status === "Out of stock"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {item?.status}
              </span>
            </td>
            <td className={tdclass}>{item?.inStock?.toString()}</td>
            <td className={tdclass}>{item?.measure}</td>
            <td className={tdclass}>
              <MenuSelect datas={DropDown1} item={item}>
                <div className='rounded-lg border bg-dry px-4 py-2 text-xl text-main'>
                  <BiDotsHorizontalRounded />
                </div>
              </MenuSelect>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// service table

export function ServiceTable({ data, onEdit }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /* 
     DESKTOP / TABLET TABLE
  */
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full table-auto">
          <thead className="bg-dry">
            <tr>
              <th className="p-4 text-left text-sm font-medium">Name</th>
              <th className="p-4 text-left text-sm font-medium">Created At</th>
              <th className="p-4 text-left text-sm font-medium">
                Price <span className="text-xs font-light">(Tsh)</span>
              </th>
              <th className="p-4 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((item, index) => (
              <tr
                key={item?._id || index}
                onClick={() => onEdit(item)}
                className="cursor-pointer border-b hover:bg-greyed transition"
              >
                <td className="p-4 text-sm font-medium">
                  {item?.serviceName}
                </td>
                <td className="p-4 text-sm">
                  {formatDate(item?.createdAt)}
                </td>
                <td className="p-4 text-sm font-semibold">
                  {item?.price}
                </td>
                <td className="p-4 text-sm">
                  <span
                    className={`text-xs font-medium ${
                      item?.isDisabled
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item?.isDisabled ? "Disabled" : "Enabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 
         MOBILE  VIEW
      */}
      <div className="space-y-3 md:hidden">
        {data?.map((item, index) => (
          <div
            key={item?._id || index}
            onClick={() => onEdit(item)}
            className="cursor-pointer rounded-xl border border-border bg-white p-4 shadow-sm transition active:scale-[0.98]"
          >
            {/* Service Name */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {item?.serviceName}
              </h4>

              <span
                className={`text-xs font-medium ${
                  item?.isDisabled
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {item?.isDisabled ? "Disabled" : "Enabled"}
              </span>
            </div>

            {/* Meta Info */}
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{formatDate(item?.createdAt)}</span>
              <span className="font-semibold text-black">
                Tsh {item?.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


//Calendar Table
// export function CalendarTable({ data, functions, used }) {
//   const [calendarData, setCalendarData] = useState([]);

//   useEffect(() => {
//     setCalendarData(data); // initialize state from props
//   }, [data]);

//   console.log("calendarData", calendarData);

//   const startTime = moment(data.start).format("hh:mm A");
//   const endTime = moment(data.end).format("hh:mm A");
//   const timeRange = `${startTime} - ${endTime}`;

//   const DropDown1 = !used
//     ? [
//         {
//           title: "View",
//           icon: FiEye,
//           onClick: (data) => {
//             functions.preview(data);
//           },
//         },
//         {
//           title: "Delete",
//           icon: RiDeleteBin6Line,
//           onClick: async (patientId) => {
//             try {
//               const res = await fetch(
//                 `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/${patientId}`,
//                 {
//                   method: "DELETE",
//                   headers: {
//                     "Content-Type": "application/json",
//                   },
//                   credentials: "include",
//                 }
//               );

//               const data = await res.json();

//               if (!res.ok) {
//                 throw new Error(data.error || "Failed to delete relation");
//               }
//               toast.success("patient deleted successfully!!");
//               setCalendarData((prev) =>
//                 prev.filter((p) => p._id !== patientId)
//               ); // remove from table
//             } catch (err) {
//               console.error("Error deleting patient:", err);
//               toast.error("error deleting patient");
//               return { success: false, error: err.message };
//             }
//           },
//         },
//       ]
//     : [
//         {
//           title: "View",
//           icon: FiEye,
//           onClick: (data) => {
//             functions.preview(data._id);
//           },
//         },
//       ];

//   const thclasse = "text-start text-sm font-medium py-4 px-2 whitespace-nowrap ";
//   const tdclasse = "text-start text-xs py-4 px-2 whitespace-nowrap";

//   return (
//     <table className='w-[98%] table-auto mr-[2%] bg-white'>
//       <thead className='overflow-hidden rounded-lg'>
//         <tr>
//           <th className={`${thclasse} !pl-6`}>#</th>
//           <th className={thclasse}>Created At</th>
//           <th className={thclasse}>Patients</th>
//           <th className={thclasse}>Status</th>
//           {/* {!used && (
//             <>
//               <th className={thclasse}>Blood Group</th>
//               <th className={thclasse}>Age</th>
//             </>
//           )} */}
//           <th className={thclasse}>Time</th>
//         </tr>
//       </thead>
//       <tbody>
//         {calendarData.map((item, index) => (
//           <tr
//             key={item._id}
//             className='transitions border-b border-border hover:bg-greyed'
//           >
//             <td className={`${tdclasse} font-semibold text-black !pl-6`}>{index + 1}</td>

//             <td className={`${tdclasse} font-medium`}>{moment(item.dateOfVisit).format("DD MMM, YYYY") }</td>

//             <td className={tdclasse}>
//               <div className='flex items-center gap-4'>
//                 {!used && (
//                   <span className='w-12'>
//                     <img
//                       src={item.image}
//                       alt={item.title}
//                       className='h-12 w-full rounded-full border border-border object-cover'
//                     />
//                   </span>
//                 )}
//                 <div>
//                   <h4 className='text-sm font-medium text-black'>
//                     {item.title}
//                   </h4>
//                   <p className='mt-1 text-xs text-textGray'>{item.phone}</p>
//                 </div>
//               </div>
//             </td>

//             <td className={tdclasse}>
//                 <span
//                 className={`px-3 py-1 ${
//                   item.status === "Approved"
//                     ? "bg-blue-100 text-green-500"
//                     : "bg-red-100 text-orange-500"
//                 } rounded-full bg-opacity-50 text-xs text-center`}
//               >
//                 {item.status}
//               </span>
//             </td>

//             {/* {!used && (
//               <>
//                 <td className='whitespace-nowrap px-2 py-4 text-start text-sm font-medium'>
//                   {item.blood}
//                 </td>
//                 <td className='whitespace-nowrap px-2 py-4 text-start text-sm font-medium'>
//                   {item.age}
//                 </td>
//               </>
//             )} */}

//             <td className={tdclasse}>
//                 {moment(item.start).format("hh:mm A")} -{" "}
//                 {moment(item.end).format("hh:mm A")}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
export function CalendarTable({ data, onSelectEvent }) {
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    setCalendarData(data);
  }, [data]);

  const thclasse = "text-sm font-semibold py-4 px-4 whitespace-nowrap";
  const tdclasse = "text-sm font-medium py-4 px-4 whitespace-nowrap";

  return (
    <table className='mr-[2%] w-[98%] table-fixed border-collapse bg-white'>
      <thead className='overflow-hidden rounded-lg'>
        <tr>
          <th className={`${thclasse} w-[10%] text-left`}>#</th>
          <th className={`${thclasse} w-[21%] text-left`}>Appointment Date</th>
          <th className={`${thclasse} w-[23%] text-left`}>Patients</th>
          <th className={`${thclasse} w-[23%] text-center`}>Status</th>
          <th className={`${thclasse} w-[23%] text-left`}>Time</th>
        </tr>
      </thead>
      <tbody>
        {calendarData.map((item, index) => (
          <tr
            key={item._id}
            onClick={() => onSelectEvent(item)}
            className='cursor-pointer border-b border-border transition hover:bg-greyed'
          >
            <td className={`${tdclasse} w-[20%] text-left text-black`}>
              {index + 1}
            </td>

            <td className={`${tdclasse} w-[20%] text-left`}>
              {moment(item.dateOfVisit).format("DD MMM, YYYY")}
            </td>

            <td className={`${tdclasse} w-[20%] text-left`}>
              <div className='flex items-center gap-3'>
                {/* <span className='w-10'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-10 w-10 rounded-full border border-border object-cover'
                  />
                </span> */}
                <div>
                  <h4 className='text-sm font-semibold text-black'>
                    {item.title}
                  </h4>
                  <p className='mt-1 text-xs font-normal text-textGray'>
                    {item.phone}
                  </p>
                </div>
              </div>
            </td>

            <td className={`${tdclasse} w-[20%] text-center`}>
              <span
                className={`rounded-full bg-opacity-50 px-3 py-1 text-sm font-semibold ${
                  item.status === "Approved"
                    ? "bg-blue-100 text-green-500"
                    : item.status === "Cancelled"
                      ? "bg-red-100 text-red-500"
                      : "bg-red-100 text-orange-500"
                }`}
              >
                {item.status}
              </span>
            </td>

            <td className={`${tdclasse} w-[20%] text-left`}>
              {moment(item.start).format("hh:mm A")} -{" "}
              {moment(item.end).format("hh:mm A")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

//patient table
export function PatientTable({ data, functions, used }) {
  const [patientData, setPatientData] = useState([]);

  useEffect(() => {
    setPatientData(data); // initialize state from props
  }, [data]);

  const thclasse = "text-start text-sm font-medium py-3 px-2 whitespace-nowrap";
  const tdclasse = "text-start text-xs py-4 px-2 whitespace-nowrap";

  return (
    <div className="w-full">

      {/* ================= DESKTOP & TABLET TABLE ================= */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="w-full min-w-[700px] table-auto">
          <thead className="bg-dry">
            <tr>
              <th className={thclasse}>#</th>
              <th className={thclasse}>Patient</th>
              <th className={thclasse}>Created At</th>
              <th className={thclasse}>Gender</th>
              {!used && (
                <>
                  <th className={thclasse}>Blood Group</th>
                  <th className={thclasse}>Age</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {patientData.map((item, index) => (
              <tr
                key={item._id}
                onClick={() => functions.preview(item._id)}
                className="border-b border-border hover:bg-greyed cursor-pointer transition"
              >
                <td className={`${tdclasse} font-semibold`}>
                  {index + 1}
                </td>

                <td className={tdclasse}>
                  <div className="flex items-center gap-3">
                    {!used && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-black">
                        {item.title}
                      </p>
                      <p className="text-xs text-textGray">
                        {item.phone}
                      </p>
                    </div>
                  </div>
                </td>

                <td className={tdclasse}>{item.date}</td>

                <td className={tdclasse}>
                  <span
                    className={`px-3 py-1 rounded-full text-xs bg-opacity-50
                      ${
                        item.gender === "Male"
                          ? "bg-blue-100 text-blue-500"
                          : item.gender === "Female"
                          ? "bg-red-100 text-red-500"
                          : "bg-gray-100 text-gray-500"
                      }
                    `}
                  >
                    {item.gender}
                  </span>
                </td>

                {!used && (
                  <>
                    <td className={tdclasse}>{item.blood}</td>
                    <td className={tdclasse}>{item.age}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE VIEW (CARDS) ================= */}
      <div className="block sm:hidden space-y-4">
        {patientData.map((item, index) => (
          <div
            key={item._id}
            onClick={() => functions.preview(item._id)}
            className="rounded-xl border border-border bg-white p-4 shadow-sm cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              {!used && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-12 w-12 rounded-full object-cover border"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-black">
                  {item.title}
                </p>
                <p className="text-xs text-textGray">
                  {item.phone}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-textGray">Created At</p>
                <p>{item.date}</p>
              </div>

              <div>
                <p className="text-xs text-textGray">Gender</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs bg-opacity-50
                    ${
                      item.gender === "Male"
                        ? "bg-blue-100 text-blue-500"
                        : item.gender === "Female"
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  {item.gender}
                </span>
              </div>

              {!used && (
                <>
                  <div>
                    <p className="text-xs text-textGray">Blood Group</p>
                    <p>{item.blood}</p>
                  </div>

                  <div>
                    <p className="text-xs text-textGray">Age</p>
                    <p>{item.age}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// doctor table
export function DoctorsTable({ data, functions, doctor }) {
  const DropDown1 = [
    {
      title: "View",
      icon: FiEye,
      onClick: (data) => {
        functions.preview(data);
      },
    },
    {
      title: "Delete",
      icon: RiDeleteBin6Line,
      onClick: () => {
        toast.error("This feature is not available yet");
      },
    },
  ];
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>#</th>
          <th className={thclass}>
            {doctor ? "Doctor & Nurse" : "Receptionist"}
          </th>
          <th className={thclass}>Created At</th>
          {/* <th className={thclass}>Phone</th>  */}
          <th className={thclass}>Title</th>
          <th className={thclass}>Email</th>
          <th className={thclass}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={item.id}
            className='transitions border-b border-border hover:bg-greyed'
          >
            <td classNam e={tdclass}>
              {index + 1}
            </td>
            <td className={tdclass}>
              <div className='flex items-center gap-4'>
                <span className='w-12'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-12 w-full rounded-full border border-border object-cover'
                  />
                </span>
                <h4 className='text-sm font-medium'>{item.fullName}</h4>
              </div>
            </td>
            <td className={tdclass}>12 May, 2021</td>
            {/* <td className={tdclass}>
              <p className="text-textGray">{item.phone}</p>
            </td> */}
            <td className={tdclass}>{item.title}</td>
            <td className={tdclass}>{item.emailId}</td>

            <td className={tdclass}>
              <MenuSelect datas={DropDown1} item={item}>
                <div className='rounded-lg border bg-dry px-4 py-2 text-xl text-main'>
                  <BiDotsHorizontalRounded />
                </div>
              </MenuSelect>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// appointment table
export function AppointmentTable({ data, functions, doctor }) {
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>Date</th>
          <th className={thclass}>{doctor ? "Patient" : "Doctor"}</th>
          <th className={thclass}>Status</th>
          <th className={thclass}>Time</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item) => (
          <tr
            key={item.id}
            className='transitions border-b border-border hover:bg-greyed cursor-pointer'
            onClick={() => functions.preview(item)}
          >
            <td className={tdclass}>
              <p className='text-xs'>{formatDate(item.createdAt)}</p>
            </td>
            <td className={tdclass}>
              <h4 className='text-xs font-medium'>
                {item.userName}
                {/* {doctor ? item.user.userName : item.doctor.userName} */}
              </h4>
              <p className='mt-1 text-xs text-textGray'>
                {item?.phone}
                {/* {doctor ? item.user.phone : item.doctor.phone} */}
              </p>
            </td>
            <td className={tdclass}>
              <span
                className={`px-4 py-1 ${
                  item.status === "Approved"
                    ? "bg-subMain text-subMain"
                    : item.status === "Pending"
                      ? "bg-orange-500 text-orange-500"
                      : item.status === "Cancelled" && "bg-red-600 text-red-600"
                } rounded-xl bg-opacity-10 text-xs`}
              >
                {item?.status}
              </span>
            </td>
            <td className={tdclass}>
              <p className='text-xs'>{item.time}</p>
              {/* <p className="text-xs">{`${item.from} - ${item.to}`}</p> */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// payment table
export function PaymentTable({ data, functions, doctor }) {
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>Date</th>
          <th className={thclass}>{doctor ? "Patient" : "Doctor"}</th>
          <th className={thclass}>Status</th>
          <th className={thclass}>Amount</th>
          <th className={thclass}>Method</th>
          <th className={thclass}>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className='transitions border-b border-border hover:bg-greyed'
          >
            <td className={tdclass}>
              <p className='text-xs'>{item.date}</p>
            </td>
            <td className={tdclass}>
              <h4 className='text-xs font-medium'>
                {doctor ? item.user.title : item.doctor.title}
              </h4>
              <p className='mt-1 text-xs text-textGray'>
                {doctor ? item.user.phone : item.doctor.phone}
              </p>
            </td>
            <td className={tdclass}>
              <span
                className={`px-4 py-1 ${
                  item.status === "Paid"
                    ? "bg-subMain text-subMain"
                    : item.status === "Pending"
                      ? "bg-orange-500 text-orange-500"
                      : item.status === "Cancel" && "bg-red-600 text-red-600"
                } rounded-xl bg-opacity-10 text-xs`}
              >
                {item.status}
              </span>
            </td>
            <td className={tdclass}>
              <p className='text-xs font-semibold'>{`$${item.amount}`}</p>
            </td>
            <td className={tdclass}>
              <p className='text-xs'>{item.method}</p>
            </td>

            <td className={tdclass}>
              <button
                onClick={() => functions.preview(item.id)}
                className='flex-colo h-10 w-10 rounded-md border bg-white text-sm text-subMain'
              >
                <FiEye />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// invoice used table
export function InvoiceUsedTable({ data, functions }) {
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclass}>Invoice ID</th>
          <th className={thclass}>Create Date</th>
          <th className={thclass}>Due Date</th>
          <th className={thclass}>Amount</th>
          <th className={thclass}>Action</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item) => (
          <tr
            key={item._id}
            className='transitions border-b border-border hover:bg-greyed'
          >
            <td className={tdclass}>
              <p className='text-xs'>#{item.invoiceId}</p>
            </td>
            <td className={tdclass}>
              <p className='text-xs'>{formatDate(item.createdDate)}</p>
            </td>
            <td className={tdclass}>
              <p className='text-xs'>{formatDate(item?.dueDate)}</p>
            </td>
            <td className={tdclass}>
              <p className='text-xs font-semibold'>{`$${item?.subTotal}`}</p>
            </td>

            <td className={tdclass}>
              <button
                onClick={() => functions.preview(item._id)}
                className='flex-colo h-10 w-10 rounded-md border bg-white text-sm text-subMain'
              >
                <FiEye />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// invoice table
// export function InvoiceProductsTable({ data, functions, button }) {
//   return (
//     <table className='w-full table-auto'>
//       <thead className='overflow-hidden rounded-md bg-dry'>
//         <tr>
//           <th className={thclass}>Item</th>
//           <th className={thclass}>
//             Item Price
//             <span className='ml-1 text-xs font-light'>(Tsh)</span>
//           </th>
//           <th className={thclass}>Quantity</th>
//           <th className={thclass}>
//             Amout
//             <span className='ml-1 text-xs font-light'>(Tsh)</span>
//           </th>
//           {button && <th className={thclass}>Actions</th>}
//         </tr>
//       </thead>
//       <tbody>
//         {data?.map((item) => (
//           <tr
//             key={item.id}
//             className='transitions border-b border-border hover:bg-greyed'
//           >
//             <td className={`${tdclass} font-medium`}>{item.serviceName}</td>
//             <td className={`${tdclass} text-xs`}>{item.price}</td>
//             <td className={tdclass}>{item.quantity}</td>
//             <td className={tdclass}>{item.price * item.quantity}</td>
//             {button && (
//               <td className={tdclass}>
//                 <button
//                   onClick={() => functions.deleteItem(item._id)}
//                   className='rounded-lg border border-red-100 bg-red-600 bg-opacity-5 px-4 py-3 text-sm text-red-600'
//                 >
//                   <RiDeleteBinLine />
//                 </button>
//               </td>
//             )}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// invoice table



export function InvoiceProductsTable({
  data,
  setData,
  servicesData,
  currency,
  readOnly = false,
}) {
  const [searchQuery, setSearchQuery] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});

 

  const handleChange = (id, field, value) => {
    if (readOnly) return;
    setData((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              [field]:
                field === "price" || field === "quantity"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleSearchChange = (id, query) => {
    if (readOnly) return;

    setSearchQuery((prev) => ({ ...prev, [id]: query }));
    setShowSuggestions((prev) => ({ ...prev, [id]: true }));

    setData((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, serviceName: query, serviceId: null, price: 0 }
          : item
      )
    );
  };

  const handleServiceSelect = (id, service) => {
    if (readOnly) return;

    setData((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              _id: service._id,
              serviceName: service.serviceName,
              price: service.price,
              quantity: item.quantity || 1,
              serviceId: service._id,
            }
          : item
      )
    );

    setSearchQuery((prev) => ({ ...prev, [id]: service.serviceName }));
    setShowSuggestions((prev) => ({ ...prev, [id]: false }));
  };

  const handleDelete = (id) => {
    if (readOnly) return;
    setData((prev) => prev.filter((item) => item._id !== id));
  };

  /*  DESKTOP / TABLET */

  return (
    <>
      {/*  DESKTOP TABLE  */}
      <div className="hidden sm:block">
        <table className="mt-3 w-full table-auto border-collapse border-gray-300">
          <tbody>
            {data.map((item) => {
              const filteredServices = (servicesData || []).filter((service) =>
                service.serviceName
                  .toLowerCase()
                  .includes((searchQuery[item._id] || "").toLowerCase())
              );

              return (
                <React.Fragment key={item._id}>
                  {/* HEADER ROW  */}
                  <tr className="border-l border-r border-gray-300 bg-[#F1F1F1]">
                    <th className="border p-2 text-left">Services / Order</th>
                    <th className="border p-2 text-left">
                      Price ({currency?.split(" ")[0]})
                    </th>
                    <th className="border p-2 text-left">Quantity</th>
                    <th className="border p-2 text-left">
                      Amount ({currency?.split(" ")[0]})
                    </th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>

                  {/* DATA ROW  */}
                  <tr className="hover:bg-greyed">
                    {/* SERVICE */}
                    <td className="relative border p-2">
                      {readOnly ? (
                        <span>{item.serviceName}</span>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={
                              searchQuery[item._id] ??
                              item.serviceName ??
                              ""
                            }
                            onChange={(e) =>
                              handleSearchChange(
                                item._id,
                                e.target.value
                              )
                            }
                            onFocus={() =>
                              setShowSuggestions((p) => ({
                                ...p,
                                [item._id]: true,
                              }))
                            }
                            className="w-full bg-transparent px-2 py-1 outline-none"
                            placeholder="Search service"
                          />

                          {showSuggestions[item._id] && (
                            <div className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                              <div className="px-3 py-2 font-semibold">
                                Select Services / Order
                              </div>
                              <ul className="max-h-40 overflow-auto">
                                {filteredServices.length === 0 ? (
                                  <li className="px-3 py-2 text-sm text-gray-500">
                                    No service found
                                  </li>
                                ) : (
                                  filteredServices.map((service) => (
                                    <li
                                      key={service._id}
                                      onClick={() =>
                                        handleServiceSelect(
                                          item._id,
                                          service
                                        )
                                      }
                                      className="flex cursor-pointer justify-between px-3 py-2 text-sm hover:bg-gray-100"
                                    >
                                      <span>
                                        {service.serviceName}
                                      </span>
                                      <span>
                                        {new Intl.NumberFormat("en-IN", {
                                          style: "currency",
                                          currency:
                                            service.currency || "INR",
                                        }).format(service.price)}
                                      </span>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    {/* PRICE */}
                    <td className="border p-2">
                      {readOnly ? (
                        item.price
                      ) : (
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleChange(
                              item._id,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent outline-none"
                        />
                      )}
                    </td>

                    {/* QTY */}
                    <td className="border p-2">
                      {readOnly ? (
                        item.quantity
                      ) : (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleChange(
                              item._id,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent outline-none"
                        />
                      )}
                    </td>

                    {/* AMOUNT */}
                    <td className="border p-2 font-medium">
                      {item.price * item.quantity}
                    </td>

                    {/* ACTION */}
                    <td className="border p-2">
                      {!readOnly && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded border border-red-200 px-3 py-1 text-red-600"
                        >
                          <RiDeleteBinLine />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* SPACER */}
                  <tr>
                    <td colSpan="5" className="h-4" />
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW  */}
      <div className="block sm:hidden space-y-4">
        {data.map((item) => {
          const filteredServices = (servicesData || []).filter((service) =>
            service.serviceName
              .toLowerCase()
              .includes((searchQuery[item._id] || "").toLowerCase())
          );

          return (
            <div
              key={item._id}
              className="rounded-xl border border-border bg-white p-4"
            >
              <label className="text-xs text-textGray">Service</label>
              <input
                type="text"
                value={searchQuery[item._id] ?? item.serviceName ?? ""}
                onChange={(e) =>
                  handleSearchChange(item._id, e.target.value)
                }
                onFocus={() =>
                  setShowSuggestions((p) => ({
                    ...p,
                    [item._id]: true,
                  }))
                }
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                placeholder="Search service"
              />

              {showSuggestions[item._id] && (
                <div className="mt-1 max-h-48 overflow-auto rounded border bg-white shadow">
                  {filteredServices.map((service) => (
                    <div
                      key={service._id}
                      onClick={() =>
                        handleServiceSelect(item._id, service)
                      }
                      className="flex cursor-pointer justify-between px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <span>{service.serviceName}</span>
                      <span>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: service.currency || "INR",
                        }).format(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleChange(item._id, "price", e.target.value)
                  }
                  className="rounded border px-3 py-2 text-sm"
                  placeholder="Price"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleChange(item._id, "quantity", e.target.value)
                  }
                  className="rounded border px-3 py-2 text-sm"
                  placeholder="Qty"
                />
              </div>

              <div className="mt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{item.price * item.quantity}</span>
              </div>

              {!readOnly && (
                <button
                  onClick={() => handleDelete(item._id)}
                  className="mt-3 w-full rounded border border-red-300 py-2 text-sm text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}


// medicine Dosage table

export function MedicineDosageTable({ data, functions, button }) {
  const thclasse = "text-start text-xs font-medium py-3 px-2 whitespace-nowrap";
  const tdclasse = "text-start text-xs py-4 px-2 whitespace-nowrap";
  return (
    <table className='w-full table-auto'>
      <thead className='overflow-hidden rounded-md bg-dry'>
        <tr>
          <th className={thclasse}>Item</th>
          <th className={thclasse}>
            Item Price
            <span className='ml-1 text-xs font-light'>(Tsh)</span>
          </th>
          <th className={thclasse}>Dosage</th>
          <th className={thclasse}>Instraction</th>
          <th className={thclasse}>Quantity</th>
          <th className={thclasse}>
            Amout
            <span className='ml-1 text-xs font-light'>(Tsh)</span>
          </th>
          {button && <th className={thclasse}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data?.map((item) => (
          <tr
            key={item.id}
            className='transitions border-b border-border hover:bg-greyed'
          >
            <td className={tdclasse}>{item.name}</td>
            <td className={tdclasse}>{item.price}</td>
            <td className={tdclasse}>{item.id} - M/A/E</td>
            <td className={tdclasse}>{item.instraction}</td>
            <td className={tdclasse}>{item.id}</td>
            <td className={tdclasse}>{item.price * item.id}</td>
            {button && (
              <td className={tdclasse}>
                <button
                  onClick={() => functions.delete(item.id)}
                  className='rounded-lg border border-red-100 bg-red-600 bg-opacity-5 px-4 py-3 text-sm text-red-600'
                >
                  <RiDeleteBinLine />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
