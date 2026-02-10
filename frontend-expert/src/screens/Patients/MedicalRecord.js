import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { MdPrint } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import NewMedicalRecode from "./NewMedicalRecode";
import PrescriptionPreview from "./PrescriptionPreview";




const MedicalRecord = ({ patient }) => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showpage, setShowpage] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const printRefs = useRef([]);

  // fetching doctor details to print in header
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorLoginGet`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const result = await response.json();

        if (result.success && result.data) {
          setDoctorInfo(result.data);
        }
      } catch (error) {
        console.log("Doctor info fetch error:", error);
      }
    };

    fetchDoctorInfo();
  }, []);



  // Print only the selected record's content using window.print

  console.log("record", records);

  const triggerPrint = (index) => {
    const printContent = printRefs.current[index];
    if (!printContent) return;

    // get doctor info from localStorage
    const doctorName = doctorInfo?.fullName || "Doctor";
    const doctorId = doctorInfo?._id || "N/A";
    const doctorSpecialization = doctorInfo?.specialization || "General Physician";

    const printWindow = window.open('', '_blank', 'width=900,height=650');

    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
      alert('Popup blocked! Please allow popups for this site to print.');
      return;
    }

    printWindow.document.write(`
<html>
<head>
<title>MedicalRecord_${index + 1}</title>

<style>


body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #fff;
  margin: 0;
  padding: 0;
}

.printable-wrapper {
  background: #fff;
  max-width: 900px;
  margin: 20px auto;
  padding: 32px 40px;
  
}

.header-title {
  text-align: center;
  color: #0077b6;
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

/* -------- TOP INFO ROW -------- */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  margin-top:20px;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.left-box, .right-box {
  width: 48%;
  
  padding: 0;
  
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.left-box-title, .right-box-title {
  font-size: 16px;
  font-weight: 700;
  color: #0077b6;
  
   border: 1px solid #ffffff ;
    background: #ffffff ;
}

/* -------- CONTENT SECTIONS -------- */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0077b6;
  margin-top: 22px;
  margin-bottom: 4px;
  
}

ul {
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 15px;
}

/* -------- DIVIDER -------- */
.divider {
  margin: 18px 0;
  border-bottom: 2px solid #0077b6;
  width: 100%;
}

/* -------- SIGNATURE -------- */
.signature-area {
  margin-top: 40px;
  text-align: right;
  font-size: 14px;
}

@media print {
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    
     border: 1px solid #ffffff !important;
    background: #ffffff !important;
  }

  .printable-wrapper {
    margin: 0 !important;
    padding: 0  !important;
    border: none !important;
   
     border: 1px solid #ffffff !important;
    box-shadow: none !important;
  }

  .info-row,
  .left-box,
  .right-box {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
}

</style>
</head>

<body>

<div class="printable-wrapper">

  <h1 class="header-title">Medical Record</h1>

  <div class="info-row">
  
    <!-- LEFT SIDE PATIENT INFO -->
    <div class="left-box">
      <div class="left-box-title">Patient Details</div>
      <strong>Name:</strong> ${patient.fullName || "N/A"} <br/>
      <strong>Age/Gender:</strong> ${patient.age ? patient.age + " Yrs" : "N/A"} / ${patient.gender || "N/A"} <br/>
      <strong>Weight:</strong> ${records[index]?.vitals?.weight || "N/A"} kg <br/>
      <strong>Height:</strong> ${records[index]?.vitals?.height || "N/A"} cm <br/>
      <strong>Address:</strong> ${patient.address ? [patient.address.street, patient.address.locality, patient.address.city, patient.address.pincode].filter(Boolean).join(", ") || "N/A" : "N/A"} <br/>
      
    </div>

    <!-- RIGHT SIDE DOCTOR INFO -->
    <div class="right-box">
      <div class="right-box-title">Doctor Details</div>
     <strong>Doctor:</strong> Dr. ${doctorName.replace(/^Dr\.?\s*/i, "")} <br/>
<strong>Specializatioon:</strong> ${doctorSpecialization} <br/>
      <strong>Doctor ID:</strong> ${doctorId} <br/>
    </div>
  </div>

  <div class="divider"></div>

  <!-- PRINT DYNAMIC SECTIONS -->
  ${printContent.innerHTML}

</div>

</body>
</html>
`);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();


  };


  const handleAddNewRecord = () => {
    setShowpage(true);
    setSelectedRecord(null);
    navigate(`/patients/visiting/${patientId}`, { state: { patient } });
  };


  const handleViewRecord = (record) => {
    // Get the record ID - handle both MongoDB ObjectId formats
    const recordId = record._id?.$oid || record._id || record.id;

    if (!recordId) {
      console.error("Record ID not found");
      return;
    }

    // Navigate to prescription preview page with record data
    navigate(`/prescription/preview/${recordId}`, {
      state: {
        record,
        patient,
        patientId
      }
    });
  };



  const generateOrderFromRecord = (record) => {
    const medicines = (record.medications || []).map((m) => ({
      name: m.name,
      dosage: m.composition || "N/A",
      count: 1, // or m.quantity if available
      price: "$10.00", // dynamic pricing if available
    }));

    return {
      id: `ORD-${Math.floor(Math.random() * 10000)}`, // or use backend ID
      patient: {
        name: record.patientName || "Unknown",
        email: record.patientEmail || "unknown@example.com",
        phone: record.patientPhone || "N/A",
        avatar: record.patientAvatar || "https://randomuser.me/api/portraits/lego/1.jpg",
      },
      items: medicines,
      prescription: record.prescriptionURL || "",
      deliveryAddress: record.deliveryAddress || "Default Clinic Address",
      paymentMethod: "Pay on Delivery",
      orderDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      bill: {
        mrp: 100.00,
      },
    };
  };


  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-records/${patientId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const result = await response.json();
        if (response.ok) {
          setRecords(result.data);
        } else {
          console.error("Failed to fetch:", result.message);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [patientId]);

  console.log("records", records);


  if (loading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <AiOutlineLoading3Quarters className='animate-spin text-4xl text-subMain' />
      </div>
    );
  }

  return (
    // cards printing
    <div className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Medical Records</h2>
        <button
          onClick={handleAddNewRecord}
          className='rounded bg-[#0097DB] px-4 py-2 text-white hover:bg-[#007bb5]'
        >
          New Record +
        </button>

      </div>

      {records.length === 0 ? (
        <p className='text-gray-500'>No records found.</p>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {records.map((record, index) => (
            <div
              key={record._id.$oid || index}
              className='rounded bg-white p-4 shadow'
            >
              <h4 className='mb-2 font-semibold'>Medical Attachment</h4>
              <p className='mb-1 text-sm text-gray-500'>
                Date:{" "}
                {new Date(
                  record.createdAt?.$date || record.createdAt
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <div className='text-sm'>

                <p>
                  <strong>Symptoms:</strong>{" "}
                  {record.symptoms?.map((s) => s.name).join(", ") || "None"}
                </p>
                <p>
                  <strong>Diagnosis:</strong>{" "}
                  {record.diagnosis?.map((d) => d.name).join(", ") || "None"}
                </p>
                <p>
                  <strong>Medications:</strong>{" "}
                  {record.medications?.map((m) => m.name).join(", ") || "None"}
                </p>
                <p>
                  <strong>Prescription Details:</strong>{" "}
                  {record.medications?.map(
                    (m) =>
                      `${m.name} (${m.composition}) [${m.route || "-"}, ${m.frequency}, ${m.timing}, ${m.duration}]`
                  ).join("; ") || "None"}
                </p>
                {/* <p>
                  <strong>Notes for Patient:</strong> {record.notesForPatient}
                </p>
                <p>
                  <strong>Private Notes:</strong> {record.privateNotes}
                </p>
                <p>
                  <strong>Advices:</strong> {record.advices.join(", ")}
                </p>
                {record.followUp?.date && (
                  <>
                    <p>
                      <strong>Follow Up:</strong> {record.followUp.duration} on{" "}
                      {record.followUp.date}
                    </p>
                    <p>
                      <strong>Follow Up Notes:</strong> {record.followUp.notes}
                    </p>
                  </>
                )} */}
              </div>

              <div className='mt-2 flex gap-2'>
                <FaEye
                  className='cursor-pointer text-gray-600'
                  title='View'
                  onClick={() => handleViewRecord(record)}
                />
                <MdPrint
                  className='cursor-pointer text-gray-600'
                  title='Print'
                  onClick={() => triggerPrint(index)}
                />
              </div>
              <div className="print-content">
                <div
                  ref={(el) => (printRefs.current[index] = el)}
                  className="print-content"
                >
                  <div className="print-header">
                    {/* <h1>Medical Record</h1> */}
                    {/* <p><strong>Date:</strong> {new Date(
                      record.createdAt?.$date || record.createdAt
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    </p> */}
                  </div>

                  {record.vitals && (
                    <div className="section">
                      <div className="section-title">Vitals</div>
                      <ul>
                        {record.vitals.bloodPressure && (record.vitals.bloodPressure.systolic || record.vitals.bloodPressure.diastolic) && (
                          <li className="medication-item">• BP: {record.vitals.bloodPressure.systolic || "--"}/{record.vitals.bloodPressure.diastolic || "--"} mmHg</li>
                        )}
                        {record.vitals.pulse && (
                          <li className="medication-item">• Pulse: {record.vitals.pulse} bpm</li>
                        )}
                        {record.vitals.respiratoryRate && (
                          <li className="medication-item">• RR: {record.vitals.respiratoryRate} breaths/min</li>
                        )}
                        {record.vitals.oxygenSaturation && (
                          <li className="medication-item">• SpO2: {record.vitals.oxygenSaturation}%</li>
                        )}
                        {record.vitals.temperature && (
                          <li className="medication-item">• Temp: {record.vitals.temperature}°F</li>
                        )}
                        {record.vitals.height && (
                          <li className="medication-item">• Height: {record.vitals.height} cm</li>
                        )}
                        {record.vitals.weight && (
                          <li className="medication-item">• Weight: {record.vitals.weight} kg</li>
                        )}
                        {record.vitals.bmi && (
                          <li className="medication-item">• BMI: {record.vitals.bmi}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="section">
                    <div className="section-title">Symptoms</div>
                    <ul>
                      {record.symptoms?.map((s, i) => (
                        <li key={i} className="medication-item">{s.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="section">
                    <div className="section-title">Diagnosis</div>
                    <ul>
                      {record.diagnosis?.map((d, i) => (
                        <li key={i} className="medication-item">{d.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="section">
                    <div className="section-title">Diagnostic test</div>
                    <ul>
                      {record.diagnosisTests?.map((t, i) => (
                        <li key={i} className="medication-item">
                          {t.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="section">
                    <div className="section-title">Prescription</div>
                    <ul>
                      {record.medications?.map((m, i) => (
                        <li key={i} className="medication-item">
                          <strong>{m.name}</strong> ({m.composition}) [{m.route || "-"}] - {m.frequency}, {m.timing}, {m.duration} Days
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="signature-area">
                    <p>_________________________</p>
                    <p>Doctor's Signature</p>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>




          ))}
        </div>
      )}



      {showpage && (
        <>
          <style>{`body { overflow: hidden; }`}</style>

          <div className='fixed inset-0 z-50 flex items-center justify-center mt-[30%] bg-opacity-50  '>

            <div className='relative h-[90vh]  max-w-6xl  rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-xl'>
              {/* Close button */}
              <button
                onClick={() => {
                  setShowpage(false);
                  document.body.style.overflow = "auto";
                }}
                className='absolute right-5 top-5 text-3xl font-bold text-gray-300 transition hover:text-red-500'
              >

              </button>

              {/* Header */}
              <div className='mb-6 border-b border-gray-200 pb-3'>
                <h2 className='text-2xl font-semibold text-gray-800'>
                  Medical Record
                </h2>

              </div>

              {/* Medical Record Form Component */}
              <div className='space-y-6'>
                <NewMedicalRecode record={selectedRecord} />
                {/* <PrescriptionPreview /> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalRecord;