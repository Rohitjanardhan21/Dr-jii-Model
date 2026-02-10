import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import { sortsDatas } from "../../components/Datas";
import { useNavigate } from "react-router-dom";
import { BiChevronDown, BiTime, BiSearch, BiX } from "react-icons/bi";
import { BsCalendarMonth } from "react-icons/bs";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { RiFileDownloadLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { FromToDate, Select } from "../../components/Form";
import { PatientTable } from "../../components/Tables";
import CreatePatient from "./CreatePatient";
import Modal from "../../components/Modals/Modal";
import PageAction from "../../components/PageAction";

function Patients() {
  const [status, setStatus] = useState(
    sortsDatas.filterPatient[0].name || "All"
  );
  const [gender, setGender] = useState(
    sortsDatas.genderFilter[0].name || "All"
  );
  const [appointData, setAppointData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [search, setSearch] = useState("");
  const [patientStats, setPatientStats] = useState({
    todayTotal: 0,
    monthTotal: 0,
    yearTotal: 0,
  });

  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // Destructure dateRange into startDate and endDate
  const [startDate, endDate] = dateRange;

  // filter patients based on search input
  const filteredPatients = appointData?.filter((patient) =>
    patient.title.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients`,
        { credentials: "include" }
      );
      const json = await res.json();
      setAppointData(json);
    } catch (e) {
      console.error("Error fetching patients:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPatients = async () => {
    try {
      const params = new URLSearchParams();

      if (search?.trim()) params.append("search", search.trim());
      if (gender && gender !== "Gender" && gender !== "All") {
        params.append("gender", gender);
      }

      if (status) {
        if (status === "Newest Patients") params.append("sortBy", "newest");
        else if (status === "Oldest Patients")
          params.append("sortBy", "oldest");
      }

      if (startDate && endDate) {
        const fromDateISO = new Date(startDate);
        fromDateISO.setHours(0, 0, 0, 0);
        const toDateISO = new Date(endDate);
        toDateISO.setHours(23, 59, 59, 999);
        params.append("fromDate", fromDateISO.toISOString());
        params.append("toDate", toDateISO.toISOString());
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients/filter?${params.toString()}`,
        { credentials: "include" }
      );

      const data = await response.json();
      setAppointData(data);
    } catch (error) {
      console.error("Error fetching filtered patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients/stats`,
          { credentials: "include" }
        );
        const data = await res.json();
        setPatientStats(data);
      } catch (error) {
        console.error("Error fetching patient stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    fetchFilteredPatients();
  }, []);

  // Auto-refresh patients when filters change (debounced)
  useEffect(() => {
    const debounceId = setTimeout(() => {
      fetchFilteredPatients();
    }, 350);
    return () => clearTimeout(debounceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, gender, status, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for action event from header ActionButton
  useEffect(() => {
    const handleAddPatientAction = () => {
      setIsAddPatientModalOpen(true);
    };

    window.addEventListener("action:addPatient", handleAddPatientAction);
    return () => {
      window.removeEventListener("action:addPatient", handleAddPatientAction);
    };
  }, []);

  //   useEffect(() => {
  //   if (isPopupOpen) {
  //     document.body.style.overflow = "hidden"; // 🟩 Lock scroll
  //   } else {
  //     document.body.style.overflow = "auto";   // 🟩 Restore scroll
  //   }
  // }, [isPopupOpen]);

  const sorts = [
    {
      id: 2,
      selected: status,
      setSelected: setStatus,
      datas: sortsDatas.filterPatient,
    },
    {
      id: 3,
      selected: gender,
      setSelected: setGender,
      datas: sortsDatas.genderFilter,
    },
  ];

  const boxes = [
    {
      id: 1,
      title: "Today Patients",
      value: patientStats?.todayTotal,
      color: ["bg-subMain", "text-subMain"],
      icon: BiTime,
    },
    {
      id: 2,
      title: "Monthly Patients",
      value: patientStats?.monthTotal,
      color: ["bg-pink-500", "text-pink-500"],
      icon: BsCalendarMonth,
    },
    {
      id: 3,
      title: "Yearly Patients",
      value: patientStats?.yearTotal,
      color: ["bg-green-500", "text-green-500"],
      icon: MdOutlineCalendarMonth,
    },
  ];

  const handleExportCSV = async () => {
    try {
      if (!appointData || appointData.length === 0) {
        toast.error("No data to export");
        return;
      }

      toast.loading(
        "Preparing comprehensive export... This may take a moment."
      );

      // Fetch all additional data for each patient
      const patientsWithFullData = await Promise.all(
        appointData.map(async (patient) => {
          const patientId = patient._id || patient.userId?._id;

          try {
            // Fetch medical records
            const medicalRecordsRes = await fetch(
              `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-records/${patientId}`,
              { credentials: "include" }
            );
            const medicalRecordsData = medicalRecordsRes.ok
              ? await medicalRecordsRes.json()
              : { data: [] };
            const medicalRecords = medicalRecordsData.data || [];

            // Fetch appointments
            const appointmentsRes = await fetch(
              `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/user/appointments?userId=${patientId}`,
              { credentials: "include" }
            );
            const appointments = appointmentsRes.ok
              ? await appointmentsRes.json()
              : [];

            // Fetch payments
            const paymentsRes = await fetch(
              `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/payments/${patientId}`,
              { credentials: "include" }
            );
            const payments = paymentsRes.ok ? await paymentsRes.json() : [];

            return {
              patient,
              medicalRecords,
              appointments,
              payments,
            };
          } catch (error) {
            console.error(
              `Error fetching data for patient ${patientId}:`,
              error
            );
            return {
              patient,
              medicalRecords: [],
              appointments: [],
              payments: [],
            };
          }
        })
      );

      toast.dismiss();
      toast.loading("Generating CSV file...");

      // Create comprehensive CSV rows
      const csvRows = [];

      // Main headers for patient info
      const mainHeaders = [
        "Patient ID",
        "Patient Name",
        "Email",
        "Phone",
        "Gender",
        "Age",
        "Blood Group",
        "UHID",
        "Address",
        "Date Registered",
        "Total Appointments",
        "Medical Records Count",
        "Appointments Count",
        "Payments Count",
        "Total Payments Amount",
      ];

      // Medical Records Headers
      const medicalRecordHeaders = [
        "Medical Record Date",
        "Medical Record Complaints",
        "Medical Record Symptoms",
        "Medical Record Diagnosis",
        "Medical Record Medications",
        "Medical Record Notes",
        "Medical Record Follow Up",
      ];

      // Appointment Headers
      const appointmentHeaders = [
        "Appointment Date",
        "Appointment Time",
        "Appointment Status",
        "Appointment Purpose",
        "Appointment Description",
      ];

      // Payment Headers
      const paymentHeaders = [
        "Payment Date",
        "Payment Amount",
        "Payment Status",
        "Payment Method",
        "Payment Description",
      ];

      // Combine all headers
      const allHeaders = [
        ...mainHeaders,
        ...medicalRecordHeaders,
        ...appointmentHeaders,
        ...paymentHeaders,
      ];

      csvRows.push(allHeaders.join(","));

      // Process each patient
      patientsWithFullData.forEach(
        ({ patient, medicalRecords, appointments, payments }) => {
          const maxRows = Math.max(
            medicalRecords.length,
            appointments.length,
            payments.length,
            1 // At least one row for patient info
          );

          // Calculate total payment amount
          const totalPaymentAmount = payments.reduce((sum, payment) => {
            return sum + (parseFloat(payment.amount) || 0);
          }, 0);

          // Create rows for this patient
          for (let i = 0; i < maxRows; i++) {
            const medicalRecord = medicalRecords[i] || {};
            const appointment = appointments[i] || {};
            const payment = payments[i] || {};

            // Format medical record data
            const recordComplaints =
              medicalRecord.complaints?.map((c) => c.name).join("; ") || "";
            const recordSymptoms =
              medicalRecord.symptoms?.map((s) => s.name).join("; ") || "";
            const recordDiagnosis =
              medicalRecord.diagnosis?.map((d) => d.name).join("; ") || "";
            const recordMedications =
              medicalRecord.medications?.map((m) => m.name).join("; ") || "";
            const recordNotes = medicalRecord.notesForPatient || "";
            const recordFollowUp = medicalRecord.followUp?.date || "";

            // Format appointment data
            const appointmentDate = appointment.dateOfVisit || "";
            const appointmentTime =
              appointment.startTime && appointment.endTime
                ? `${new Date(appointment.startTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}`
                : "";
            const appointmentStatus = appointment.status || "";
            const appointmentPurpose = appointment.purposeOfVisit || "";
            const appointmentDescription = appointment.description || "";

            // Format payment data
            const paymentDate = payment.createdAt
              ? new Date(payment.createdAt).toLocaleDateString()
              : "";
            const paymentAmount = payment.amount || "";
            const paymentStatus = payment.status || "";
            const paymentMethod = payment.paymentMethod || "";
            const paymentDescription =
              payment.description || payment.notes || "";

            const row = [
              // Patient Info (repeated for each row)
              patient._id || "",
              patient.title || patient.fullName || "",
              patient.email || "",
              patient.phone || patient.contactDetails?.primaryContact || "",
              patient.gender || "",
              patient.age || "",
              patient.blood || "",
              patient.uhid || "",
              patient.address || "",
              patient.date || "",
              patient.totalAppointments || appointments.length || "",
              medicalRecords.length,
              appointments.length,
              payments.length,
              totalPaymentAmount.toFixed(2),
              // Medical Record (only in first row or when record exists)
              i === 0 || medicalRecord
                ? medicalRecord.createdAt
                  ? new Date(medicalRecord.createdAt).toLocaleDateString()
                  : ""
                : "",
              i === 0 || medicalRecord ? recordComplaints : "",
              i === 0 || medicalRecord ? recordSymptoms : "",
              i === 0 || medicalRecord ? recordDiagnosis : "",
              i === 0 || medicalRecord ? recordMedications : "",
              i === 0 || medicalRecord ? recordNotes : "",
              i === 0 || medicalRecord ? recordFollowUp : "",
              // Appointment (only when appointment exists)
              appointment ? appointmentDate : "",
              appointment ? appointmentTime : "",
              appointment ? appointmentStatus : "",
              appointment ? appointmentPurpose : "",
              appointment ? appointmentDescription : "",
              // Payment (only when payment exists)
              payment ? paymentDate : "",
              payment ? paymentAmount : "",
              payment ? paymentStatus : "",
              payment ? paymentMethod : "",
              payment ? paymentDescription : "",
            ];

            // Escape commas and quotes in data
            const escapedRow = row.map((field) => {
              const fieldStr = String(field || "");
              if (
                fieldStr.includes(",") ||
                fieldStr.includes('"') ||
                fieldStr.includes("\n")
              ) {
                return `"${fieldStr.replace(/"/g, '""')}"`;
              }
              return fieldStr;
            });

            csvRows.push(escapedRow.join(","));
          }

          // Add empty row between patients for readability
          csvRows.push("");
        }
      );

      // Create CSV content
      const csvContent = csvRows.join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Generate filename with current date
      const date = new Date().toISOString().split("T")[0];
      link.setAttribute(
        "download",
        `patients_comprehensive_export_${date}.csv`
      );

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(
        `Exported ${appointData.length} patients with all data to CSV`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss();
      toast.error("Failed to export data");
    }
  };

  const previewPayment = (id) => {
    navigate(`/patients/preview/${id}`);
  };

  return (
    <Layout>
      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <Modal
          isOpen={isAddPatientModalOpen}
          closeModal={() => setIsAddPatientModalOpen(false)}
          title='Add Patient'
          width='max-w-4xl'
          showCloseButton={false}
        >
          <CreatePatient
            closeModal={() => setIsAddPatientModalOpen(false)}
            onSuccess={(patientData) => {
              fetchData(); // Refresh the patient list
              setIsAddPatientModalOpen(false);
            }}
          />
        </Modal>
      )}

      <div className='relative mb-6 grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
        {/* Search Input */}
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        
      </div>

      <div className="mb-4 mt-8 flex items-center justify-between">
        <input
          type="text"
          placeholder='Search "Patients"'
          className="h-11 rounded-md border border-border bg-dry px-4 text-sm text-main md:col-span-2 lg:col-span-3"
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

        {/* Dropdown */}
        {showDropdown && search && (
          <ul className='absolute top-16 z-10 w-full max-w-xs rounded-md border border-gray-200 bg-white shadow-md md:col-span-2 lg:col-span-3'>
            {filteredPatients.length > 0 &&
              filteredPatients.map((patient, idx) => (
                <li
                  key={idx}
                  className='flex cursor-pointer flex-row items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearch(patient.title);
                    setShowDropdown(false);
                    navigate(`/patients/preview/${patient._id}`);
                  }}
                >
                  {/* Patient Image */}
                  <img
                    src={patient?.image}
                    alt='Patient'
                    className='h-10 w-10 rounded-full border border-subMain object-cover'
                  />

                  {/* Patient Info */}
                  <div className='flex flex-col'>
                    <h2 className='text-sm font-semibold'>{patient?.title}</h2>
                    <p className='text-xs text-textGray'>{patient?.email}</p>
                    <p className='text-xs'>{patient?.phone}</p>
                  </div>
                </li>
              ))}

            {/* Show "Add Patient" if no match */}
            {filteredPatients.length === 0 && (
              <li
                className='flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-main hover:bg-gray-100'
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsAddPatientModalOpen(true); // open add patient modal
                }}
              >
                <span className='text-xl font-bold'>+</span>
                <span>Add "{search}" as new patient</span>
              </li>
            )}
          </ul>
        )}
        <div className="flex items-center gap-3">
          <PageAction onActionClick={() => setIsAddPatientModalOpen(true)} />
          <button
            onClick={handleExportCSV}
            className='flex items-center gap-2 rounded-lg border border-subMain bg-white px-4 py-2 text-sm text-subMain transition-colors hover:bg-subMain hover:text-white'
          >
            <RiFileDownloadLine /> Export CSV
          </button>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {boxes.map((box) => (
          <div
            key={box.id}
            className='flex-btn gap-4 rounded-xl border-[1px] border-border bg-white p-4'
          >
            <div className='w-3/4'>
              <h2 className='text-md font-medium'>{box.title}</h2>
              <h2 className='font-small my-3 text-sm'>{box.value}</h2>
              <p className='text-xs'>
                Total Patients{" "}
                <span className={`${box.color[1]} font-bold`}>{box.value}</span>{" "}
                {box.title === "Today Patients"
                  ? "today"
                  : box.title === "Monthly Patients"
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

      <div className='my-8 rounded-xl border-[1px] border-border bg-white p-5'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {sorts.map((item) => (
            <div className='w-full' key={item.id}>
              <Select
                selectedPerson={item.selected || { name: "All" }}
                setSelectedPerson={item.setSelected}
                datas={item.datas || []}
              >
                <div className='flex h-14 w-full items-center justify-between rounded-md border border-border bg-dry px-4 text-xs font-medium text-black'>
                  <p>{item.selected || "All"}</p>
                  <BiChevronDown className='text-xl' />
                </div>
              </Select>
            </div>
          ))}

          <div className='relative w-full'>
            {!startDate && !endDate && (
              <span className='pointer-events-none absolute left-4 top-4 z-10 mt-2 text-xs text-gray-400'>
                Date Range
              </span>
            )}
            <FromToDate
              startDate={startDate}
              endDate={endDate}
              bg='bg-dry'
              onChange={(update) => setDateRange(update)}
              className='w-full text-xs font-medium text-black'
            />
          </div>
        </div>

        <div className='mt-8 w-full overflow-x-scroll'>
          <PatientTable
            data={appointData}
            functions={{
              preview: previewPayment,
            }}
            used={false}
          />
        </div>
      </div>
    </Layout>
  );
}

export default Patients;
