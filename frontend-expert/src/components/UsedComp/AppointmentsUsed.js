import { useEffect, useState } from "react";
import AppointmentPreviewModal from "../Modals/AppointmentPreviewModal";
import { AppointmentTable } from "../Tables";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useParams } from "react-router-dom";
import AddAppointmentModal from "../Modals/AddApointmentModal";
// Removed unused import: shareData

function AppointmentsUsed({ doctor }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({});
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [uniquePatients, setUniquePatients] = useState([]);
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
useEffect(() => {
    const fetchData = async () => {
      try {
        const getProfileId = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/unique/patients`,
          { credentials: "include" }
        );
        const json = await getProfileId.json();
        setUniquePatients(json?.patients || []);
      } catch (e) {
        console.log("Error fetching data:", e);
      }
    };

    fetchData();
  }, []);

  console.log("uniquePatients", uniquePatients);

  const currentPatient = uniquePatients.find(
    (p) => p._id === id || p.userId?._id === id
  );

  console.log("currentPatient", currentPatient);

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const fetchAppoint = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/user/appointments?userId=${id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      const formatted = data.map((item, i) => ({
        id: i + 1,
        createdAt: item.createdAt,
        dateOfVisit: item.dateOfVisit,
        patientName: item.userId.fullName,
        phone: item.userId.contactDetails.primaryContact,
        status: item.status,
        description: item.description,
        purposeOfVisit: item.purposeOfVisit,
        userName: item.doctorId.fullName,
        shareWithPatient:item.shareWithPatient,
        startTime:item.startTime,
        endTime:item.endTime,
        time: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,

      }));

      setAppointmentsData(formatted);
    } catch (e) {
      console.log("error fetching appointments...", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAppoint();
    }
  }, [id]);

  const handleEventClick = (event) => {
    setData(event);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setData({});
  };

  return (
    <div className='w-full'>
      {open && (
        <AppointmentPreviewModal
          datas={data}
          isOpen={open}
          closeModal={handleClose}
        />
      )}
      {openModal && (
        <AddAppointmentModal
          isOpen={openModal}
          closeModal={handleCloseModal}
          doctor={doctor}
          patientData={currentPatient ? [currentPatient] : []}
          defaultPatient={currentPatient}
          onAppointmentCreated={fetchAppoint} 
        />
      )}
      {loading ? (
        <div className='flex h-screen w-full items-center justify-center'>
          <AiOutlineLoading3Quarters className='animate-spin text-3xl text-subMain' />
        </div>
      ) : (
        <div>
          <span className="flex items-center justify-between">
          <h1 className='mb-6 text-lg font-medium'>Appointments</h1>
           <button
          className='mb-6 rounded bg-[#0097DB] px-4 py-2 text-white hover:bg-[#007bb5]'
          onClick={handleOpenModal}
        >
          New Appointment +
        </button>
        </span>
          <div className='w-full overflow-x-scroll'>
            <AppointmentTable
              data={appointmentsData}
              doctor={doctor}
              functions={{
                preview: handleEventClick,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsUsed;
