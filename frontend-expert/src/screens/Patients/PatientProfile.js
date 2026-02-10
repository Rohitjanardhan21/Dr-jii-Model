import React, { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Layout from "../../Layout";
import { patientTab } from "../../components/Datas";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import MedicalRecord from "./MedicalRecord";
import AppointmentsUsed from "../../components/UsedComp/AppointmentsUsed";
import InvoiceUsed from "../../components/UsedComp/InvoiceUsed";
import PaymentsUsed from "../../components/UsedComp/PaymentUsed";
import PersonalInfo from "../../components/UsedComp/PersonalInfo";
import PatientImages from "./PatientImages";
import HealthInfomation from "./HealthInfomation";
import DentalChart from "./DentalChart";
import { PatientChat } from "./PatientChat";
import { BiPlus } from "react-icons/bi";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function PatientProfile() {
  const [activeTab, setActiveTab] = React.useState(4);
  const [isMRMO, setIsMRMO] = React.useState(false); // isMedicalRecordModalOpen
  const [patient,setPatient]=React.useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
    AOS.refresh();
  }, [activeTab]);

  useEffect(() => {
      async function fetchPatient() {
        try {
          const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/${id}`,{credentials:"include"});
          const data = await response.json();
          setPatient({...data});
        } catch (error) {
          console.error("Failed to fetch patient data", error);
        }finally {
      setLoading(false);
    }
      }
  
      if (id) fetchPatient();
    }, [id]);

  // Handle file input click
  const handleAddPhotoClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/upload-profile-photo/${id}`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile photo uploaded successfully!");
        // Update patient state with new image URL
        setPatient({ ...patient, userImage: data.imageUrl });
      } else {
        toast.error(data.message || "Failed to upload profile photo");
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle patient deletion
  const handleDeletePatient = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Patient deleted successfully');
        navigate('/patients');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const tabPanel = () => {
    
    switch (activeTab) {
      case 1:
        return <HealthInfomation />;
      case 2:
        return <AppointmentsUsed doctor={false} />;
      case 3:
        return <PatientImages />;
      case 4:
        return <MedicalRecord isMRMO={isMRMO} setIsMRMO={setIsMRMO} patient={patient} />;
      case 5:
        return <PatientChat patientName={patient?.fullName} id={id} />;
      case 6:
        return <PaymentsUsed doctor={false} patientName={patient?.fullName} />;
      case 7:
        return <InvoiceUsed />;
      case 8:
        return <PersonalInfo titles={false} data={patient} onDelete={handleDeletePatient} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link
          to='/patients'
          className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
        >
          <IoArrowBackOutline />
        </Link>
        <h1 className='text-xl font-semibold'>{patient?.fullName}</h1>
      </div>

      {/* Floating button for adding medical record */}
      {activeTab === 1 && (
        <div
          onClick={() => {
            setIsMRMO(true);
          }}
          className='flex-colo button-fb fixed bottom-8 right-12 z-50 h-16 w-16 animate-bounce rounded-full border border-border bg-[#0095D9] cursor-pointer text-white'
        >
          <BiPlus className='text-2xl' />
        </div>
      )}

      {/* Main content */}
      <div className='my-8 grid grid-cols-12 items-start gap-6'>
        {/* Sidebar */}
        <div
          data-aos='fade-right'
          className='top-28 col-span-12 flex-colo gap-6 rounded-xl border border-border bg-white p-6 lg:sticky lg:col-span-4'
        >
          {/* Profile Preview (clickable) */}
          <div
            onClick={() => setActiveTab(8)}
            className={`${
              activeTab === 8 ? "bg-text text-subMain" : ""
            } border-dashed border-text hover:bg-text hover:text-subMain cursor-pointer rounded-lg p-3 px-5 relative`}
          >
            <div className='relative inline-block ml-5'>
              <img
                src={patient?.userImage}
                alt='Patient'
                className='h-40 w-40 rounded-full border border-subMain object-cover mx-auto'
              />
              {/* Add Profile Photo button */}
              <button
                onClick={handleAddPhotoClick}
                disabled={uploading}
                className='absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-subMain text-white shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                title='Add Profile Photo'
              >
                {uploading ? (
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                ) : (
                  <BiPlus className='text-xl' />
                )}
              </button>
            </div>
            <div className='flex-colo gap-2 mt-4'>
              <h2 className='text-sm font-semibold'>{patient?.fullName}</h2>
              <p className='text-xs text-textGray'>{patient?.contactDetails?.email}</p>
              <p className='text-xs'>{patient?.contactDetails?.primaryContact}</p>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Tab Buttons */}
          <div className='flex flex-col items-center gap-3 w-80'>
          {patientTab.map((tab, index) => (
           <button
             key={index}
             onClick={() => setActiveTab(tab.id)}
             className={`${
              activeTab === tab.id
                ? "bg-text text-subMain"
                : "bg-dry text-main hover:bg-text hover:text-subMain"
             } flex w-75 items-center gap-4 rounded-lg px-5 py-3 text-xs`}
           >
      <tab.icon className='text-lg' /> {tab.title}
    </button>
  ))}
</div>

        </div>

        {/* Content Panel */}
        <div
          data-aos='fade-left'
          className='col-span-12 rounded-xl border border-border bg-white p-6 lg:col-span-8'
        >
          {tabPanel()}
        </div>
      </div>
    </Layout>
  );
}

export default PatientProfile;
