import React, { useEffect, useState } from "react";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import { BiChevronDown, BiPlus, BiSearch, BiX } from "react-icons/bi";
import Layout from "../Layout";
import { ServiceSelect } from "../components/Form";
import { ServiceTable } from "../components/Tables";
import { sortsDatas } from "../components/Datas";
import AddEditServiceModal from "../components/Modals/AddEditServiceModal";
import { useNavigate } from "react-router-dom";
import { BiLoaderCircle } from "react-icons/bi";
import CreatePatient from "./Patients/CreatePatient";
import Modal from "../components/Modals/Modal";
import PageAction from "../components/PageAction";

const ModifiedButton = ({ label, onClick, loading, Icon }) => {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`flex-rows transitions w-[150px] gap-4 rounded bg-subMain px-[6px] py-2 text-sm font-medium text-white hover:opacity-80`}
    >
      {loading ? (
        <BiLoaderCircle className='animate-spin text-2xl text-white' />
      ) : (
        <>
          {label}
          {Icon && <Icon className='text-xl text-white' />}
        </>
      )}
    </button>
  );
};

function Services() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState({}); // Data for editing
  const [status, setStatus] = React.useState(sortsDatas.service[0]);
  const [servicesData, setServicesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const navigate = useNavigate();

  const getDefaultService = () => ({
  _id: "default-consultation",
  serviceName: "Consultation",
  price: 500,
  createdAt: new Date().toISOString(),
  isDisabled: true,
  isDefault: true
});


  const fetchData = async () => {
  try {
    setLoading(true);

    const response = await fetch(
      `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // 🔥 Normalize response to ALWAYS be an array
    const servicesArray = Array.isArray(json)
      ? json
      : Array.isArray(json?.services)
      ? json.services
      : [];

    if (servicesArray.length === 0) {
      setServicesData([getDefaultService()]);
    } else {
      setServicesData(servicesArray);
    }
  } catch (e) {
    console.log("error fetching...", e);
    toast.error("Failed to fetch services");
    setServicesData([getDefaultService()]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    let filtered = [...servicesData];

    // Filter by enabled/disabled
    if (status?.value === "enabled") {
      filtered = filtered.filter((item) => !item.isDisabled);
    } else if (status?.value === "disabled") {
      filtered = filtered.filter((item) => item.isDisabled);
    }

    // Filter by search
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [servicesData, searchTerm, status]);

  const exportToCSV = () => {
    if (!servicesData || servicesData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Created At", "Price (Tsh)", "Status"];

    const rows = servicesData.map((item) => [
      item.serviceName || "N/A",
      new Date(item.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      item.price || "0",
      item.isDisabled ? "Disabled" : "Enabled",
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((e) =>
        e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "services_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
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
    const handleAddServiceAction = () => {
      onAdd();
    };

    window.addEventListener("action:addService", handleAddServiceAction);
    return () => {
      window.removeEventListener("action:addService", handleAddServiceAction);
    };
  }, []);

  const filteredPatients = patients?.filter((patient) =>
    (patient?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const onCloseModal = () => {
    setIsOpen(false);
    setData({}); // Clear data when closing
  };

  const onEdit = (serviceData) => {
    console.log("Service data to edit:", serviceData);
    setData(serviceData);
    setIsOpen(true);
  };

  const onAdd = () => {
    setData({});
    setIsOpen(true);
  };

  const onServiceUpdated = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Layout>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-subMain'></div>
            <p>Loading services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isOpen && (
        <AddEditServiceModal
          datas={data}
          isOpen={isOpen}
          closeModal={onCloseModal}
          onServiceUpdated={onServiceUpdated}
        />
      )}
      {/* Search Patients */}
      <div className='relative mb-6 grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
        <h1 className='text-2xl font-bold text-gray-800'>Services</h1>
        

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
      
      <div className='flex justify-between items-center mb-6'>
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
        <PageAction onActionClick={onAdd} />
      </div>

      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 rounded-xl border-[1px] border-border bg-white p-5'
      >
        {/* Controls */}
        <div className='grid grid-cols-1 gap-2 md:grid-cols-6'>
          <div className='grid items-center gap-6 xs:grid-cols-2 md:col-span-5 lg:grid-cols-4'>
            <input
              type='text'
              placeholder='Search "teeth cleaning"'
              className='h-[42px] w-full rounded-md border border-border bg-dry p-[10px] text-sm text-main focus:border-subMain focus:outline-none'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <ServiceSelect
              selectedPerson={status}
              setSelectedPerson={setStatus}
              datas={sortsDatas.service}
            >
              <div className='flex-btn mt-[5px] w-[100px] rounded-lg border border-border bg-dry p-[10px] text-sm font-light text-main transition-colors hover:border-subMain focus:border focus:border-subMain'>
                {status.name} <BiChevronDown className='text-xl' />
              </div>
            </ServiceSelect>
          </div>

          {/* Export button */}
          {/* <ModifiedButton
            label='Export'
            Icon={MdOutlineCloudDownload}
            onClick={exportToCSV}
            disabled={!servicesData || servicesData.length === 0}
          /> */}
        </div>

        {/* Services Table */}
        <div className='mt-8 w-full'>
          {filteredServices.length === 0 ? (
            <div className='py-8 text-center'>
              <p className='text-textGray'>
                {servicesData.length === 0
                  ? "No services found. Click the + button to add your first service."
                  : searchTerm || status?.value !== "all"
                    ? "No services match your current filters."
                    : "No services available."}
              </p>
            </div>
          ) : (
            <ServiceTable data={filteredServices} onEdit={onEdit} />
          )}
        </div>
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
            // Refresh patient data after successful creation
            fetchPatients();
            setSearch("");
            setIsAddPatientModalOpen(false);
          }}
        />
      </Modal>
    </Layout>
  );
}

export default Services;
