import React from "react";
import Uploder from "../Uploader";
import { sortsDatas } from "../Datas";
import { Input, DatePickerComp, Select } from "../Form";
import { BiChevronDown } from "react-icons/bi";
import { toast } from "react-hot-toast";
import { AiOutlineReload } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { servicesData } from "../Datas";
import { useState } from "react";
import SmartSuggestEditor from "../SmartSuggestEditor";
import { patientHistoryMaster } from "../../Assets/Data";

// Random UHID generator function
const generateRandomUHID = () => {
  return `AVIJO-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
};

// adding history bydefault data
const DEFAULT_HISTORY_OPTIONS = [
  "Alcohol",
  "Tobacco",
  "Smoke",
  "Allergy to pollen",
  "Allergy to peanut",
  "Allergy to dairy food",
  "Hepatitis",
  "Ascites",
  "Bone cyst",
];




function PersonalInfo({ data, onSave, isModal = false, isSubmitting = false, closeModal, onDelete, showDeleteConfirm, setShowDeleteConfirm }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = React.useState(data?.fullName || "");
  const [aadharId, setAadharId] = React.useState(data?.aadharId || "");
  const [uhid, setUhid] = React.useState(data?.uhid || generateRandomUHID());
  const [date, setDate] = React.useState(data?.dateOfBirth ? new Date(data.dateOfBirth) : null);
  const [age, setAge] = React.useState(data?.age || "");
  const [isAgeManuallyEntered, setIsAgeManuallyEntered] = React.useState(!!data?.age);

  // Calculate age when date changes, but only if age wasn't manually entered or if it's empty
  React.useEffect(() => {
    if (date && !isAgeManuallyEntered) {
      const today = new Date();
      const birthDate = new Date(date);
      let ageYears = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageYears--;
      }
      // Ensure age is non-negative
      if (ageYears >= 0) {
        setAge(ageYears.toString());
      }
    }
  }, [date, isAgeManuallyEntered]);

  const handleAgeChange = (e) => {
    setAge(e.target.value);
    setIsAgeManuallyEntered(true);
  };

  const [gender, setGender] = React.useState(data?.gender || "Gender");
  const [bloodGroup, setBloodGroup] = React.useState(data?.bloodGroup || "Blood Group");
  const [language, setLanguage] = React.useState(data?.languagePreference || "English (Practice Default)");
  const [family, setFamily] = React.useState(data?.familyRelation || "Relation");
  const [referredBy, setReferredBy] = React.useState(data?.referredBy || "");
  const [selectedFacilityId, setSelectedFacilityId] = React.useState(data?.referredBy || "");
  const [selectedFacilityName, setSelectedFacilityName] = React.useState("");
  const [facilities, setFacilities] = React.useState([]);
  const [services, setServices] = React.useState(data?.services || "Select service");



  // adding patient history code
  // const [patientHistory, setPatientHistory] = useState([]);
  // const [selectedHistory, setSelectedHistory] = useState(null);
  // const [loadingHistory, setLoadingHistory] = useState(false);
  // const [historyOptions, setHistoryOptions] = useState(DEFAULT_HISTORY_OPTIONS);
  const [historyOptions, setHistoryOptions] = useState(DEFAULT_HISTORY_OPTIONS);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [noKnownHistory, setNoKnownHistory] = useState(false);


  const toggleHistory = (id) => {
    if (noKnownHistory) return;

    setSelectedHistory((prev) =>
      prev.includes(id)
        ? prev.filter((h) => h !== id)
        : [...prev, id]
    );
  };


  const [patientHistory, setPatientHistory] = useState(
    data?.patientMedicalHistory?.map(h => ({ name: h })) || []
  );



  // fetching history based on aadhar id
  // React.useEffect(() => {
  //   if (!aadharId || aadharId.length < 5) {
  //     setPatientHistory([]);
  //     setSelectedHistory(null);
  //     return;
  //   }

  //   console.log("Fetching history for Aadhar:", aadharId);

  //   const fetchHistory = async () => {
  //     try {
  //       setLoadingHistory(true);

  //       const token = localStorage.getItem("token"); // or correct key

  //       const res = await fetch(
  //         `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/history/aadhar/${aadharId}`,
  //         {
  //           method: "GET",
  //           credentials: "include", // REQUIRED for JWT cookie
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );



  //       if (!res.ok) {
  //         console.error("History API failed:", res.status);
  //         setPatientHistory([]);
  //         return;
  //       }

  //       const data = await res.json();
  //       setPatientHistory(data.history || []);


  //     } catch (err) {
  //       console.error(err);
  //       setPatientHistory([]);
  //     } finally {
  //       setLoadingHistory(false);
  //     }
  //   };

  //   fetchHistory();
  // }, [aadharId]);



  // end fetching patient history






  const [contactDetails, setContactDetails] = React.useState({
    email: data?.contactDetails?.email || "",
    primaryContact: data?.contactDetails?.primaryContact || "",
    secondaryContact: data?.contactDetails?.secondaryContact || "",
    landline: data?.contactDetails?.landline || "",
  });

  const [address, setAddress] = React.useState({
    street: data?.address?.street || "",
    locality: data?.address?.locality || "",
    city: data?.address?.city || "",
    pincode: data?.address?.pincode || "",
  });

  // Fetch facilities on component mount
  React.useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/facility/getAll/facilityProfile`,
          { credentials: "include" }
        );
        const json = await response.json();
        if (json.data) {
          setFacilities(json.data);
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      }
    };
    fetchFacilities();
  }, []);


  const handleSavePatient = async () => {
    try {
      // Validate required fields: Full Name
      if (!fullName) {
        toast.error("Please fill Full Name");
        return;
      }

      // Validate required fields: Date of Birth
      if (!date) {
        toast.error("Please fill Date of Birth");
        return;
      }
      // Only send gender/bloodGroup if user has selected real values
      const selectedGender = gender && gender !== "Gender" && gender !== "Select gender" ? gender : undefined;
      const selectedBloodGroup = bloodGroup && bloodGroup !== "Blood Group" ? bloodGroup : undefined;
      const payload = {
        uhid,
        aadharId,
        fullName,
        mobileNumner: contactDetails.primaryContact,
        email: contactDetails.email,
        gender: selectedGender,
        contactDetails,
        dateOfBirth: date,
        address,
        bloodGroup: selectedBloodGroup,
        age,
        family,
        referredBy: selectedFacilityId || referredBy, // Use selectedFacilityId if available, fallback to referredBy for backward compatibility
        language,
        patientMedicalHistory: noKnownHistory
          ? []
          : patientHistory.map(h => h.name),
        patientId: data?._id,
        // doctorId will be handled by backend (derived from logged-in expert or facility mapping)
      };

      if (isModal && onSave) {
        // If in modal mode, call the onSave callback
        await onSave(payload);
      } else {
        // If in page mode, make the API call directly
        const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          navigate("/Patients");
        } else {
          toast.error(result?.message || "Failed to create patient");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <p className='text-lg font-semibold text-[#ff6b6b]'>Personal Information</p>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <div className='w-full'>
            <label className='text-sm font-semibold text-black'>Full Name <span className='text-red-500'>*</span></label>
            <input
              type='text'
              placeholder='Full Name'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
            />
          </div>
          <div className='w-full'>
            <label className='text-sm font-semibold text-black'>Email </label>
            <input
              type='email'
              placeholder='Email'
              value={contactDetails.email}
              onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
              className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
            />
          </div>
          <div className='w-full'>
            <label className='text-sm font-semibold text-black'>Aadhar ID</label>
            <input
              type='text'
              placeholder='Aadhar ID'
              value={aadharId}
              onChange={(e) => setAadharId(e.target.value)}
              className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
            />
            {/* Patient History Section */}
            {/* {loadingHistory && (
              <p className="text-sm text-gray-500 mt-2">Loading patient history...</p>
            )} */}

            {/* {!loadingHistory && patientHistory.length > 0 && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-black mb-3">
                  Patient History (Read Only)
                </h3>

                
                <select
                  className="w-full rounded-md border border-gray-300 p-2 text-sm mb-3"
                  value={selectedHistory?._id || ""}
                  onChange={(e) => {
                    const record = patientHistory.find(
                      (r) => r._id === e.target.value
                    );
                    setSelectedHistory(record || null);
                  }}
                >
                  <option value="" disabled>
                    Select previous visit
                  </option>

                  {patientHistory.map((record) => (
                    <option key={record._id} value={record._id}>
                      {new Date(record.createdAt).toLocaleDateString()} —{" "}
                      {record.diagnosis?.map((d) => d.name).join(", ") || "No Diagnosis"}
                    </option>
                  ))}
                </select>


               
                {selectedHistory && (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Complaints:</strong>{" "}
                      {selectedHistory.complaints?.map(c => c.name).join(", ") || "—"}
                    </p>
                    <p>
                      <strong>Symptoms:</strong>{" "}
                      {selectedHistory.symptoms?.map(s => s.name).join(", ") || "—"}
                    </p>
                    <p>
                      <strong>Diagnosis:</strong>{" "}
                      {selectedHistory.diagnosis?.map(d => d.name).join(", ") || "—"}
                    </p>
                    <p>
                      <strong>Medications:</strong>{" "}
                      {selectedHistory.medications?.map(m => m.name).join(", ") || "—"}
                    </p>

                    {selectedHistory.followUp?.date && (
                      <p>
                        <strong>Follow-up:</strong>{" "}
                        {selectedHistory.followUp.date}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )} */}


          </div>
          {/* Patient medical history section  */}
          <div className="mt-6   relative mb-5">

            {/* Header + Configure */}
            <div className="flex items-center justify-between ">

              <div className="">
                <SmartSuggestEditor
                  label="Patient Medical History"

                  suggestions={patientHistoryMaster}
                  selected={patientHistory}
                  setSelected={setPatientHistory}
                  disabled={noKnownHistory}
                />


              </div>
              {/* <button
                type="button"
                className="flex items-center gap-1 text-blue-600 text-xs font-medium hover:underline"
                onClick={() => navigate("/settings/patient-history")}
              >
                ⚙ Configure
              </button> */}
            </div>

            {/* No known history */}
            <label className="flex items-center gap-2 text-sm mb-4">
              <input
                type="checkbox"
                checked={noKnownHistory}
                onChange={(e) => {
                  setNoKnownHistory(e.target.checked);
                  if (e.target.checked) setSelectedHistory([]);
                }}
              />
              No known medical history
            </label>




            {/* History options grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 ">
              {historyOptions.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-2 text-sm cursor-pointer ${noKnownHistory ? "text-gray-400" : "text-gray-800"
                    }`}
                >
                  <input
                    type="checkbox"
                    disabled={noKnownHistory}
                    checked={selectedHistory.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPatientHistory(prev => [...prev, { name: item }]);
                      } else {
                        setPatientHistory(prev => prev.filter(h => h.name !== item));
                      }
                    }
                    }
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>


          <div className='flex gap-4'>
            <div className='w-1/2'>
              <label className='text-sm font-semibold text-black'>Date of Birth <span className='text-red-500'>*</span></label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : null;
                  setDate(newDate);
                  setIsAgeManuallyEntered(false);
                }}
              />
            </div>
            <div className='w-1/2'>
              <div className='w-full'>
                <label className='text-sm font-semibold text-black'>Age</label>
                <input
                  type='number'
                  placeholder='Age'
                  value={age}
                  onChange={handleAgeChange}
                  className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                />
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Family Attendee</p>
            <Select value={family} selectedPerson={family} setSelectedPerson={setFamily} datas={[
              { name: "Father" }, { name: "Mother" }, { name: "Spouse" },
              { name: "Sibling" }, { name: "Child" }, { name: "Friend" },
            ]}>
              <div
                className={`flex w-full items-center justify-between rounded-md border border-gray-300 p-2 text-sm font-semibold ${family === "Relation" || family === "" || family === "Select relation" ? "text-gray-400" : "text-black"
                  }`}
              >
                {family === "Relation" || family === "" || family === "Select relation" ? "Select relation" : family}
                <BiChevronDown className='text-lg' />
              </div>
            </Select>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <div className='w-full '>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-semibold text-black'>UHID <span className='text-red-500'>*</span></p>
              <button
                className='rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white'
                onClick={() => setUhid(generateRandomUHID())}
              >
                Generate
              </button>
            </div>
            <div className='relative w-full'>
              <input
                onChange={(e) => setUhid(e.target.value)}
                value={uhid}
                type='text'
                placeholder='Enter Health Id'
                className='w-full rounded-md border border-gray-300 px-3 py-2 pr-28 text-sm font-semibold text-black placeholder-gray-400'
              />
              <button
                className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border border-blue-500 bg-white px-2 py-1 text-xs font-medium text-blue-500'
                onClick={() => setUhid(generateRandomUHID())}
              >
                Get <AiOutlineReload className='text-sm' />
              </button>
            </div>
          </div>
          <div className='w-full'>
            <label className='text-sm font-semibold text-black'>Contact Number</label>
            <input
              type='text'
              placeholder='Contact Number'
              value={contactDetails.primaryContact}
              onChange={(e) => setContactDetails({ ...contactDetails, primaryContact: e.target.value })}
              className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Gender</p>
            <Select selectedPerson={gender} setSelectedPerson={setGender} datas={sortsDatas.genderFilter}>
              <div
                className={`flex w-full items-center justify-between rounded-md border border-gray-300 p-2 text-sm font-semibold ${gender === "Gender" || gender === "" || gender === "Select gender" ? "text-gray-400" : "text-black"
                  }`}
              >
                {gender === "Gender" || gender === "" || gender === "Select gender" ? "Select gender" : gender}
                <BiChevronDown className='text-lg' />
              </div>
            </Select>
          </div>

          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Blood Group</p>
            <Select selectedPerson={bloodGroup} setSelectedPerson={setBloodGroup} datas={[
              { name: "A+" }, { name: "A-" }, { name: "B+" }, { name: "B-" },
              { name: "AB+" }, { name: "AB-" }, { name: "O+" }, { name: "O-" },
            ]}>
              <div
                className={`flex w-full items-center justify-between rounded-md border border-gray-300 p-2 text-sm font-semibold ${bloodGroup === "Blood Group" || bloodGroup === "" ? "text-gray-400" : "text-black"
                  }`}
              >
                {bloodGroup === "Blood Group" || bloodGroup === "" ? "Blood Type..." : bloodGroup}
                <BiChevronDown className='text-lg' />
              </div>
            </Select>
          </div>
        </div>
      </div>

      <p className='text-lg font-semibold text-[#ff6b6b]'>Secondary Contact Details</p>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>Secondary Contact Number</label>
          <input
            type='text'
            placeholder='Secondary Contact Number'
            value={contactDetails.secondaryContact}
            onChange={(e) => setContactDetails({ ...contactDetails, secondaryContact: e.target.value })}
            className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
          />
        </div>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>Landline Number</label>
          <input
            type='text'
            placeholder='Landline Number'
            value={contactDetails.landline}
            onChange={(e) => setContactDetails({ ...contactDetails, landline: e.target.value })}
            className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
          />
        </div>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>Referred By (Facility)</label>
          <Select
            selectedPerson={selectedFacilityName}
            setSelectedPerson={(facilityName) => {
              // Find facility by name to get the ID
              const selectedFacility = facilities.find(f =>
                (f.fullName === facilityName) || (f.businessName === facilityName)
              );
              if (selectedFacility) {
                setSelectedFacilityId(selectedFacility._id);
                setSelectedFacilityName(facilityName);
                // Also update referredBy for backward compatibility
                setReferredBy(selectedFacility.fullName || selectedFacility.businessName || selectedFacility._id);
              }
            }}
            datas={facilities.map(facility => ({
              name: facility.fullName || facility.businessName || facility._id,
              id: facility._id
            }))}
          >
            <div
              className={`flex w-full items-center justify-between rounded-md border border-gray-300 p-2 text-sm font-semibold ${!selectedFacilityName ? "text-gray-400" : "text-black"
                }`}
            >
              {selectedFacilityName || "Select facility"}
              <BiChevronDown className='text-lg' />
            </div>
          </Select>
        </div>

        <div className='flex w-full flex-col gap-2'>
          <p className='text-sm font-semibold text-black'>Language Preference</p>
          <Select selectedPerson={language} setSelectedPerson={setLanguage} datas={[
            { name: "English (Practice Default)" }, { name: "Hindi" }, { name: "Other" },
          ]}>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-2 text-sm font-semibold text-black'>
              {language} <BiChevronDown className='text-lg' />
            </div>
          </Select>
        </div>
      </div>

      <p className='text-lg font-semibold text-[#ff6b6b]'>Address</p>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>Street Address</label>
          <input
            type='text'
            placeholder='Street Address'
            value={address?.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
          />
        </div>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>Locality</label>
          <input
            type='text'
            placeholder='Locality'
            value={address?.locality}
            onChange={(e) => setAddress({ ...address, locality: e.target.value })}
            className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
          />
        </div>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>City</label>
          <input
            type='text'
            placeholder='City'
            value={address?.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
          />
        </div>
        <div className='w-full'>
          <label className='text-sm font-semibold text-black'>Pincode</label>
          <input
            type='text'
            placeholder='Pincode'
            value={address?.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none'
          />
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-4 sm:flex-row'>
        <button
          className='w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 sm:w-1/3'
          onClick={() => isModal && closeModal ? closeModal() : toast.error("Form cancelled")}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className='w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 sm:w-1/3 disabled:opacity-50 disabled:cursor-not-allowed'
          onClick={handleSavePatient}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : (data?.fullName ? "Update" : "Invite")}
        </button>
        {data?.fullName && onDelete && (
          <button
            className='w-full rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 sm:w-1/3 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
          >
            Delete
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Patient</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <strong>{data?.fullName}</strong>? This action cannot be undone and will permanently remove all patient data.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDelete();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalInfo;
