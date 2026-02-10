import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import { FromToDate, Select } from "../../components/Form";
import { Transactiontable } from "../../components/Tables";
import { sortsDatas } from "../../components/Datas";
import { BiChevronDown, BiTime, BiPlus, BiSearch, BiX } from "react-icons/bi";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { BsCalendarMonth } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modals/Modal";
import CreateInvoice from "../Invoices/CreateInvoice";
import CreatePatient from "../Patients/CreatePatient";
import PageAction from "../../components/PageAction";

function Payments() {
  const [status, setStatus] = useState(sortsDatas.status[0].name);
  const [method, setMethod] = useState(sortsDatas.method[0].name);
  const [searchText, setSearchText] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    todayTotal: 0,
    monthTotal: 0,
    yearTotal: 0,
  });
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invoiceChanged, setInvoiceChanged] = useState(false);

  const getInitialDateRange = () => {
    const today = new Date();

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return [startOfMonth, endOfMonth];
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());
  const [startDate, endDate] = dateRange;

  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

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
    const handleAddPaymentAction = () => {
      setIsCreateInvoiceOpen(true);
    };

    window.addEventListener("action:addPayment", handleAddPaymentAction);
    return () => {
      window.removeEventListener("action:addPayment", handleAddPaymentAction);
    };
  }, []);

  const filteredPatients = patients?.filter((patient) =>
    (patient?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const sorts = [
    {
      id: 2,
      selected: status,
      setSelected: setStatus,
      datas: sortsDatas.status,
    },
    {
      id: 3,
      selected: method,
      setSelected: setMethod,
      datas: sortsDatas.method,
    },
  ];

  const boxes = [
    {
      id: 1,
      title: "Today Payments",
      value: `₹${summary.todayTotal.toLocaleString()}`,
      color: ["bg-subMain", "text-subMain"],
      icon: BiTime,
    },
    {
      id: 2,
      title: "Monthly Payments",
      value: `₹${summary.monthTotal.toLocaleString()}`,
      color: ["bg-orange-500", "text-orange-500"],
      icon: BsCalendarMonth,
    },
    {
      id: 3,
      title: "Yearly Payments",
      value: `₹${summary.yearTotal.toLocaleString()}`,
      color: ["bg-green-500", "text-green-500"],
      icon: MdOutlineCalendarMonth,
    },
  ];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchText) params.append("patientName", searchText);
      if (status !== "Status...") params.append("status", status);
      if (method !== "Payment method") params.append("method", method);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      console.log("params", params);

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payments?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      if (res.ok) {
        setPayments(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payment-summary`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        setSummary({
          todayTotal: data.todayTotal,
          monthTotal: data.monthTotal,
          yearTotal: data.yearTotal,
        });
      } else {
        toast.error(data.message || "Failed to load summary");
      }
    } catch (error) {
      console.error("Summary Error:", error);
      toast.error("Failed to load payment summary");
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentSummary();
  }, []);

  // Auto-refresh payments when filters change (debounced)
  useEffect(() => {
    const debounceId = setTimeout(() => {
      fetchPayments();
    }, 350);
    return () => clearTimeout(debounceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, status, method, startDate, endDate]);

  const editPayment = (id) => {
    navigate(`/payments/edit/${id}`);
  };

  const previewPayment = (id) => {
    navigate(`/payments/preview/${id}`);
  };

  const handleCloseInvoiceModal = () => {
    setIsCreateInvoiceOpen(false);
    fetchPayments(); // refetch payments
    setInvoiceChanged(false); // reset
  };

  return (
    <Layout>
      {/* Search Patients */}
      <div className='relative mb-6 grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
        <h1 className='text-2xl font-bold text-gray-800'>Payments</h1>
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
        
        <PageAction onActionClick={() => setIsCreateInvoiceOpen(true)} />
      </div>

      <div className='mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {boxes.map((box) => (
          <div
            key={box.id}
            className='flex-btn gap-4 rounded-xl border-[1px] border-border bg-white p-4'
          >
            <div className='w-3/4'>
              <h2 className='text-sm font-medium'>{box.title}</h2>
              <h2 className='my-3 text-xl font-medium'>{box.value}</h2>
              <p className='text-xs text-textGray'>
                You made <span className={box.color[1]}>{box.value}</span>{" "}
                transactions{" "}
                {box.title === "Today Payments"
                  ? "today"
                  : box.title === "Monthly Payments"
                    ? "this month"
                    : "this year"}
              </p>
            </div>
            <div
              className={`flex-colo text-md h-10 w-10 rounded-md text-white ${box.color[0]}`}
            >
              <box.icon />
            </div>
          </div>
        ))}
      </div>

      <div className='my-8 rounded-xl border-[1px] border-border bg-white p-5'>
        <div className='grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          <input
            type='text'
            placeholder='Search "Patients"'
            className='flex h-14 w-full items-center justify-between rounded-md border border-border bg-dry px-4 text-xs text-main'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {sorts.map((item) => (
            <Select
              key={item.id}
              selectedPerson={item.selected}
              setSelectedPerson={(value) => item.setSelected(value)}
              datas={item.datas}
            >
              <div className='mt-[4px] flex h-14 w-full items-center justify-between rounded-md border border-border bg-dry px-4 text-xs text-main'>
                <p>{item.selected}</p>
                <BiChevronDown className='text-xl' />
              </div>
            </Select>
          ))}

          <FromToDate
            className='flex h-14 w-full items-center justify-between rounded-md border border-border bg-dry px-4 text-xs text-main'
            startDate={startDate}
            endDate={endDate}
            bg='bg-dry'
            onChange={(update) => setDateRange(update)}
          />
        </div>

        <div className='mt-8 w-full overflow-x-scroll'>
          <Transactiontable
            data={payments}
            loading={loading}
            functions={{
              edit: editPayment,
              preview: previewPayment,
            }}
          />
        </div>
      </div>
      {isCreateInvoiceOpen && (
        <Modal
          isOpen={isCreateInvoiceOpen}
          closeModal={() => setIsCreateInvoiceOpen(false)}
          title='Create Invoice'
          width='max-w-6xl'
        >
          <div className='max-h-[80vh] overflow-y-auto'>
            <CreateInvoice
              closeModal={handleCloseInvoiceModal}
              onSuccess={() => setInvoiceChanged(true)}
            />
          </div>
        </Modal>
      )}

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

export default Payments;
