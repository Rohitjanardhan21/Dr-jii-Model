import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import PersonalInfo from "../../components/UsedComp/PersonalInfo";
import ChangePassword from "../../components/UsedComp/ChangePassword";
import { Link, useNavigate, useParams } from "react-router-dom";
import PatientsUsed from "../../components/UsedComp/PatientsUsed";
import AppointmentsUsed from "../../components/UsedComp/AppointmentsUsed";
import { doctorTab } from "../../components/Datas";
import PaymentsUsed from "../../components/UsedComp/PaymentUsed";
import InvoiceUsed from "../../components/UsedComp/InvoiceUsed";
import DoCare from "../../components/DoCare";

function DoctorProfile() {
  const [activeTab, setActiveTab] = React.useState(2);
  const [doctor, setDoctor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchDoctor = async () => {
    setLoading(true);
    setError(null);
    if (!id) {
      setError("Doctor ID not found in URL.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getDoctorProfile/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorData?.message || response.statusText}`
        );
      }
      const json = await response.json();
      if (json && json.data) {
        setDoctor(json.data);
      } else {
        setError("Failed to fetch doctor data or data format is incorrect.");
      }
    } catch (e) {
      console.error("error fetching doctor...", e);
      setError(e.message || "Failed to fetch doctor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const tabPanel = () => {
    if (loading) {
      return <p>Loading profile...</p>;
    }
    if (error) {
      return <p className="text-red-500">Error: {error}</p>;
    }
    if (!doctor || Object.keys(doctor).length === 0) {
      return <p>Doctor profile not found.</p>;
    }

    switch (activeTab) {
      case 1:
        return <PersonalInfo titles={true} doctor={doctor} />;
      case 2:
        return <PatientsUsed doctor={doctor} />;
      case 3:
        return <AppointmentsUsed doctor={true} doctorData={doctor} />;
      case 4:
        return <PaymentsUsed doctor={true} doctorData={doctor} />;
      case 5:
        return <InvoiceUsed doctorData={doctor} />;
      case 6:
        return <DoCare id={id} doctorData={doctor} />;
      case 7:
        return <ChangePassword />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-500">Error: {error}</p>
      </Layout>
    );
  }

  if (!doctor || Object.keys(doctor).length === 0) {
    return (
      <Layout>
        <p>Doctor profile not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='flex items-center gap-4'>
        {/* Search input - Removed as it's not used */}
      </div>
      <div className='my-8 grid grid-cols-12 items-start gap-6'>
        <div
          data-aos='fade-right'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
          className='flex-colo top-28 col-span-12 gap-6 rounded-xl border-[1px] border-border bg-white p-6 lg:sticky lg:col-span-4'
        >
          {doctor && doctor.fullName && ( // Conditional rendering based on doctor and fullName
            <div
              className='flex w-full flex-row items-center rounded-md p-4 hover:bg-text hover:text-subMain'
              onClick={() => navigate("/profile")}
            >
              <img
                src={doctor?.doctorImage}
                alt='setting'
                className='h-20 w-20 rounded-full border border-dashed border-subMain object-cover'
              />
              <div className='ml-4 flex w-[50%] flex-col items-start'>
                <h2 className='h-4 text-sm font-semibold'>ّٗ{doctor.fullName}</h2>
                <p className='h-2 text-xs text-textGray'>{doctor.emailId}</p>
                <p className='h-0 text-xs'>{doctor.registrationNumber}</p>
              </div>
            </div>
          )}
          {/* tabs */}
          <div className='grid w-full grid-cols-3 items-center gap-3 px-2 2xl:px-12'>
            {doctorTab.map((tab, index) => (
              <button
                onClick={() => setActiveTab(tab.id)}
                key={index}
                className={` ${
                  activeTab === tab.id
                    ? "bg-text text-subMain"
                    : "bg-dry text-main hover:bg-text hover:text-subMain"
                } flex h-[100px] flex-col items-center justify-center rounded text-xs`}
              >
                <tab.icon className='text-lg' />
                <span className='pt-2'>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>
        {/* tab panel */}
        <div
          data-aos='fade-left'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
          className='col-span-12 rounded-xl border-[1px] border-border bg-white p-6 lg:col-span-8'
        >
          {tabPanel()}
        </div>
      </div>
    </Layout>
  );
}

export default DoctorProfile;