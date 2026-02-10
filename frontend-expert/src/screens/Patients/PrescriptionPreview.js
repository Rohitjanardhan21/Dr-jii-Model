import React, { useState, useEffect } from "react";
import {
  downloadInvoicePDF,
  generateInvoicePDFBlob,
} from "../../utils/invoiceUtils";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import ShareModal from "../../components/Modals/ShareModal";
import PrintSettingsModal from "../../components/Modals/PrintSettingsModal";
import { loadPrintSettings, savePrintSettings, applyPrintSettingsToDOM } from "../../utils/printSettingsUtils";

const PrescriptionPreview = ({
  patient,
  doctor,
  complaints,
  vitals,
  symptoms,
  diagnosis,
  diagnosisTests,
  medications,
  advices,
  followUp,
  notesForPatient,
  privateNotes,
  treatmentType,
  onBack,
  onSaveTemplate,
  onAction,
}) => {
  const [templateOption, setTemplateOption] = useState("new");
  const [templateName, setTemplateName] = useState("");
  const [sharePDF, setSharePDF] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState(loadPrintSettings());
  const navigate = useNavigate();

  useEffect(() => {
    const settings = loadPrintSettings();
    setPrintSettings(settings);
  }, []);

  const handleApplyPrintSettings = (newSettings) => {
    setPrintSettings(newSettings);
    savePrintSettings(newSettings);
    toast.success("Print settings updated successfully!");
  };

  const handleAction = (action) => {
    if (action === "Print") {
      handlePrint();
      return;
    } else if (action === "Download") {
      handleDownload();
      return;
    } else if (onAction) {
      onAction(action);
    } else {
      alert(`${action} clicked`);
    }
  };

  //Doctor Info
  // const { doctor } = useDoctorAuthStore();
  console.log("doctor:", doctor);

  const handleDownload = () => {
    if (!rightPrintRef.current) return;

    const clone = rightPrintRef.current.cloneNode(true);
    const filteredClone = applyPrintSettingsToDOM(clone, printSettings);

    downloadInvoicePDF(
      filteredClone,
      `prescription_${patient?.uhid || "preview"}.pdf`,
      () => toast.loading("Download starting..."),
      () => {
        toast.dismiss();
        toast.success("Successfully downloaded!");
      }
    );
  };

  const handleSaveTemplate = () => {
    if (onSaveTemplate) {
      onSaveTemplate(templateOption, templateName);
    }
  };

  // console.log("doctor", doctor);
  // console.log("patient", patient);
  // console.log("vitals", vitals);
  // console.log("complaints", complaints);
  // console.log("symptoms", symptoms);
  // console.log("diagnosis", diagnosis);
  // console.log("medications", medications);
  // console.log("advices", advices);
  // console.log("followUp", followUp);

  const rightPrintRef = React.useRef();
  const handlePrint = () => {
    const printContent = rightPrintRef.current;
    if (!printContent) return;

    const clone = printContent.cloneNode(true);
    const filteredClone = applyPrintSettingsToDOM(clone, printSettings);

    const printWindow = window.open("", "_blank", "width=900,height=650");

    const htmlContent = `
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; margin: 0; padding: 0; }
            .printable-wrapper { background: #fff; max-width: 700px; margin: 30px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 40px 32px 32px 32px; border: 1px solid #e0e7ef; }
            .print-header { border-bottom: 2px solid #0097DB; padding-bottom: 12px; margin-bottom: 24px; text-align: center; }
            .print-header h1 { color: #0097DB; margin: 0 0 6px 0; font-size: 2.1em; letter-spacing: 1px; }
            .print-header p { margin: 0; font-size: 1.1em; color: #333; }
            .section { margin-bottom: 22px; }
            .section-title { font-size: 1.15em; color: #0097DB; margin-bottom: 8px; font-weight: 600; border-left: 4px solid #0097DB; padding-left: 8px; }
            ul { list-style: none; padding-left: 0; margin: 0; }
            .medication-item { margin-bottom: 4px; font-size: 1em; color: #222; }
            .signature-area { margin-top: 40px; text-align: right; color: #444; }
            .signature-area p { margin: 0; font-size: 1em; }
            .clinic-logo { text-align: left; margin-bottom: 12px; }
            .clinic-logo h1 { color: #0097DB; font-size: 2em; margin: 0; }
            .doctor-details { margin-bottom: 12px; }
            .doctor-details p { margin: 0; font-size: 1em; color: #222; }
            .patient-details { margin-bottom: 12px; }
            .patient-details p { margin: 0; font-size: 1em; color: #222; }
            .medications-list { margin-bottom: 18px; }
            .advice-list { margin-bottom: 18px; }
            .followup-section { margin-bottom: 18px; }
            p { margin: 0; line-height: 1.2; }
            .medications-list p { margin-bottom: 2px; }
            .medications-list div { margin-bottom: 6px; }
            .print-checkbox-container { display: none !important; }
            @media print { body { background: #fff; } .printable-wrapper { box-shadow: none; border: none; } .print-checkbox-container { display: none !important; } }
          </style>
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            });
          </script>
        </head>
        <body>
          <div class="printable-wrapper">
            ${filteredClone.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleShareClick = async () => {
    if (!rightPrintRef.current) {
      toast.error("Nothing to share!");
      return;
    }

    toast.loading("Preparing PDF...");
    try {
      const clone = rightPrintRef.current.cloneNode(true);
      const filteredClone = applyPrintSettingsToDOM(clone, printSettings);

      const pdfBlob = await generateInvoicePDFBlob(filteredClone);

      if (!pdfBlob) {
        toast.dismiss();
        toast.error("Failed to generate PDF");
        return;
      }

      setSharePDF(pdfBlob);
      setIsShareOpen(true);
      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 px-4 py-8'>
      <div className='mb-2 flex items-center gap-4'>
        <button
          onClick={onBack}
          className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
        >
          <IoArrowBackOutline />
        </button>
        <h1 className='text-xl font-semibold'>Preview Prescription</h1>
      </div>
      <div className='mx-auto w-full max-w-7xl rounded-xl bg-white p-6 shadow-lg'>
        {/* Header inside box */}
        <div className='flex items-center gap-4 border-b p-4'>
          {/* <button
            className='rounded-full bg-black p-2 text-white'
            onClick={onBack}
          >
            <ArrowLeft size={16} />
          </button> */}
          <div className='flex items-center gap-2'>
            <span className='text-2xl text-indigo-500'>👤</span>
            <div>
              <p className='text-lg font-bold'>
                {doctor?.fullName || "Doctor Name"}
              </p>
              <p className='text-sm'>
                {doctor?.qualificationDetails?.degreeName || "MBBS/MD"} ·{" "}
                {Array.isArray(doctor?.systemOfMedicine?.systemOfMedicine)
                  ? doctor.systemOfMedicine.systemOfMedicine.join(", ")
                  : doctor?.systemOfMedicine?.systemOfMedicine || "General Physician"}
              </p>
              <p className='text-sm text-gray-600'>
                {doctor?.addressPerKyc?.address || "Clinic Address"},{" "}
                {doctor?.addressPerKyc?.pincode || ""}
              </p>
              {doctor?.mobileNumber && (
                <p className='text-sm text-gray-600'>
                  Contact: {doctor.mobileNumber}
                </p>
              )}
            </div>
          </div>
          <div className='ml-auto rounded bg-green-100 p-2'>
            <span className='text-green-700' onClick={handlePrint}>
              📹
            </span>
          </div>
        </div>

        {/* <div className='grid grid-cols-2 gap-6 py-6'> */}
        <div className='gap-6 py-6'>
          {/* Left Half */}
          {/* <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow w-full max-w-md space-y-6 border border-[#00BCD4]">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>💬</span>
                <span className="font-medium">Prescription Saved Successfully.</span>
                <span className="text-[#00BCD4] font-medium">
                  {doctor?.mobileNumber || "+91 N/A"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Send Attachment",
                  "Print",
                  "Download",
                  "Send Via Own Whatsapp",
                  "Send Payment Link",
                  "Bill Patient",
                  "Send Google Review Link",
                  "Request Vitals",
                ].map((label, index) => (
                  <button
                    key={index}
                    className="bg-[#00BCD4] text-white px-4 py-2 rounded-full text-sm hover:bg-[#00a2bc] transition-colors"
                    onClick={() => handleAction(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="pt-4 text-center">
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    onClick={() => setTemplateOption("new")}
                    className={`text-sm font-medium pb-1 border-b-2 transition-all ${
                      templateOption === "new"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    New Template
                  </button>
                  <button
                    onClick={() => setTemplateOption("update")}
                    className={`text-sm font-medium pb-1 border-b-2 transition-all ${
                      templateOption === "update"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    Update existing Template
                  </button>
                </div>
                <div className="flex gap-2 justify-center">
                  <input
                    type="text"
                    placeholder="Template name"
                    className="border px-2 py-1 w-64 rounded"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                  <button
                    className="bg-[#00BCD4] text-white px-4 py-2 rounded"
                    onClick={handleSaveTemplate}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div> */}

          {/* Right Half (Printable) */}
          <div className='ml-10 max-w-3xl' ref={rightPrintRef}>
            <div className='mb-6 border-b pb-4 relative' data-section="patientDetails">
              <h2 className='mb-3 text-base font-semibold text-gray-800'>
                Patient Details
              </h2>
              <p className='mb-1 text-sm text-gray-700'>
                {patient?.fullName || "Patient"}
                {patient?.gender && (
                  <span data-patient-field="gender"> ({patient.gender})</span>
                )}
                {patient?.age && (
                  <span data-patient-field="age">, Age: {patient.age}</span>
                )}
              </p>
              {patient?.contactDetails &&
                (patient.contactDetails?.primaryContact ||
                  patient.contactDetails?.secondaryContact ||
                  patient.contactDetails?.landline) && (
                  <p className='mb-1 text-sm text-gray-700' data-patient-field="mobileNumber">
                    Contact:{" "}
                    {patient.contactDetails.primaryContact ||
                      patient.contactDetails.secondaryContact ||
                      patient.contactDetails.landline}
                  </p>
                )}
              {patient?.uhid && (
                <p className='text-sm text-gray-700' data-patient-field="uhid">
                  UHID: {patient.uhid}
                </p>
              )}
              {patient?.address && typeof patient.address === 'object' && (
                <p className='text-sm text-gray-700' data-patient-field="address">
                  Address: {[patient.address.street, patient.address.locality, patient.address.city, patient.address.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              {patient?.address && typeof patient.address === 'string' && (
                <p className='text-sm text-gray-700' data-patient-field="address">
                  Address: {patient.address}
                </p>
              )}
              {patient?.address?.city && (
                <p className='text-sm text-gray-700' data-patient-field="city">
                  City: {patient.address.city}
                </p>
              )}
              {patient?.city && typeof patient.city === 'string' && (
                <p className='text-sm text-gray-700' data-patient-field="city">
                  City: {patient.city}
                </p>
              )}
              {patient?.address?.pincode && (
                <p className='text-sm text-gray-700' data-patient-field="pincode">
                  Pincode: {patient.address.pincode}
                </p>
              )}
              {patient?.pincode && typeof patient.pincode === 'string' && (
                <p className='text-sm text-gray-700' data-patient-field="pincode">
                  Pincode: {patient.pincode}
                </p>
              )}
              {patient?.email && (
                <p className='text-sm text-gray-700' data-patient-field="mailId">
                  Email: {patient.email}
                </p>
              )}

              {vitals && (vitals.height || vitals.weight) && (
                <p className='text-sm text-gray-700 mt-2' data-patient-field="biometrics">
                  {vitals.height && <span>Height: {vitals.height} cm </span>}
                  {vitals.height && vitals.weight && <span> | </span>}
                  {vitals.weight && <span>Weight: {vitals.weight} kg</span>}
                </p>
              )}
            </div>

            {vitals && (vitals.temperature || vitals.height || vitals.bmi || vitals.weight || vitals.sys || vitals.dia || (vitals.bloodPressure && (vitals.bloodPressure.systolic || vitals.bloodPressure.diastolic)) || vitals.pulse || vitals.respiratoryRate || vitals.oxygenSaturation) && (
              <div className='mb-6 border-b pb-4 relative' data-section="vitals">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Vitals
                </h2>
                {vitals.temperature && (
                  <p className='mb-1 text-sm text-gray-700'>
                    Temperature: {vitals.temperature}°F
                  </p>
                )}

                {vitals.bmi && (
                  <p className='mb-1 text-sm text-gray-700'>
                    BMI: {vitals.bmi} kg/m²
                  </p>
                )}

                {(vitals.sys || vitals.dia || (vitals.bloodPressure && (vitals.bloodPressure.systolic || vitals.bloodPressure.diastolic))) && (
                  <p className='text-sm text-gray-700'>
                    BP: {vitals.sys || vitals.bloodPressure?.systolic}/{vitals.dia || vitals.bloodPressure?.diastolic} mmHg
                  </p>
                )}

                {vitals?.pulse && (
                  <p className='text-sm text-gray-700'>
                    Pulse: {vitals.pulse} bpm
                  </p>
                )}

                {vitals?.respiratoryRate && (
                  <p className='text-sm text-gray-700'>
                    RR: {vitals.respiratoryRate} breaths/min
                  </p>
                )}

                {vitals?.oxygenSaturation && (
                  <p className='text-sm text-gray-700'>
                    SpO2: {vitals.oxygenSaturation}%
                  </p>
                )}
              </div>
            )}

            {/* Complains Section */}
            {/* {complaints && complaints.length > 0 && (
              <div className='mb-6 border-b pb-4 relative' data-section="complains">
                <div className='print-checkbox-container absolute right-0 top-0'>
                  <input
                    type="checkbox"
                    checked={selectedSections.complains}
                    onChange={() => toggleSection('complains')}
                    className='h-4 w-4 cursor-pointer'
                  />
                </div>
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Complains
                </h2>
                <p className='text-sm text-gray-700'>
                  {complaints.map((c) => c.name).join(", ")}
                </p>
              </div>
            )} */}

            {symptoms && symptoms.length > 0 && (
              <div className='mb-6 border-b pb-4 relative' data-section="symptoms">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Symptoms
                </h2>
                <p className='text-sm text-gray-700'>
                  {symptoms.map((s) => s.name).join(", ")}
                </p>
              </div>
            )}

            {diagnosis && diagnosis.length > 0 && (
              <div className='mb-6 border-b pb-4 relative' data-section="diagnosis">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Diagnosis
                </h2>
                <ul className='list-inside list-disc text-sm text-gray-700'>
                  {diagnosis.map((diag, index) => (
                    <li key={index} className='mb-1'>{diag.name}</li>
                  ))}
                </ul>
              </div>
            )}


            {diagnosisTests && diagnosisTests.length > 0 && (
              <div className='mb-6 border-b pb-4 relative' data-section="diagnosisTests">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Diagnosis Tests
                </h2>
                <ul className='list-inside list-disc text-sm text-gray-700'>
                  {diagnosisTests.map((test, index) => (
                    <li key={index} className='mb-1'>
                      {test.name}
                      {test.price && (
                        <span className='text-gray-500'> — ₹{test.price}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {medications && medications.length > 0 && (
              <div className='mb-6 border-b pb-4 relative' data-section="medications">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Medications
                </h2>
                {medications.map((med, index) => (
                  <div key={index} className='mb-2'>
                    <p className='text-sm text-gray-700' data-medication-field="genericName">
                      {index + 1}. {med.name}
                    </p>
                    {med.route && (
                      <p className='text-sm text-gray-600 ml-4' data-medication-field="route">
                        Route: {med.route}
                      </p>
                    )}
                    {med.composition && (
                      <p className='text-sm text-gray-600 ml-4' data-medication-field="composition">
                        {med.composition}
                      </p>
                    )}
                    <p className='text-sm text-gray-700 ml-4'>
                      <span data-medication-field="frequency">
                        <strong>Frequency:</strong> {med.frequency || "N/A"}
                      </span> ·
                      <span data-medication-field="timing">
                        <strong> Timing:</strong> {med.timing || "N/A"}
                      </span> ·
                      <span data-medication-field="duration">
                        <strong> Duration:</strong> {med.duration || "N/A"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {notesForPatient && (
              <div className='mb-6 border-b pb-4 relative' data-section="notes">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Notes
                </h2>
                <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                  {notesForPatient}
                </p>
              </div>
            )}

            {advices?.some((advice) => advice.isChecked) && (
              <div className='mb-6 border-b pb-4 relative' data-section="advice">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Advice
                </h2>
                <ul className='list-inside list-disc text-sm text-gray-700'>
                  {advices
                    .filter((advice) => advice.isChecked)
                    .map((advice, index) => (
                      <li key={index} className='mb-1'>{advice.text}</li>
                    ))}
                </ul>
              </div>
            )}

            {(followUp?.date || followUp?.notes) && (
              <div className='mb-6 border-b pb-4 relative' data-section="followUp">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Follow Up
                </h2>
                {followUp?.date && (
                  <p className='mb-1 text-sm text-gray-700'>
                    Visit on {followUp.date}
                  </p>
                )}
                {followUp?.notes && (
                  <p className='text-sm text-gray-700'>
                    Notes: {followUp.notes}
                  </p>
                )}
              </div>
            )}

            {treatmentType && (
              <div className='mb-6 border-b pb-4 relative' data-section="treatment">
                <h2 className='mb-3 text-base font-semibold text-gray-800'>
                  Treatment
                </h2>
                <p className='text-sm text-gray-700'>
                  {treatmentType}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <p className='mt-4 text-right text-xs text-gray-400'>
              {new Date().toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* <div className='ml-10' ref={rightPrintRef}>
            <div className='clinic-logo'>
              <h1>avijo</h1>
            </div>
            <div className='doctor-details'>
              <p className='font-bold'>{doctor?.fullName || "Doctor Name"}</p>
              <p className='text-xs'>
                {doctor?.qualificationDetails?.degreeName || "MBBS/MD"} ·{" "}
                {doctor?.systemOfMedicine?.systemOfMedicine ||
                  "General Physician"}
              </p>
              <p className='text-xs'>
                {doctor?.addressPerKyc.address || "Clinic Address"},{" "}
                {doctor?.addressPerKyc.pincode || "N/A"}
              </p>
            </div>
            <div className='patient-details'>
              <p>
                <strong>{patient?.fullName || "Patient"}</strong>{" "}
                {patient?.gender || "N/A"}, {patient?.age || "N/A"} year(s),{" "}
                {patient?.contactDetails.primaryContact ||
                  patient?.contactDetails.secondaryContact ||
                  patient?.contactDetails.landline ||
                  "N/A"}
              </p>
              <p>
                <strong>UHID</strong> {patient?.uhid || "N/A"}
              </p>
              <p>
                <strong>Chief Complaints</strong>{" "}
                {complaints?.length > 0
                  ? complaints
                      .map((c) => `${c.name} (Since ${c.since || "N/A"})`)
                      .join(", ")
                  : "None"}
              </p>
              <p>
                <strong>Symptoms</strong>{" "}
                {symptoms?.length > 0
                  ? symptoms
                      .map(
                        (s) => `${s.name} (Severity: ${s.severity || "N/A"})`
                      )
                      .join(", ")
                  : "None"}
              </p>
              <p>
                <strong>Diagnosis</strong>{" "}
                {diagnosis?.length > 0
                  ? diagnosis.map((d) => d.name).join(", ")
                  : "None"}
              </p>
              <p className='text-right text-xs text-gray-400'>
                {new Date().toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className='medications-list'>
              <h4 className='mb-2 font-semibold'>Medications</h4>
              {medications?.length > 0 ? (
                medications.map((med, index) => (
                  <div key={index} className='mb-2 border-b pb-2'>
                    <p className='font-medium'>
                      {index + 1}. {med.name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {med.composition || "N/A"}
                    </p>
                    <p className='text-xs'>
                      Frequency: {med.frequency || "N/A"} ·{" "}
                      {med.timing || "N/A"}
                    </p>
                    <p className='text-xs'>Duration: {med.duration || "N/A"}</p>
                    <p className='text-xs'>
                      Remarks: {med.instruction || "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className='text-xs text-gray-500'>
                  No medications prescribed
                </p>
              )}
            </div>
            <div className='advice-list'>
              <h4 className='mt-4 font-semibold'>Advice</h4>
              {advices?.length > 0 ? (
                <ul className='list-inside list-disc text-gray-700'>
                  {advices
                    .filter((advice) => advice.isChecked)
                    .map((advice, index) => (
                      <li key={index}>{advice.text}</li>
                    ))}
                </ul>
              ) : (
                <p className='text-xs text-gray-500'>No advice provided</p>
              )}
            </div>
            <div className='followup-section'>
              <p className='mt-2 font-semibold text-blue-600'>Follow Up</p>
              <p className='text-xs text-gray-500'>
                {followUp?.date
                  ? `Visit on ${followUp.date}`
                  : "No follow-up scheduled"}
              </p>
              {followUp?.notes && (
                <p className='text-xs text-gray-500'>Notes: {followUp.notes}</p>
              )}
            </div>
          </div> */}
        </div>

        <div className='mt-4 flex justify-between border-t pt-4'>
          <div className='space-x-2'>
            {/* <button
              className='rounded border px-4 py-2'
              onClick={() => handleAction("Monetize Rx")}
            >
              Monetize Rx
            </button> */}
            <button className='rounded border px-4 py-2' onClick={onBack}>
              Edit Prescription
            </button>
            <button
              className='rounded border px-4 py-2'
              onClick={() => setIsPrintSettingsOpen(true)}
            >
              Print Setting
            </button>
            {/* <button
              className='rounded border px-4 py-2'
              onClick={() => handleAction("Order Medicines")}
            >
              Order Medicines
            </button> */}
          </div>
          <div className='space-x-2'>
            <button
              className='rounded border px-4 py-2'
              onClick={handleShareClick}
            >
              Share
            </button>
            <button
              className='rounded border px-4 py-2'
              onClick={handleDownload}
            >
              Download
            </button>
            <button className='rounded border px-4 py-2' onClick={handlePrint}>
              Print
            </button>
            <button
              className='rounded bg-blue-600 px-4 py-2 text-white'
              onClick={onAction}
            >
              Send Rx & End Visit
            </button>
          </div>
        </div>
      </div>
      {isPrintSettingsOpen && (
        <PrintSettingsModal
          isOpen={isPrintSettingsOpen}
          closeModal={() => setIsPrintSettingsOpen(false)}
          printSettings={printSettings}
          onApply={handleApplyPrintSettings}
        />
      )}
      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          closeModal={() => setIsShareOpen(false)}
          file={sharePDF}
          patient={patient}
          isPrescription={true}
        />
      )}
    </div>
  );
};

export default PrescriptionPreview;
