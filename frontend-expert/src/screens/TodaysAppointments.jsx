import React, { useState, useEffect } from 'react';
import { BsClockFill, BsXCircleFill, BsCheckCircleFill } from 'react-icons/bs';
import AddAppointmentModal from '../components/Modals/AddApointmentModal';

const TodaysAppointments = () => {
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [uniquePatients, setUniquePatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch unique patients for the modal
  const fetchUniquePatients = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/unique/patients`,
        { credentials: "include" }
      );
      
      if (response.ok) {
        const data = await response.json();
        setUniquePatients(data?.patients || []);
      } else {
        console.error('Failed to fetch unique patients');
        setUniquePatients([]);
      }
    } catch (error) {
      console.error('Error fetching unique patients:', error);
      setUniquePatients([]);
    }
  };

  // Fetch today's appointments
  const fetchTodaysAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/appointments?start=${encodeURIComponent(startOfDay)}&end=${encodeURIComponent(endOfDay)}`,
        { credentials: "include" }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTodaysAppointments(data);
      } else {
        console.error('Failed to fetch appointments');
        setTodaysAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      setTodaysAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniquePatients();
    fetchTodaysAppointments();
  }, []);

  // Handle appointment click to open edit modal
  const handleAppointmentClick = (appointment) => {
    // Transform appointment data to match the modal's expected format
    const transformedAppointment = {
      id: appointment._id,
      appointmentId: appointment._id,
      patientId: appointment.userId?._id,
      title: appointment.userId?.fullName || "Unknown",
      image: appointment.userId?.image, // Include patient image
      email: appointment.userId?.email, // Include patient email
      phone: appointment.userId?.phone, // Include patient phone
      service: appointment.purposeOfVisit,
      message: appointment.description || "No description provided",
      dateOfVisit: appointment.dateOfVisit,
      start: new Date(appointment.startTime),
      end: new Date(appointment.endTime),
      status: appointment.status,
      shareData: appointment.shareWithPatient || {
        email: false,
        sms: false,
        whatsapp: false,
      },
    };

    setSelectedAppointment(transformedAppointment);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    // Refresh appointments after modal close
    fetchTodaysAppointments();
  };

  // Calculate time difference for display
  const getTimeLabel = (appointmentTime) => {
    const start = new Date(appointmentTime);
    const now = new Date();
    const diffMs = start - now;
    const diffMins = Math.round(Math.abs(diffMs) / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    let label = "";

    if (hours > 0) {
      label = `${hours} hr${hours > 1 ? "s" : ""}`;
      if (minutes > 0) {
        label += ` ${minutes} min`;
      }
    } else {
      label = `${minutes} min`;
    }

    return diffMs < 0 ? `${label} ago` : `in ${label}`;
  };

  if (loading) {
    return (
      <div className='rounded-xl border-[1px] border-border bg-white p-5 xl:mt-6'>
        <h2 className='mb-4 text-sm font-medium'>Today Appointments</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-textGray">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='rounded-xl border-[1px] border-border bg-white p-5 xl:mt-6'>
        <h2 className='mb-4 text-sm font-medium'>Today Appointments</h2>
        
        {todaysAppointments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-textGray text-sm">No appointments for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysAppointments.map((appointment, index) => (
              <div
                key={appointment._id || index}
                className='grid grid-cols-12 items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors'
                onClick={() => handleAppointmentClick(appointment)}
              >
                {/* Time Label */}
                <p className='col-span-3 text-[12px] font-light text-textGray'>
                  {getTimeLabel(appointment.startTime)}
                </p>

                {/* Status Icon */}
                <div className='flex-colo relative col-span-2'>
                  <hr className='h-20 w-[2px] bg-border' />
                  <div
                    className={`flex-colo h-7 w-7 bg-opacity-10 text-sm ${
                      appointment.status === "Pending" && "bg-orange-500 text-orange-500"
                    } ${
                      appointment.status === "Cancelled" && "bg-red-500 text-red-500"
                    } ${
                      appointment.status === "Approved" && "bg-green-500 text-green-500"
                    } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full`}
                  >
                    {appointment.status === "Pending" && <BsClockFill />}
                    {appointment.status === "Cancelled" && <BsXCircleFill />}
                    {appointment.status === "Approved" && <BsCheckCircleFill />}
                  </div>
                </div>

                {/* Patient Info */}
                <div className='col-span-6 flex flex-col gap-1'>
                  <h2 className='text-xs font-medium'>
                    {appointment.userId?.fullName || "Unknown"}
                  </h2>
                  <p className='text-[12px] font-light text-textGray'>
                    {new Date(appointment.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(appointment.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Click indicator */}
                <div className='col-span-1 flex justify-end'>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Appointment Modal with Delete functionality */}
      {isModalOpen && selectedAppointment && (
        <AddAppointmentModal
          datas={selectedAppointment}
          isOpen={isModalOpen}
          patientData={uniquePatients}
          closeModal={handleModalClose}
        />
      )}
    </>
  );
};

export default TodaysAppointments;