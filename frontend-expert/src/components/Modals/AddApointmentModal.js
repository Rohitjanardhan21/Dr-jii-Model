import React, { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import {
  Button,
  Checkbox,
  DatePickerComp,
  Input,
  Select,
  Textarea,
  TimePickerComp,
} from "../Form";
import { BiChevronDown, BiPlus } from "react-icons/bi";
import { memberData, servicesData, sortsDatas } from "../Datas";
import { HiOutlineCheckCircle, HiOutlineTrash } from "react-icons/hi";
import { HiOutlineShare } from "react-icons/hi";
import { toast } from "react-hot-toast";
import PatientMedicineServiceModal from "./PatientMedicineServiceModal";
import ShareModal from "./ShareModal";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { generateInvoicePDFBlob } from "../../utils/invoiceUtils";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";

// edit member data
const doctorsData = memberData.map((item) => {
  return {
    id: item.id,
    name: item.title,
  };
});

function AddAppointmentModal({ closeModal, isOpen, datas, patientData, defaultPatient, onSuccess }) {
  const { doctor } = useDoctorAuthStore();
  
  const [services, setServices] = useState(servicesData[0].name);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const end = new Date();
    end.setHours(end.getHours() + 1); // Set end time 1 hour later
    return end;
  });
  const [status, setStatus] = useState(sortsDatas.status[1].name); // Default to "Pending"
  const [patient, setPatient] = useState(defaultPatient || { fullName: "", _id: "" });
  const [doctors, setDoctors] = useState(doctorsData[0]);
  const [shares, setShares] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  }); 
  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharePDF, setSharePDF] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const appointmentPrintRef = useRef();
  
  // States for search functionality (only used in create mode)
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Check if we're in edit mode
  const isEditMode = datas?.title;
  // Prefill from defaultPatient when opened from patient profile
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

  // on change share
  const onChangeShare = (e) => {
    setShares({ ...shares, [e.target.name]: e.target.checked });
  };

  // Handle share appointment
  const handleShareAppointment = async () => {
    if (!datas?.appointmentId) {
      toast.error("No appointment to share");
      return;
    }


    
    if (!appointmentPrintRef.current) {
      toast.error("Nothing to share!");
      return;
    }

    toast.loading("Preparing PDF...");
    try {
      // Temporarily make the element visible for PDF generation
      const originalStyle = appointmentPrintRef.current.style.cssText;
      appointmentPrintRef.current.style.cssText = 'position: absolute; left: -9999px; top: -9999px; visibility: visible; opacity: 1;';
      
      // Wait a bit for the element to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
  
      const pdfBlob = await generateInvoicePDFBlob(appointmentPrintRef.current);


      // Restore original style
      appointmentPrintRef.current.style.cssText = originalStyle;

      if (!pdfBlob) {
        toast.dismiss();
        toast.error("Failed to generate PDF");
        return;
      }

      setSharePDF(pdfBlob);
      setIsShareOpen(true);
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to prepare appointment for sharing");
    }
  };

  // Generate PDF once and reuse for multiple channels
  const generateAppointmentPDF = async () => {
    if (!appointmentPrintRef.current) {
      console.error("Appointment print ref not available");
      return null;
    }

    try {
      // Temporarily make the element visible for PDF generation
      const originalStyle = appointmentPrintRef.current.style.cssText;
      appointmentPrintRef.current.style.cssText = 'position: absolute; left: -9999px; top: -9999px; visibility: visible; opacity: 1;';
      
      // Wait a bit for the element to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Double-check ref is still available before generating PDF
      if (!appointmentPrintRef.current) {
        return null;
      }
      
      const pdfBlob = await generateInvoicePDFBlob(appointmentPrintRef.current);

      // Restore original style
      if (appointmentPrintRef.current) {
        appointmentPrintRef.current.style.cssText = originalStyle;
      }

      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  // Normalize contact number for SMS (remove country code, spaces, dashes, etc.)
  const normalizeContactNumber = (contact) => {
    if (!contact) return "";
    // Remove all non-digit characters
    let normalized = contact.replace(/\D/g, "");
    // Remove country code prefixes (+91, 91, 0091, etc.)
    if (normalized.startsWith("91") && normalized.length > 10) {
      normalized = normalized.substring(2);
    } else if (normalized.startsWith("0091") && normalized.length > 12) {
      normalized = normalized.substring(4);
    }
    // Return only digits (should be 10 digits for Indian numbers)
    return normalized;
  };

  // Send appointment via email or SMS
  const sendAppointmentViaChannel = async (channel, appointmentId, pdfBlob) => {
    // Determine endpoint based on channel (defined outside try block for error handling)
    const endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-appointment/${channel}`;
    
    try {
      // Validate patient contact info based on channel
      if (channel === "email" && !patient?.contactDetails?.email) {
        toast.error("Patient email not available");
        return false;
      }

      if (channel === "sms" && !(patient?.contactDetails?.primaryContact || patient?.contactDetails?.secondaryContact)) {
        toast.error("Patient contact number not available");
        return false;
      }

      if (!pdfBlob) {
        toast.error("Failed to generate PDF for sharing");
        return false;
      }

      // Create PDF file (clone the blob for each channel)
      const pdfFile = new File([pdfBlob], "appointment.pdf", {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("name", patient?.fullName || "");
      
      // For SMS, normalize contact number (backend adds +91 prefix)
      if (channel === "sms") {
        const rawContact = patient?.contactDetails?.primaryContact ||
                          patient?.contactDetails?.secondaryContact ||
                          patient?.contactDetails?.landline ||
                          "";
        const normalizedContact = normalizeContactNumber(rawContact);
        
        if (!normalizedContact || normalizedContact.length < 10) {
          toast.error("Invalid contact number format");
          return false;
        }
        
        formData.append("contact", normalizedContact);
      } else {
        // For email, send email address
        formData.append("email", patient?.contactDetails?.email || "");
      }
      
      formData.append("id", appointmentId || "");

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Appointment sent via ${channel === "sms" ? "SMS" : "Email"}`);
        return true;
      } else {
        // More detailed error message for debugging
        const errorMsg = data.message || `Failed to send appointment via ${channel === "sms" ? "SMS" : "Email"}`;
        const patientContact = channel === "sms" 
          ? (patient?.contactDetails?.primaryContact || patient?.contactDetails?.secondaryContact || patient?.contactDetails?.landline || "")
          : patient?.contactDetails?.email || "";
        console.error(`Failed to send appointment via ${channel}:`, {
          endpoint,
          response: data,
          patientContact,
        });
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      const patientContact = channel === "sms" 
        ? (patient?.contactDetails?.primaryContact || patient?.contactDetails?.secondaryContact || patient?.contactDetails?.landline || "")
        : patient?.contactDetails?.email || "";
      console.error(`Error sending appointment via ${channel}:`, {
        error,
        endpoint,
        patientContact,
      });
      toast.error(`Something went wrong while sending appointment via ${channel === "sms" ? "SMS" : "Email"}`);
      return false;
    }
  };

  const handleSaveAppointment = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!patient?._id) {
        toast.error("Please select a patient");
        setIsSaving(false);
        return;
      }

      if (!services || services === "Select service") {
        toast.error("Please select a service");
        setIsSaving(false);
        return;
      }

      if (!startDate) {
        toast.error("Please select a date");
        setIsSaving(false);
        return;
      }

      if (!status || status === "Status...") {
        toast.error("Please select a status");
        setIsSaving(false);
        return;
      }

      // Combine date and time for startTime and endTime
      const combinedStartTime = new Date(startDate);
      combinedStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const combinedEndTime = new Date(startDate);
      combinedEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      const payload = {
        userId: patient?._id,
        purposeOfVisit: services,
        dateOfVisit: startDate instanceof Date ? startDate.toISOString() : startDate,
        startTime: combinedStartTime.toISOString(),
        endTime: combinedEndTime.toISOString(),
        status: status,
        description,
        shareWithPatient: { ...shares },
        appointmentId: datas?.appointmentId,
      };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/appoitments/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (response.ok) {
        const appointmentId = result.data?.appointmentId || result.data?._id || datas?.appointmentId || "";
        
        // Send appointment via selected channels if any are checked
        if (appointmentId && (shares.email || shares.sms)) {
          // Generate PDF once and reuse for both channels to avoid conflicts
          const pdfBlob = await generateAppointmentPDF();
          
          if (pdfBlob) {
            const sharePromises = [];
            if (shares.email) {
              sharePromises.push(sendAppointmentViaChannel("email", appointmentId, pdfBlob));
            }
            if (shares.sms) {
              sharePromises.push(sendAppointmentViaChannel("sms", appointmentId, pdfBlob));
            }

            // Wait for all share operations to complete (but don't fail the update if sharing fails)
            if (sharePromises.length > 0) {
              await Promise.allSettled(sharePromises);
            }
          } else {
            toast.error("Failed to generate PDF for sharing");
          }
        }

        // Only reset form if this is a new appointment (not an update)
        if (!isEditMode) {
          setPatient({ fullName: "", _id: "" });
          setServices(servicesData[0].name);
          setStartDate(new Date());
          setEndTime(new Date());
          setStartTime(new Date());
          setStatus(sortsDatas.status[0].name);
          setDescription("");
          setShares({
            email: false,
            sms: false,
            whatsapp: false,
          });
        }

        toast.success(result.message || (isEditMode ? "Appointment updated successfully" : "Appointment created successfully"));

        // Call onSuccess callback if provided (for parent to refresh data)
        if (onSuccess) {
          onSuccess(result);
        }

        // Close modal after success
        closeModal();

        } else {
          toast.error(result.message || "Failed to create Appointment");
        }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async () => {
    if (!datas?.appointmentId) {
      toast.error("No appointment ID found");
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/api/appointments/${datas.appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || "Appointment deleted successfully");
        setShowDeleteConfirm(false);
        closeModal();
      } else {
        toast.error(result.message || "Failed to delete appointment");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  // set data
  useEffect(() => {
    if (datas?.title) {
      setStartDate(new Date(datas?.dateOfVisit))
      setServices(datas?.service);
      setStartTime(datas?.start);
      setEndTime(datas?.end);
      setShares(datas?.shareData);
      setStatus(datas?.status);
      setDescription(datas?.message);
      
      // Find patient data
      const patientInfo = patientData?.find(p => p._id === datas?.patientId);
      setPatient({
        fullName: datas?.title,
        _id: datas?.patientId,
        email: patientInfo?.email || "",
        phone: patientInfo?.phone || "",
        contactDetails: {
          email: patientInfo?.email || "",
          primaryContact: patientInfo?.phone || patientInfo?.mobileNumber || patientInfo?.primaryContact || "",
          secondaryContact: patientInfo?.secondaryContact || "",
          landline: patientInfo?.landline || ""
        }
      });
    }
  }, [datas, patientData]);

  const filteredPatients = (patientData || []).filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (user) => {
    setSelected(user);
    setPatient({
      fullName: user.fullName || "",
      _id: user._id || "",
      email: user.email || "",
      phone: user.phone || "",
      image: user.image || "",
      contactDetails: {
        email: user.email || "",
        primaryContact: user.phone || user.mobileNumber || user.primaryContact || "",
        secondaryContact: user.secondaryContact || "",
        landline: user.landline || ""
      }
    });
    setDropdownVisible(false);
    setSearchQuery("");
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelected(null);
    setDropdownVisible(true);
  };

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={datas?.title ? "Appointment" : "New Appointment"}
      width={"max-w-3xl"}
    >
      {open && (
        <PatientMedicineServiceModal
          setOpen={setOpen}
          setPatient={setPatient}
          isOpen={open}
          patient={true}
          patientData={patientData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <HiOutlineTrash className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 text-center">
              Delete Appointment
            </h3>
            <p className="mb-6 text-sm text-gray-500 text-center">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAppointment}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex-colo gap-2'>
        <div className='grid w-full items-center gap-2 sm:grid-cols-12'>
          <div className='sm:col-span-10'>
            <div className='flex w-full flex-col gap-2'>
              <p className='text-sm font-semibold text-black'>Patient Name</p>
              {isEditMode || defaultPatient ? (
                // Edit mode: Display patient name with profile image
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
                // Create mode: Show search functionality
                <div className="w-full">
                  <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
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
                    <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 shadow bg-white">
                      {filteredPatients.length === 0 ? (
                        <p className="p-2 text-xs text-gray-500">No results found</p>
                      ) : (
                        filteredPatients.map((user) => (
                          <div
                            key={user.id}
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
                                <p className="text-xs text-gray-500">{user.email}</p>
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
        </div>

        <div className='grid w-full gap-3 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Purpose of visit</p>
            <Select
              selectedPerson={services}
              setSelectedPerson={setServices}
              datas={servicesData}
            >
              <div
                className='flex w-full h-10 items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium' 
                style={{ height: '40px', minHeight: '40px', maxHeight: '40px' }}
              >
                {services} <BiChevronDown className='text-lg' />
              </div> 
            </Select>
          </div>
          {/* date */}
          <div className='flex w-full flex-col gap-[2px]'>
            <p className='text-sm font-semibold text-black'>Date of visit</p>
            <div className='w-full h-10 '>
              <DatePickerComp
                startDate={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
          </div>
        </div>

        <div className='grid w-full gap-3 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Start time</p>
            <TimePickerComp
              startDate={startTime}
              onChange={(date) => setStartTime(date)}
            />
          </div>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>End time</p>
            <TimePickerComp
              startDate={endTime}
              onChange={(date) => setEndTime(date)}
            />
          </div>
        </div>

        {/* status && doctor */}
        <div className='grid w-full gap-3 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Status</p>
            <Select
              selectedPerson={status}
              setSelectedPerson={setStatus}
              datas={sortsDatas.status}
            >
              <div className='flex-btn w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black focus:border focus:border-subMain' style={{ height: '40px' }}>
                {status} <BiChevronDown className='text-lg' />
              </div>
            </Select>
          </div>
        </div>

        {/* des */}
        <div className='flex flex-col gap-2 w-full'>
          <p className='text-sm font-semibold text-black'>Description</p>
          <textarea
            placeholder={
              datas?.message
                ? datas.message
                : "She will be coming for a checkup....."
            }
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            className='w-3/4 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-subMain resize-none text-left'
            style={{ textAlign: 'left' }}
          />
        </div>

        {/* share */}
        <div className='flex w-full flex-col gap-4 mb-4'>
          <p className='text-sm font-semibold text-black'>Share with patient via</p>
          <div className='flex flex-row mb-2 gap-3 justify-items-center'>
            <div className='flex'>
              <Checkbox
                name='email'
                checked={shares.email}
                onChange={onChangeShare}
                label='Email'
              />
            </div>
            <div className='flex'>
              <Checkbox
                name='sms'
                checked={shares.sms}
                onChange={onChangeShare}
                label='SMS'
              />
            </div>
          </div>
        </div>
        
        {/* buttons */}
        <div className="flex w-full gap-3 justify-end">
          {/* Show delete button only in edit mode - positioned on the left */}
          {/* {isEditMode && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 min-w-[200px]'
            >
              <HiOutlineTrash className="text-sm" />
              Delete
            </button>
          )} */}
          
          {/* Share button - only show in edit mode */}
          {/* {isEditMode && (
            <button
              onClick={handleShareAppointment}
              className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-w-[200px]'
            >
              <HiOutlineShare className="text-sm" />
              Share
            </button>
          )} */}
          
          {/* Update/Save button - positioned on the right */}
          <div className="min-w-[200px]">
            <Button
              label={isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
              Icon={HiOutlineCheckCircle}
              onClick={() => {
                handleSaveAppointment();
              }}
              loading={isSaving}
            />
          </div>
        </div>
      </div>
      
      {/* Printable Appointment Content (Hidden) */}
      <div ref={appointmentPrintRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '600px', height: 'auto', backgroundColor: 'white' }}>
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '400px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0097DB', paddingBottom: '10px', marginBottom: '20px' }}>
            <h1 style={{ color: '#0097DB', margin: '0 0 5px 0', fontSize: '24px' }}>Appointment Details</h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>Medical Appointment Information</p>
          </div>

          {/* Doctor Details */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#0097DB', marginBottom: '10px', borderLeft: '4px solid #0097DB', paddingLeft: '8px' }}>
              Doctor Information
            </h2>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Name:</strong> {doctor?.fullName || "Doctor Name"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Qualification:</strong> {doctor?.qualificationDetails?.degreeName || "MBBS/MD"} · {doctor?.systemOfMedicine?.systemOfMedicine || "General Physician"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Address:</strong> {doctor?.addressPerKyc?.address || "Clinic Address"}, {doctor?.addressPerKyc?.pincode || "N/A"}
            </p>
            {doctor?.mobileNumber && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Contact:</strong> {doctor.mobileNumber}
              </p>
            )}
          </div>

          {/* Patient Details */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#0097DB', marginBottom: '10px', borderLeft: '4px solid #0097DB', paddingLeft: '8px' }}>
              Patient Information
            </h2>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Name:</strong> {patient?.fullName || datas?.title || "Unknown"}
            </p>
            {patient?.contactDetails?.email && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Email:</strong> {patient.contactDetails.email}
              </p>
            )}
            {(patient?.contactDetails?.primaryContact || patient?.contactDetails?.secondaryContact) && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Contact:</strong> {patient?.contactDetails?.primaryContact || patient?.contactDetails?.secondaryContact}
              </p>
            )}
          </div>

          {/* Appointment Details */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#0097DB', marginBottom: '10px', borderLeft: '4px solid #0097DB', paddingLeft: '8px' }}>
              Appointment Information
            </h2>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Appointment ID:</strong> {datas?.appointmentId || "N/A"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Date:</strong> {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Time:</strong> {startTime ? new Date(startTime).toLocaleTimeString() : "N/A"} - {endTime ? new Date(endTime).toLocaleTimeString() : "N/A"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Service:</strong> {services || "N/A"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Status:</strong> {status || "N/A"}
            </p>
            {description && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Description:</strong> {description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '30px', textAlign: 'right', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: '0' }}>Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          closeModal={() => setIsShareOpen(false)}
          file={sharePDF}
          patient={patient}
          id={datas?.appointmentId}
          isPrescription={false}
          isAppointment={true} // This is for appointment
        />
      )}
    </Modal>
  );
}

export default AddAppointmentModal;