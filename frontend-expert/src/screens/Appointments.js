import React, { useCallback } from "react";
import Layout from "../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  BiChevronLeft,
  BiChevronRight,
  BiTime,
  BiSearch,
  BiX,
} from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import AddAppointmentModal from "../components/Modals/AddApointmentModal";
import { servicesData } from "../components/Datas";
import { useEffect } from "react";
import { FaListUl } from "react-icons/fa";
import { CalendarTable } from "../components/Tables";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";
import socket from "../utils/socket";
import CreatePatient from "./Patients/CreatePatient";
import Modal from "../components/Modals/Modal";
import { BsCalendarMonth } from "react-icons/bs";
import { MdOutlineCalendarMonth } from "react-icons/md";
import PageAction from "../components/PageAction";

// const socket = io(`${process.env.REACT_APP_SERVER_BASE_URL}`);

// custom toolbar
const CustomToolbar = (toolbar) => {
  const { setCurrentView, onNavigate, onView } = toolbar;

  // today button handler
  const goToBack = () => {
    if (onNavigate) {
      onNavigate("prev");
    }
  };

  // next button handler
  const goToNext = () => {
    if (onNavigate) {
      onNavigate("next");
    }
  };

  // today button handler
  const goToCurrent = () => {
    if (onNavigate) {
      onNavigate("TODAY");
    }
  };

  // month button handler
  const goToMonth = () => {
    if (onView) {
      onView("month");
    }
  };

  // week button handler
  const goToWeek = () => {
    if (onView) {
      onView("week");
    }
  };

  // day button handler
  const goToDay = () => {
    if (onView) {
      onView("day");
    }
  };

  // list button handler
  const goToList = () => {
    setCurrentView("list");
  };

  // view button group
  const viewNamesGroup = [
    { view: "list", label: "List" },
    { view: "month", label: "Month" },
    { view: "week", label: "Week" },
    { view: "day", label: "Day" },
  ];

  return (
    <div className='mb-8 flex flex-col gap-8'>
      {/* <h1 className='text-xl font-semibold'>Appointments</h1> */}
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-12'>
        <div className='flex items-center justify-center sm:justify-start md:col-span-1'>
          <button
            onClick={goToCurrent}
            className='rounded-md border border-subMain px-6 py-2 text-subMain'
          >
            Today
          </button>
        </div>
        {/* label */}
        <div className='flex-rows gap-4 md:col-span-9'>
          <button onClick={goToBack} className='text-2xl text-subMain'>
            <BiChevronLeft />
          </button>
          <span className='text-xl font-semibold'>
            {moment(toolbar.date).format("MMMM YYYY")}
          </span>
          <button onClick={goToNext} className='text-2xl text-subMain'>
            <BiChevronRight />
          </button>
        </div>
        {/* filter */}
        <div className='grid grid-cols-4 rounded-md border border-subMain md:col-span-2'>
          {viewNamesGroup.map((item, index) => (
            <button
              key={index}
              onClick={
                item.view === "month"
                  ? goToMonth
                  : item.view === "week"
                    ? goToWeek
                    : item.view === "list"
                      ? goToList
                      : goToDay
              }
              className={`flex-colo border-l border-subMain py-2 text-xl ${
                toolbar.view === item.view
                  ? "bg-subMain text-white"
                  : "text-subMain"
              }`}
            >
              {item.view === "month" ? (
                <HiOutlineViewGrid />
              ) : item.view === "week" ? (
                <HiOutlineCalendarDays />
              ) : item.view === "list" ? (
                <FaListUl />
              ) : (
                <BiTime />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function Appointments() {
  const localizer = momentLocalizer(moment);
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState({});
  const [uniquePatients, setUniquePatients] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] =
    React.useState(false);
  const [range, setRange] = React.useState({
    start: moment().startOf("month").toDate(),
    end: moment().endOf("month").toDate(),
  });
  const [loading, setLoading] = React.useState(true);

  const [appointmentData, setAppointmentData] = React.useState([]);
  const [currentView, setCurrentView] = React.useState("list");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const navigate = useNavigate();

  const doctor = useDoctorAuthStore();
  // console.log("doctor:", doctor);

  // useEffect(() => {
  //   // Make sure doctor info is available
  //   if (doctor?._id) {
  //     console.log("Registering doctor with socket:", doctor._id);
  //     socket.emit("registerUser", doctor._id);
  //   }

  //   // Cleanup on unmount
  //   return () => {
  //     console.log("Doctor disconnected");
  //     socket.disconnect();
  //   };
  // }, [doctor?._id]);

  // handle modal close
  const handleClose = () => {
    setOpen(!open);
    setData({});
  };

  const handleRangeChange = (range) => {
    if (Array.isArray(range)) {
      setRange({ start: range[0], end: range[range.length - 1] });
    } else if (typeof range === "object" && range.start && range.end) {
      setRange({ start: range.start, end: range.end });
    }
  };

  const fetAppointments = useCallback(async () => {
    try {
      const startUTC = moment(range.start).utc().startOf("day").toISOString();
      const endUTC = moment(range.end).utc().endOf("day").toISOString();

      const appointmentData = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/appointments?start=${encodeURIComponent(startUTC)}&end=${encodeURIComponent(endUTC)}`,
        { credentials: "include" }
      );
      const json = await appointmentData.json();
      setAppointmentData([...json]);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    fetAppointments();
  }, [fetAppointments]);

  // Refetch on socket event
  useEffect(() => {
    if (!doctor?._id) return;

    socket.emit("registerUser", doctor._id);

    // const handleAppointmentCreated = () => {
    //   console.log("📅 Appointment created, refetching...");
    //   fetAppointments();
    // };

    const handleAppointmentUpdated = (data) => {
      // 👉 data contains { status, message }
      fetAppointments();

      // Optional: show toast when appointment is updated
      // if (data?.status) {
      //   toast.success(`Appointment ${data.status}: ${data.message}`, {
      //     position: "top-center",
      //   });
      // }
    };

    // socket.on("appointment-received", handleAppointmentCreated);
    socket.on("appointment-update-received", handleAppointmentUpdated);

    return () => {
      // socket.off("appointment-received", handleAppointmentCreated);
      socket.off("appointment-update-received", handleAppointmentUpdated);
    };
  }, [doctor?._id, fetAppointments]);

  // useEffect(() => {
  //   const handleAppointment = (data) => {
  //     console.log("New appointment received:", data);
  //     fetAppointments();
  //   };

  //   socket.on("appointment-received", handleAppointment);

  //   // return () => {
  //   //   socket.off("appointment-received", handleAppointment);
  //   // };
  // }, []);

  const fetchData = async () => {
    try {
      const getProfileId = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/unique/patients`,
        { credentials: "include" }
      );
      const json = await getProfileId.json();
      setUniquePatients(json?.patients);
    } catch (e) {
      console.log("Error fetching data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients`,
        { credentials: "include" }
      );
      const json = await res.json();
      setPatients(json || []);
    } catch (e) {
      console.log("Error fetching patients:", e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Listen for action event from header ActionButton
  useEffect(() => {
    const handleAddAppointmentAction = () => {
      handleClose();
    };

    window.addEventListener(
      "action:addAppointment",
      handleAddAppointmentAction
    );
    return () => {
      window.removeEventListener(
        "action:addAppointment",
        handleAddAppointmentAction
      );
    };
  }, []);

  const filteredPatients = patients?.filter((patient) =>
    (patient?.title || "").toLowerCase().includes(search.toLowerCase())
  );
  // Remove filter if needed
  const transformedEvents = appointmentData
    .filter((appointment) => {
      const status = appointment.status?.toLowerCase();
      const isIncluded = ["approved", "cancelled", "pending"].includes(status);
      console.log(
        `Appointment ${appointment._id}: status="${appointment.status}" -> included=${isIncluded}`
      );
      return isIncluded;
    })
    .map((appointment, index) => {
      const matchingService = servicesData.find(
        (service) =>
          service.name.toLowerCase() ===
          appointment.purposeOfVisit.toLowerCase()
      );

      const startTime = moment(appointment.startTime);
      const endTime = moment(appointment.endTime);

      const visitDate = moment(appointment.dateOfVisit).format("YYYY-MM-DD");

      const combinedStart = moment(
        `${visitDate}T${startTime.format("HH:mm:ss")}`
      );
      const combinedEnd = moment(`${visitDate}T${endTime.format("HH:mm:ss")}`);

      if (loading) {
        return (
          <Layout>
            <p>Loading...</p>
          </Layout>
        );
      }

      return {
        id: index, // or use appointment._id if preferred
        start: combinedStart.toDate(),
        end: combinedEnd.toDate(),
        color: "#FB923C", // Optional: choose based on appointment type/status
        title: appointment.userId.fullName,
        patientId: appointment.userId._id,
        message: appointment.description || "No description provided",
        service: appointment.purposeOfVisit,
        shareData: appointment.shareWithPatient || {
          email: false,
          sms: false,
          whatsapp: false,
        },
        status: appointment.status,
        appointmentId: appointment._id,
        dateOfVisit: appointment.dateOfVisit,
      };
    });

  console.log("Transformed events:", transformedEvents);

  // onClick event handler
  const handleEventClick = (event) => {
    setData(event);
    setOpen(!open);
  };

  const appointmentStats = {
    todayTotal: transformedEvents.filter((ev) =>
      moment(ev.dateOfVisit).isSame(moment(), "day")
    ).length,

    monthTotal: transformedEvents.filter((ev) =>
      moment(ev.dateOfVisit).isSame(moment(), "month")
    ).length,

    yearTotal: transformedEvents.filter((ev) =>
      moment(ev.dateOfVisit).isSame(moment(), "year")
    ).length,
  };

  // Boxes (Same structure as Patients boxes)
  const appointmentBoxes = [
    {
      id: 1,
      title: "Today Appointments",
      value: appointmentStats.todayTotal,
      color: ["bg-subMain", "text-subMain"],
      icon: BiTime,
    },
    {
      id: 2,
      title: "Monthly Appointments",
      value: appointmentStats.monthTotal,
      color: ["bg-pink-500", "text-pink-500"],
      icon: BsCalendarMonth,
    },
    {
      id: 3,
      title: "Yearly Appointments",
      value: appointmentStats.yearTotal,
      color: ["bg-green-500", "text-green-500"],
      icon: MdOutlineCalendarMonth,
    },
  ];

  return (
    <Layout>
      {/* Page Title with Action Button */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Appointments</h1> 
       {/* <PageAction onActionClick={handleClose} /> */}
      </div>

      {/* Search Patients */}
      <div className='relative flex justify-between items-center mb-6  grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
        <input
          type='text'
          placeholder='Search "Patients"'
          className='h-11 rounded-md border border-border bg-dry px-4 text-sm text-main md:col-span-2 lg:col-span-3'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          onFocus={() => setShowDropdown(true)}
        />
         <PageAction onActionClick={handleClose} />
        {showDropdown && search && (
          <ul className='absolute top-16 z-10 w-full max-w-xs rounded-md border border-gray-200 bg-white shadow-md md:col-span-2 lg:col-span-3'>
            {filteredPatients?.length > 0 &&
              filteredPatients.map((patient, idx) => (
                <li
                  key={idx}
                  className='flex cursor-pointer flex-row items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearch(patient?.title || "");
                    setShowDropdown(false);
                    navigate(`/patients/preview/${patient?._id}`);
                  }}
                >
                  <img
                    src={patient?.image}
                    alt='Patient'
                    className='h-10 w-10 rounded-full border border-subMain object-cover'
                  />
                  <div className='flex flex-col'>
                    <h2 className='text-sm font-semibold'>{patient?.title}</h2>
                    <p className='text-xs text-textGray'>{patient?.email}</p>
                    <p className='text-xs'>{patient?.phone}</p>
                  </div>
                </li>
              ))}
            {/* Show "Add Patient" if no match */}
            {filteredPatients?.length === 0 && (
              <li
                className='flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-main hover:bg-gray-100'
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsAddPatientModalOpen(true);
                }}
              >
                <span className='text-xl font-bold'>+</span>
                <span>Add "{search}" as new patient</span>
              </li>
            )}
          </ul>
        )}
      </div>

      {open && (
        <AddAppointmentModal
          datas={data}
          isOpen={open}
          patientData={uniquePatients}
          closeModal={handleClose}
          onSuccess={() => {
            // Refresh appointments after successful creation/update
            fetAppointments();
          }}
        />
      )}

      {/* CustomToolbar - Always visible */}
      <CustomToolbar
        date={currentDate}
        view={currentView}
        onNavigate={(action) => {
          if (action === "prev") {
            setCurrentDate((prev) => {
              const newDate = new Date(prev);
              newDate.setMonth(newDate.getMonth() - 1);
              return newDate;
            });
          } else if (action === "next") {
            setCurrentDate((prev) => {
              const newDate = new Date(prev);
              newDate.setMonth(newDate.getMonth() + 1);
              return newDate;
            });
          } else if (action === "TODAY") {
            setCurrentDate(new Date());
          }
        }}
        onView={(view) => {
          if (view === "list") {
            setCurrentView("list");
          } else {
            setCurrentView(view);
          }
        }}
        setCurrentView={setCurrentView}
      />

      {/* Appointment Summary Boxes */}
      <div className='mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {appointmentBoxes.map((box) => (
          <div
            key={box.id}
            className='flex-btn gap-4 rounded-xl border border-border bg-white p-4'
          >
            <div className='w-3/4'>
              <h2 className='text-md font-medium'>{box.title}</h2>

              <h2 className='font-small my-3 text-sm'>{box.value}</h2>

              <p className='text-xs'>
                Total Appointments{" "}
                <span className={`${box.color[1]} font-bold`}>{box.value}</span>{" "}
                {box.title === "Today Appointments"
                  ? "today"
                  : box.title === "Monthly Appointments"
                    ? "this month"
                    : "this year"}
              </p>
            </div>

            <div
              className={`flex-colo text-md h-10 w-10 rounded-full text-white ${box.color[0]}`}
            >
              <box.icon className='text-xl' />
            </div>
          </div>
        ))}
      </div>

      <div className='mb-12 mt-8 h-[550px] sm:h-[600px] lg:h-[900px]'>
        {currentView === "list" ? (
          <CalendarTable
            data={transformedEvents}
            onSelectEvent={handleEventClick}
          />
        ) : (
          <Calendar
            localizer={localizer}
            events={transformedEvents}
            startAccessor='start'
            endAccessor='end'
            style={{ height: "100%", marginBottom: 50 }}
            onSelectEvent={handleEventClick}
            date={currentDate}
            view={currentView}
            timeslots={1}
            resizable
            step={60}
            selectable={true}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: "#66B5A3",
                borderRadius: "10px",
                color: "white",
                border: "1px solid #F2FAF8",
                fontSize: "12px",
                padding: "5px 5px",
              },
            })}
            dayPropGetter={() => ({ style: { backgroundColor: "white" } })}
            views={["month", "day", "week"]}
            components={{
              toolbar: () => null, // Hide the default toolbar since we have our own
            }}
            onRangeChange={handleRangeChange}
            onNavigate={(action) => {
              if (action === "prev") {
                setCurrentDate((prev) => {
                  const newDate = new Date(prev);
                  newDate.setMonth(newDate.getMonth() - 1);
                  return newDate;
                });
              } else if (action === "next") {
                setCurrentDate((prev) => {
                  const newDate = new Date(prev);
                  newDate.setMonth(newDate.getMonth() + 1);
                  return newDate;
                });
              } else if (action === "TODAY") {
                setCurrentDate(new Date());
              }
            }}
            onView={(view) => {
              setCurrentView(view);
            }}
          />
        )}
      </div>

      {/* Create Patient Modal */}
      <Modal
        isOpen={isAddPatientModalOpen}
        closeModal={() => setIsAddPatientModalOpen(false)}
        title='Add New Patient'
      >
        <CreatePatient
          closeModal={() => setIsAddPatientModalOpen(false)}
          onSuccess={(newPatient) => {
            // Patient created successfully - refresh patient list so new patient appears immediately
            setSearch("");
            setIsAddPatientModalOpen(false);
            fetchPatients(); // replaced wrong call (fetAppointments) with fetchPatients
          }}
        />
      </Modal>
    </Layout>
  );
}

export default Appointments;
