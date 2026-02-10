import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../Layout/Sidebar";
import Header from "../../Layout/Header";
import MainHeader from "../../Layout/MainHeader";
import { Link, useLocation } from "react-router-dom";
import { useOrderStore } from "../../store/useOrderStore";
import SmartSuggestEditor from "../../components/SmartSuggestEditor";
import { diagnosis, symptoms as symptomSuggestions, diagnosisTests as diagnosisTestsMaster } from "../../Assets/Data";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout";

import toast from "react-hot-toast";
import PrescriptionPreview from "./PrescriptionPreview";
import { set } from "react-hook-form";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsGripVertical } from "react-icons/bs";
import { logger } from "../../utils/logger.js";
import ConfigurePadModal from "../../components/Modals/ConfigurePadModal";

const frequencyOptions = [
  "OD", "BD / BID", "TDS / TID", "QID", "Q24H", "Q12H", "Q8H", "Q6H", "AC", "PC", "HS", "BBF", "ABF", "PRN", "STAT", "SOS", "QOD", "BIW", "TIW", "QW", "IM OD", "IV BD", "PO TDS", "SC Q12H"

];

const timingOptions = [
  "Before Meal",
  "After Meal",
  "With Meal",
  "Empty Stomach",
];

const routeOptions = [
  // Enteral Routes
  "PO",
  "SL",
  "BUCC",
  "PR",
  "NG",
  // Parenteral Routes (Injectable)
  "IV",
  "IM",
  "SC",
  "ID",
  "IA",
  "IT",
  "Epid",
  "IO",
  "IC",
  "IP",
  // Inhalational Routes
  "INH",
  "Neb",
  "ENT",
  // Topical Routes
  "Top",
  "OE",
  "AD/AS/AU",
  "IN",
  "Gargle/paint",
  "TD/Patch",
  // Vaginal & Urethral
  "PV",
  "IU",
  // Special Routes
  "IVT",
  "IL",
  "ICav",
];

const NewMedicalRecode = () => {
  const { doctor } = useDoctorAuthStore();
  const { id } = useParams();
  const location = useLocation();
  const record = location.state?.record;
  const patient = location.state?.patient || {};
  const [isViewMode, setIsViewMode] = useState(!!record);
  const [doctorProfile, setDoctorProfile] = useState(null); // Store doctor profile with docRefId
  const [medications, setMedications] = useState([]);
  const [isOrder, setIsOrder] = useState(false);
  const clinicalNotes = ["Patient stable", "Requires further tests"];
  const treatments = ["Rest", "Antibiotics", "Physiotherapy"];

  const [preview, setPreview] = useState(1);
  const [medicationInput, setMedicationInput] = useState("");
  const [selectedMedications, setSelectedMedications] = useState(
    record?.medications.map((med) => ({
      ...med,
      instruction: med.instruction || "",
      quantity: med.quantity || "",
    })) || []
  );

  // Merging symptoms and complains together as per instructions
  const [symptoms, setSymptoms] = useState(
    record?.symptoms?.length
      ? record.symptoms.map((s) => ({
        name: s.name,
        since: s.since || "",
        severity: s.severity || "",
        option: s.option || "",
      }))
      : record?.complaints?.map((c) => ({
        name: c.name,
        since: c.since || "",
        severity: c.severity || "",
        option: c.option || "",
      })) || []
  );

  const [diagnosisList, setDiagnosisList] = useState(
    record?.diagnosis.map((d) => ({
      name: d.name,
      since: d.since || "",
      temperature: d.temperature || "",
      option: d.option || "",
      // price: d.price || "",
    })) || []
  );


  const [diagnosisTestsList, setDiagnosisTestsList] = useState(
    record?.diagnosisTests.map((d) => ({
      name: d.name,
      // since: d.since || "",
      // temperature: d.temperature || "",
      // option: d.option || "",
      // price: d.price || "",
    })) || []
  );

  const [vitals, setVitals] = useState({
    temperature: record?.vitals?.temperature || "",
    height: record?.vitals?.height || "",
    bmi: record?.vitals?.bmi || "",
    weight: record?.vitals?.weight || "",
    sys: record?.vitals?.bloodPressure?.systolic || "",
    dia: record?.vitals?.bloodPressure?.diastolic || "",
    pulse: record?.vitals?.pulse || "",
    respiratoryRate: record?.vitals?.respiratoryRate || "",
    oxygenSaturation: record?.vitals?.oxygenSaturation || "",
  });
  const [notesForPatient, setNotesForPatient] = useState(
    record?.notesForPatient || ""
  );
  const [privateNotes, setPrivateNotes] = useState(record?.privateNotes || "");
  const [followUp, setFollowUp] = useState(
    record?.followUp || { duration: "", date: "", notes: "" }
  );
  const [advices, setAdvices] = useState([
    {
      text: "Home isolation",
      isChecked: record?.advices.includes("Home isolation") || false,
    },
    {
      text: "Steam inhalation",
      isChecked: record?.advices.includes("Steam inhalation") || false,
    },
    {
      text: "Steaming gargling",
      isChecked: record?.advices.includes("Steaming gargling") || false,
    },
    {
      text: `Dr WhatsApp number ${doctor.mobileNumber}`,
      isChecked:
        record?.advices.includes(`Dr WhatsApp number ${doctor.mobileNumber}`) ||
        false,
    },
    {
      text: "Plenty of fluids, rest, and light meals",
      isChecked:
        record?.advices.includes("Plenty of fluids, rest, and light meals") ||
        false,
    },
    {
      text: "Continue existing medications",
      isChecked:
        record?.advices.includes("Continue existing medications") || false,
    },
  ]);
  const [treatmentType, setTreatmentType] = useState(
    record?.treatmentType || ""
  );

  // Configure Pad State
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);

  const defaultPadConfig = [
    { id: "vitals", label: "Vitals", enabled: true },
    { id: "medicalHistory", label: "Patient Medical History", enabled: true },
    { id: "symptoms", label: "Symptoms", enabled: true },
    { id: "diagnosisTest", label: "Investigations", enabled: true },
    { id: "diagnosis", label: "Diagnosis", enabled: true },
    { id: "medications", label: "Medications", enabled: true },

    { id: "notes", label: "Notes", enabled: true },
    { id: "followUp", label: "Follow Up", enabled: true },
    { id: "treatment", label: "Treatment", enabled: true },
  ];

  const [padConfig, setPadConfig] = useState(defaultPadConfig);

  // Derived sectionOrder for rendering (only enabled items)
  const sectionOrder = padConfig.filter(item => item.enabled).map(item => item.id);

  // Load pad config from localStorage
  useEffect(() => {
    // Determine doctor ID
    const currentDoctorId = doctorProfile?.docRefId?._id || doctor?.docRefId?._id || doctor?._id || doctor?.id;

    if (!currentDoctorId) return;

    const storageKey = `medicalRecordPadConfig_${currentDoctorId}`;
    try {
      const savedConfig = localStorage.getItem(storageKey);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        if (Array.isArray(parsedConfig)) {
          // Merge with default to ensure all fields exist (in case of updates)
          const mergedConfig = defaultPadConfig.map(defaultItem => {
            const savedItem = parsedConfig.find(p => p.id === defaultItem.id);
            return savedItem ? { ...defaultItem, ...savedItem } : defaultItem;
          });
          setPadConfig(mergedConfig);
        }
      }
    } catch (e) {
      console.error("Error loading pad config", e);
    }
  }, [doctor?._id, doctor?.id, doctorProfile?.docRefId?._id]);


  const handleSaveConfig = (newConfig) => {
    setPadConfig(newConfig);
    setIsConfigureModalOpen(false);

    const currentDoctorId = doctorProfile?.docRefId?._id || doctor?.docRefId?._id || doctor?._id || doctor?.id;
    if (currentDoctorId) {
      const storageKey = `medicalRecordPadConfig_${currentDoctorId}`;
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
    }
  };

  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragStartAllowedRef = useRef(false);

  // Drag and drop handlers
  const handleDragStart = (e, sectionKey) => {
    if (isViewMode) {
      e.preventDefault();
      return false;
    }

    // Check if drag was allowed from mouse down
    if (!dragStartAllowedRef.current) {
      e.preventDefault();
      return false;
    }

    // Reset the flag
    dragStartAllowedRef.current = false;

    // Allow the drag
    setDraggedSection(sectionKey);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", sectionKey);

    // Set opacity for visual feedback
    const section = e.currentTarget;
    if (section) {
      section.style.opacity = "0.5";
    }

    return true;
  };

  // Handle mouse down - check if drag should be allowed
  const handleSectionMouseDown = (e, sectionKey) => {
    if (isViewMode) return;

    const target = e.target;

    // Prevent drag if clicking on inputs, buttons, or other interactive elements
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      dragStartAllowedRef.current = false;
      return;
    }

    // Allow drag from grip icon, grip icon container, or header (h3 or section-header)
    const isGripIcon = target.closest('.grip-icon') || target.closest('.grip-icon-container');
    const headerArea = target.closest('.section-header') || target.closest('h3') || target.tagName === 'H3';

    // If from grip or header, allow drag
    if (isGripIcon || headerArea) {
      dragStartAllowedRef.current = true;
    } else {
      dragStartAllowedRef.current = false;
    }
  };

  const handleDragEnd = (e) => {
    // Reset opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedSection(null);
    setDragOverIndex(null);
    dragStartAllowedRef.current = false;
  };

  const handleDragOver = (e, index) => {
    if (isViewMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    if (isViewMode || !draggedSection) return;
    e.preventDefault();

    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);

    if (draggedIndex !== dropIndex) {
      // Remove the dragged section from its current position
      newOrder.splice(draggedIndex, 1);
      // Insert it at the new position
      newOrder.splice(dropIndex, 0, draggedSection);

      // Update state
      // setSectionOrder(newOrder); // This was previous logic

      // New Logic: Update padConfig based on newSectionOrder
      // We move the dragged item to the new position in the ENABLED list
      // And construct a new padConfig that respects this order

      try {
        const newVisibleIds = newOrder;
        const newConfig = [];
        const hiddenItems = padConfig.filter(i => !i.enabled);

        // Add enabled items in new order
        newVisibleIds.forEach(id => {
          const item = padConfig.find(p => p.id === id);
          if (item) newConfig.push(item);
        });

        const finalConfig = [...newConfig, ...hiddenItems];

        setPadConfig(finalConfig);

        // Save to localStorage immediately
        const currentDoctorId = doctorProfile?.docRefId?._id || doctor?.docRefId?._id || doctor?._id || doctor?.id;
        if (currentDoctorId) {
          const storageKey = `medicalRecordPadConfig_${currentDoctorId}`;
          localStorage.setItem(storageKey, JSON.stringify(finalConfig));
        }
      } catch (error) {
        console.error("Error saving pad config to localStorage:", error);
      }
    }

    setDraggedSection(null);
    setDragOverIndex(null);
  };
  const [attachments, setAttachments] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [servicesData, setServicesData] = useState([]);

  // Patient search state
  const [patientData, setPatientData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(patient || null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient || null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services`,
        {
          credentials: "include",
        }
      );
      const json = await response.json();
      setServicesData(json);
    } catch (e) { }
  };

  // Fetch patients list
  const fetchPatients = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients`,
        { credentials: "include" }
      );
      const json = await res.json();
      setPatientData(json || []);
    } catch (e) {
      console.log("Error fetching patients:", e);
    }
  };

  // Fetch doctor profile to get docRefId
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!doctor?._id) return;

      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getDoctorProfile/${doctor._id}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (json.data) {
          setDoctorProfile(json.data);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };

    fetchDoctorProfile();
  }, [doctor?._id]);

  useEffect(() => {
    fetchData();
    fetchPatients();
    setTreatmentType(record?.treatmentType || "");
    // Initialize patient if passed via location state (only if not already set by user selection)
    if (patient && Object.keys(patient).length > 0 && !selectedPatient) {
      const locationPatient = {
        fullName: patient.fullName || patient.title || "",
        _id: patient._id || "",
        email: patient.email || "",
        phone: patient.phone || patient.mobileNumber || "",
        image: patient.image || "",
      };
      setSelectedPatient(locationPatient);
      setCurrentPatient(locationPatient);
    }
  }, []);

  // Patient search handlers
  const filteredPatients = (patientData || []).filter((user) =>
    (user.fullName || user.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = async (user) => {
    try {
      // Fetch full patient details if we have the patient ID
      let fullPatientData = user;
      if (user._id) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/${user._id}`,
            { credentials: "include" }
          );
          if (response.ok) {
            const fullData = await response.json();
            fullPatientData = fullData || user;
          }
        } catch (error) {
          console.log("Error fetching full patient details:", error);
          // Use the user data we have
        }
      }

      const selected = {
        fullName: fullPatientData.fullName || fullPatientData.title || user.fullName || user.title || "",
        _id: fullPatientData._id || user._id || "",
        email: fullPatientData.email || user.email || "",
        phone: fullPatientData.phone || fullPatientData.mobileNumber || user.phone || user.mobileNumber || "",
        image: fullPatientData.image || user.image || "",
        gender: fullPatientData.gender || user.gender || "",
        age: fullPatientData.age || user.age || "",
        uhid: fullPatientData.uhid || user.uhid || "",
        contactDetails: fullPatientData.contactDetails || user.contactDetails || {
          email: fullPatientData.email || user.email || "",
          primaryContact: fullPatientData.phone || fullPatientData.mobileNumber || fullPatientData.contactDetails?.primaryContact || user.phone || user.mobileNumber || "",
          secondaryContact: fullPatientData.contactDetails?.secondaryContact || user.contactDetails?.secondaryContact || "",
          landline: fullPatientData.contactDetails?.landline || user.contactDetails?.landline || "",
        },
      };
      // Explicitly set both states to ensure the selected patient is used
      setSelectedPatient(selected);
      setCurrentPatient(selected);
      setDropdownVisible(false);
      setSearchQuery(""); // Clear search query but keep selected patient name visible

      console.log("Patient selected for medical record:", selected);
    } catch (error) {
      console.error("Error selecting patient:", error);
      toast.error("Error loading patient details");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Clear selected patient if user starts typing
    if (value && selectedPatient) {
      setSelectedPatient(null);
      setCurrentPatient(null);
    }
    setDropdownVisible(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (medicationInput.length >= 1) {
        fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medicines/search?query=${medicationInput}`
        )
          .then((res) => res.json())
          .then((data) => {
            setMedications(data);
            setShowSuggestions(true);
          });
      } else {
        setMedications([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [medicationInput]);

  const handleAddMedication = (med) => {
    const newMed = {
      ...med,
      frequency: "",
      route: "",
      timing: "",
      duration: "",
      instruction: "",
      quantity: "",
      price: "",
    };
    setSelectedMedications([...selectedMedications, newMed]);
    setMedicationInput("");
  };

  const handleAddNewMedication = () => {
    if (medicationInput.trim() === "") return;

    const newMed = {
      name: medicationInput,
      composition: "",
      frequency: "",
      route: "",
      timing: "",
      duration: "",
      instruction: "",
      quantity: "",
      price: "",
      measure: "",
      stock: 0,
    };
    setSelectedMedications([...selectedMedications, newMed]);
    setMedicationInput("");
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...selectedMedications];
    updatedMeds[index][field] = value;
    setSelectedMedications(updatedMeds);
  };

  const removeMedication = (index) => {
    const updatedMeds = selectedMedications.filter((_, i) => i !== index);
    setSelectedMedications(updatedMeds);
  };

  const handleAdviceChange = (index) => {
    const updatedAdvices = [...advices];
    updatedAdvices[index].isChecked = !updatedAdvices[index].isChecked;
    setAdvices(updatedAdvices);
  };

  // Get array of checked advice texts
  const selectedAdvices = advices
    .filter((advice) => advice.isChecked)
    .map((advice) => advice.text);

  // Calculate follow-up date based on duration
  const calculateFollowUpDate = (duration) => {
    const days = parseInt(duration);
    if (!isNaN(days)) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + days);
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "2-digit",
      });
    }
    return "";
  };

  // Handle duration change
  const handleDurationChange = (e) => {
    const duration = e.target.value;
    const calculatedDate = calculateFollowUpDate(duration);
    setFollowUp({ ...followUp, duration, date: calculatedDate });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );
    if (validFiles.length < files.length) {
      toast.error("Only JPEG and PNG images are accepted");
    }
    setAttachments([...attachments, ...validFiles]);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(updatedAttachments);
  };

  const navigate = useNavigate();

  const handleCreateMedicalRecord = async () => {
    // Validate patient is selected - prioritize selectedPatient (from search) over location state patient
    const finalSelectedPatient = selectedPatient || currentPatient;

    if (!isViewMode && !finalSelectedPatient && !id) {
      toast.error("Please select a patient first");
      return;
    }

    try {
      const addOrder = useOrderStore.getState().addOrder;
      const validMedications = selectedMedications.filter(
        (med) => med && med.name && typeof med.name === "string"
      );

      // Determine patient ID - prioritize selectedPatient (from search) over location state patient or URL param
      // This ensures if user selects a different patient, that one is used
      const patientId = finalSelectedPatient?._id || id;

      if (!patientId) {
        toast.error("Patient ID is missing. Please select a patient.");
        return;
      }

      console.log("Creating medical record for patient:", {
        selectedPatient: selectedPatient,
        currentPatient: currentPatient,
        locationPatient: patient,
        urlParamId: id,
        finalPatientId: patientId
      });

      // Prepare form data
      const formData = new FormData();
      formData.append(
        "medicalRecord",
        JSON.stringify({
          patientId: patientId,
          vitals: {
            ...vitals,
            bloodPressure: {
              systolic: vitals.sys,
              diastolic: vitals.dia,
            },
            pulse: vitals.pulse,
            respiratoryRate: vitals.respiratoryRate,
            oxygenSaturation: vitals.oxygenSaturation,
          },
          symptoms: symptoms,
          diagnosis: diagnosisList,
          diagnosisTests: diagnosisTestsList.map(d => ({
            name: d.name || d,
          })),
          medications: validMedications,
          complaints: [],
          notesForPatient,
          privateNotes,
          followUp,
          advices: selectedAdvices,
          treatmentType,
          isOrder,
        })
      );
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-records/create`,
        {
          method: "POST",
          credentials: "include",
          body: formData, // Send FormData directly
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Medical record created successfully");

        addOrder({
          orderId: Math.random().toString(36).slice(2, 10).toUpperCase(), // mock ID
          date: new Date().toLocaleDateString(),
          patient: {
            name: "John Doe", // You can replace with actual patient data
            avatar: "https://i.pravatar.cc/300",
          },
          address: "New Delhi, India",
          bill: {
            mrp: validMedications.length * 20,
            total: validMedications.length * 20 * 0.9 + 2 + 1, // mock calculation
          },
        });

        setAttachments([]);
        // Navigate to patient preview with the correct patient ID (use the patient for whom record was created)
        const patientIdToNavigate = finalSelectedPatient?._id || id;
        if (patientIdToNavigate) {
          navigate(`/patients/preview/${patientIdToNavigate}`);
        } else {
          navigate(`/patients`);
        }
      } else {
        toast.error(result.message || "Failed to create medical record");
      }
    } catch (error) {
      logger.error("Error creating medical record:", error);
      toast.error("Something went wrong while creating medical record");
    }
  };
  useEffect(() => {
    const heightCm = parseFloat(vitals.height);
    const weightKg = parseFloat(vitals.weight);

    if (heightCm > 0 && weightKg > 0) {
      const heightM = heightCm / 100;
      const bmiValue = (weightKg / (heightM * heightM)).toFixed(1);

      // Update BMI only if changed (prevents extra re-renders)
      if (vitals.bmi !== bmiValue) {
        setVitals((prev) => ({
          ...prev,
          bmi: bmiValue,
        }));
      }
    } else {
      // Clear BMI if height or weight missing
      if (vitals.bmi !== "") {
        setVitals((prev) => ({
          ...prev,
          bmi: "",
        }));
      }
    }
  }, [vitals.height, vitals.weight]);

  console.log("RAW diagnosisTestsList:", diagnosisTestsList);


  return (
    <Layout>
      {preview == 1 ? (
        <div className='flex min-h-screen flex-col bg-gray-100'>
          {/* Back Button */}
          <div className="px-4 pt-2 pb-1 flex flex-row items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-dashed border-subMain bg-white px-2 py-1 shadow hover:bg-gray-50 transition flex items-center gap-2"
            >
              <IoArrowBackOutline size={20} />

            </button>
            <h2 className='pt-4 mb-4 text-2xl font-semibold text-gray-800'>
              {isViewMode ? "View Medical Record" : "Medical Record"}
            </h2>
            <button
              onClick={() => setIsConfigureModalOpen(true)}
              className='justify-end flex-end ml-auto rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition'
            >
              Configure Pad
            </button>
          </div>

          <div className='flex flex-1 flex-col'>
            <div className='overflow-auto p-4 sm:p-6'>
              <div className='rounded-lg bg-white p-6 shadow'>
                {/* <h2 className='mb-4 text-2xl font-semibold text-gray-800'>
                  {isViewMode ? "View Medical Record" : "Medical Record"}
                </h2> */}

                {/* Patient Search Bar - Always visible when not in view mode */}
                {!isViewMode && (
                  <div className='mb-6'>
                    <div className='flex w-full flex-col gap-2'>
                      <p className='text-sm font-semibold text-black'>Patient Name</p>
                      {/* Search input - always visible */}
                      <div className="w-full relative">
                        <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                          <FaMagnifyingGlass className="text-gray-400 mr-2" style={{ fontSize: '14px' }} />
                          <input
                            type="text"
                            placeholder="Search Patient"
                            className="w-full border-none outline-none text-sm text-gray-600 placeholder:text-sm placeholder:text-gray-400"
                            value={searchQuery || (selectedPatient ? (selectedPatient?.fullName || selectedPatient?.title || "") : "")}
                            onChange={handleInputChange}
                            onBlur={() => {
                              setTimeout(() => {
                                // Only hide dropdown if no search query
                                if (!searchQuery) {
                                  setDropdownVisible(false);
                                }
                              }, 200);
                            }}
                            onFocus={() => {
                              setDropdownVisible(true);
                              // Clear the input to show search when focusing, unless there's a query
                              if (selectedPatient && !searchQuery) {
                                setSearchQuery("");
                              }
                            }}
                          />
                        </div>

                        {searchQuery && dropdownVisible && (
                          <div className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 shadow-lg bg-white">
                            {filteredPatients.length === 0 ? (
                              <p className="p-2 text-xs text-gray-500">No results found</p>
                            ) : (
                              filteredPatients.map((user) => (
                                <div
                                  key={user._id || user.id}
                                  className="cursor-pointer p-2 hover:bg-gray-100"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectPatient(user);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-600 font-medium">
                                        {(user?.fullName || user?.title || "P")?.charAt(0)?.toUpperCase() || "P"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{user.fullName || user.title}</p>
                                      <p className="text-xs text-gray-500">{user.email || ""}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Render sections based on order */}
                {sectionOrder.map((sectionKey, index) => {
                  // Render Vitals
                  if (sectionKey === "vitals") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg border bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <div className='section-header mb-4 flex items-center'>
                          {!isViewMode && (
                            <div className="grip-icon-container flex items-center justify-center mr-2">
                              <BsGripVertical
                                className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                style={{ fontSize: '18px' }}
                              />
                            </div>
                          )}
                          <span className='mr-2 h-5 w-5 rounded-full bg-[#9b59b6]'></span>
                          <h3 className='text-md font-semibold'>Vitals</h3>
                        </div>

                        {/* First row - Temperature, Height, BMI */}
                        <div className='mb-4 grid grid-cols-3 gap-4'>
                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Body Weight (kg)
                            </label>
                            <input
                              type='number'
                              placeholder='70'
                              value={vitals.weight}
                              onChange={(e) =>
                                setVitals({ ...vitals, weight: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Body Height (cm)
                            </label>
                            <input
                              type='number'
                              placeholder='170'
                              value={vitals.height}
                              onChange={(e) =>
                                setVitals({ ...vitals, height: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Body Mass Index (kg/m²)
                            </label>
                            <input
                              type="number"
                              placeholder="Auto calculated"
                              value={vitals.bmi}
                              readOnly
                              className="w-full rounded border border-gray-300 p-2 text-sm bg-gray-100 cursor-not-allowed"
                            />

                          </div>
                        </div>

                        {/* Second row - Temperature & BP */}
                        <div className='grid grid-cols-3 gap-4'>
                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Body Temperature (°F)
                            </label>
                            <input
                              type='number'
                              placeholder='98.6'
                              value={vitals.temperature}
                              onChange={(e) =>
                                setVitals({ ...vitals, temperature: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Blood Pressure (Systolic) (mmHg)
                            </label>
                            <input
                              type='number'
                              placeholder='120'
                              value={vitals.sys}
                              onChange={(e) =>
                                setVitals({ ...vitals, sys: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Blood Pressure (Diastolic) (mmHg)
                            </label>
                            <input
                              type='number'
                              placeholder='80'
                              value={vitals.dia}
                              onChange={(e) =>
                                setVitals({ ...vitals, dia: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>
                        </div>

                        {/* Third row - Pulse, Respiratory Rate & SpO2 */}
                        <div className='mt-4 grid grid-cols-3 gap-4'>
                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Pulse Rate (bpm)
                            </label>
                            <input
                              type='number'
                              placeholder='72'
                              value={vitals.pulse}
                              onChange={(e) =>
                                setVitals({ ...vitals, pulse: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Respiratory Rate (breaths/min)
                            </label>
                            <input
                              type='number'
                              placeholder='18'
                              value={vitals.respiratoryRate}
                              onChange={(e) =>
                                setVitals({ ...vitals, respiratoryRate: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block text-xs font-semibold text-gray-600'>
                              Oxygen Saturation (%)
                            </label>
                            <input
                              type='number'
                              placeholder='98'
                              value={vitals.oxygenSaturation}
                              onChange={(e) =>
                                setVitals({ ...vitals, oxygenSaturation: e.target.value })
                              }
                              disabled={isViewMode}
                              className='w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Complains
                  //   if (sectionKey === "complains") {
                  //     return (
                  //       <div
                  //         key={sectionKey}
                  //         draggable={!isViewMode}
                  //         onDragStart={(e) => handleDragStart(e, sectionKey)}
                  //         onDragEnd={handleDragEnd}
                  //         onDragOver={(e) => handleDragOver(e, index)}
                  //         onDragLeave={handleDragLeave}
                  //         onDrop={(e) => handleDrop(e, index)}
                  //         onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                  //         className={`mb-6 rounded-lg border bg-white p-4 shadow transition-all ${
                  //           dragOverIndex === index && draggedSection !== sectionKey
                  //             ? "border-blue-500 border-2"
                  //             : ""
                  //         } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                  //       >
                  //   <SmartSuggestEditor
                  //     label='Complains'
                  //     color='#e67e22'
                  //     suggestions={symptoms}
                  //     selected={complainList}
                  //     setSelected={setComplainList}
                  //     disabled={isViewMode}
                  //           gripIcon={!isViewMode ? (
                  //             <BsGripVertical 
                  //               className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" 
                  //               style={{ fontSize: '18px' }}
                  //             />
                  //           ) : null}
                  //   />
                  // </div>
                  //     );
                  //   }

                  // Render Symptoms
                  if (sectionKey === "symptoms") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg border bg-white p-4 shadow ${dragOverIndex === index ? "border-blue-500 border-2" : ""
                          }`}
                      >
                        <SmartSuggestEditor
                          label="Symptoms / Complaints"
                          color="#3498db"
                          suggestions={symptomSuggestions}
                          selected={symptoms}
                          setSelected={setSymptoms}
                          disabled={isViewMode}
                          gripIcon={
                            !isViewMode ? (
                              <BsGripVertical className="grip-icon text-gray-400 cursor-grab" />
                            ) : null
                          }
                        />
                      </div>
                    );
                  }
                  // Render Diagnosis Test
                  if (sectionKey === "diagnosisTest") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg border bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <SmartSuggestEditor
                          label='Diagnosis Tests'
                          color='#9b59b6'
                          suggestions={diagnosisTestsMaster}   // ✅ master list
                          selected={diagnosisTestsList}
                          setSelected={setDiagnosisTestsList}
                          disabled={isViewMode}
                          gripIcon={!isViewMode ? (
                            <BsGripVertical
                              className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                              style={{ fontSize: '18px' }}
                            />
                          ) : null}
                        />
                      </div>
                    );
                  }


                  // Render Diagnosis 
                  if (sectionKey === "diagnosis") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg border bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <SmartSuggestEditor
                          label='Diagnosis'
                          color='#CA8A04'
                          suggestions={diagnosis}
                          selected={diagnosisList}
                          setSelected={setDiagnosisList}
                          disabled={isViewMode}
                          gripIcon={!isViewMode ? (
                            <BsGripVertical
                              className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                              style={{ fontSize: '18px' }}
                            />
                          ) : null}
                        />
                      </div>
                    );
                  }

                  // Render Medications
                  if (sectionKey === "medications") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <div className='mb-6'>
                          <div className='section-header mb-2 flex items-center'>
                            {!isViewMode && (
                              <div className="grip-icon-container flex items-center justify-center mr-2">
                                <BsGripVertical
                                  className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                  style={{ fontSize: '18px' }}
                                />
                              </div>
                            )}
                            <span className='mr-2 h-5 w-5 rounded-full bg-red-600'></span>
                            <h3 className='text-md mr-2 font-medium'>Medications</h3>

                            {/* Delivery Pincode Section */}
                            {/* <div className='ml-4 flex items-center gap-1 text-sm text-gray-600'>
                        <span className='text-gray-500'>📍</span>
                        <span>Delivery Pincode:</span>
                        <input
                          type='text'
                          placeholder='Pincode'
                          className='w-[80px] rounded border border-gray-300 px-2 py-1 text-sm'
                          disabled={isViewMode}
                        />
                        <button className='ml-1 rounded border border-gray-300 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50'>
                          🔄 Check
                        </button>
                      </div> */}

                            {/* <div className='ml-auto'>
                        <Link to='/add-medicine'>
                          <button className='rounded bg-blue-500 px-4 py-1 text-sm text-white hover:bg-blue-600'>
                            Add
                          </button>
                        </Link>
                      </div> */}
                          </div>

                          {selectedMedications.map((med, index) => (
                            <div
                              key={index}
                              className='mb-3 rounded border bg-gray-50 p-4 shadow-sm'
                            >
                              <div className='grid grid-cols-7 items-center gap-3'>
                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Medicine
                                  </label>
                                  <input
                                    value={med.name}
                                    className='w-full rounded border p-2 text-sm'
                                    readOnly
                                  />
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Frequency
                                  </label>
                                  <select
                                    value={med.frequency}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "frequency",
                                        e.target.value
                                      )
                                    }
                                    className='w-full rounded border p-2 text-sm'
                                  >
                                    <option value=''>Select</option>
                                    {frequencyOptions.map((opt, i) => (
                                      <option key={i} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Route
                                  </label>
                                  <select
                                    value={med.route}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "route",
                                        e.target.value
                                      )
                                    }
                                    className='w-full rounded border p-2 text-sm'
                                  >
                                    <option value=''>Select</option>
                                    {routeOptions.map((opt, i) => (
                                      <option key={i} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Timing
                                  </label>
                                  <select
                                    value={med.timing}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "timing",
                                        e.target.value
                                      )
                                    }
                                    className='w-full rounded border p-2 text-sm'
                                  >
                                    <option value=''>Select</option>
                                    {timingOptions.map((opt, i) => (
                                      <option key={i} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Duration
                                  </label>
                                  <input
                                    placeholder='e.g. 3 Days'
                                    value={med.duration}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                    disabled={isViewMode}
                                    className='w-full rounded border p-2 text-sm'
                                  />
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Instruction
                                  </label>
                                  <input
                                    placeholder='Instructions'
                                    value={med.instruction}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "instruction",
                                        e.target.value
                                      )
                                    }
                                    disabled={isViewMode}
                                    className='w-full rounded border p-2 text-sm'
                                  />
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Quantity
                                  </label>
                                  <input
                                    placeholder='e.g. 1 Strip'
                                    value={med.quantity}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    disabled={isViewMode}
                                    className='w-full rounded border p-2 text-sm'
                                  />
                                </div>

                                <div>
                                  <label className='mb-1 block text-xs font-semibold'>
                                    Price
                                  </label>
                                  <input
                                    placeholder='Enter price'
                                    value={med.price}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        index,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    disabled={isViewMode}
                                    className='w-full rounded border p-2 text-sm'
                                  />
                                </div>
                              </div>

                              <div className='mt-2 text-xs text-gray-500'>
                                {med.composition}
                              </div>
                              <div className='mt-2 flex items-center justify-between'>
                                <div className='cursor-pointer text-sm text-blue-600'>
                                  Edit Name
                                </div>
                                <div className='cursor-pointer text-sm text-blue-600'>
                                  + Tapering Dose
                                </div>
                                <div
                                  className='cursor-pointer text-sm text-red-600'
                                  onClick={() => removeMedication(index)}
                                >
                                  🗑️
                                </div>
                              </div>
                            </div>
                          ))}

                          <input
                            type='text'
                            value={medicationInput}
                            placeholder='Start typing medicine'
                            onChange={(e) => setMedicationInput(e.target.value)}
                            disabled={isViewMode}
                            className='w-full rounded border border-gray-300 p-2 shadow'
                          />

                          {medicationInput && (
                            <div className='mt-1 rounded border bg-white shadow'>
                              {medications
                                .filter((med) =>
                                  med.name
                                    .toLowerCase()
                                    .includes(medicationInput.toLowerCase())
                                )
                                .map((med, index) => (
                                  <div
                                    key={index}
                                    className='cursor-pointer border-b p-2 hover:bg-gray-100'
                                    onClick={() => handleAddMedication(med)}
                                  >
                                    <div className='font-medium'>{med.name}</div>
                                    <div className='text-sm text-gray-500'>
                                      {med.composition}
                                    </div>
                                  </div>
                                ))}
                              {!medications.some((med) =>
                                med.name
                                  .toLowerCase()
                                  .includes(medicationInput.toLowerCase())
                              ) && (
                                  <div className='p-2'>
                                    <div
                                      className='cursor-pointer rounded-md bg-blue-100 px-4 py-1 text-sm transition hover:bg-blue-200'
                                      onMouseDown={() => handleAddNewMedication()}
                                    >
                                      + Add "{medicationInput}"
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Render Notes
                  if (sectionKey === "notes") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <div className='mb-6'>
                          <div className='section-header mb-2 flex items-center'>
                            {!isViewMode && (
                              <div className="grip-icon-container flex items-center justify-center mr-2">
                                <BsGripVertical
                                  className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                  style={{ fontSize: '18px' }}
                                />
                              </div>
                            )}
                            <span className='mr-2 h-5 w-5 rounded-full bg-green-600'></span>
                            <h3 className='text-md font-medium'>Notes</h3>
                          </div>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <label className='mb-1 block text-xs font-semibold text-gray-600'>
                                NOTES FOR PATIENT (TREATMENT/SURGICAL/OTHERS)
                              </label>
                              <textarea
                                placeholder='Add notes for patient'
                                className='w-full rounded-lg border border-gray-200 p-4 shadow focus:outline-none focus:ring-2 focus:ring-blue-500'
                                rows={5}
                                value={notesForPatient}
                                onChange={(e) => {
                                  setNotesForPatient(e.target.value);
                                }}
                                disabled={isViewMode}
                              />
                            </div>

                            <div>
                              <div className='mb-1 flex items-center justify-between'>
                                <label className='text-xs font-semibold text-gray-600'>
                                  PRIVATE NOTES
                                </label>
                                <span className='flex items-center gap-1 text-xs text-gray-400'>
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M13 16h-1v-4h-1m1-4h.01M12 6.253v.01'
                                    />
                                  </svg>
                                  These will not be printed
                                </span>
                              </div>
                              <textarea
                                placeholder='Add private notes'
                                className='w-full rounded-lg border border-gray-200 p-4 shadow focus:outline-none focus:ring-2 focus:ring-blue-500'
                                rows={5}
                                value={privateNotes}
                                onChange={(e) => {
                                  setPrivateNotes(e.target.value);
                                }}
                                disabled={isViewMode}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Follow Up
                  if (sectionKey === "followUp") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <div className='mt-6 grid grid-cols-2 gap-6'>
                          <div className='mb-6'>
                            <div className='section-header mb-2 flex items-center'>
                              {!isViewMode && (
                                <div className="grip-icon-container flex items-center justify-center mr-2">
                                  <BsGripVertical
                                    className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                    style={{ fontSize: '18px' }}
                                  />
                                </div>
                              )}
                              <span className='mr-2 h-5 w-5 rounded-full bg-purple-600'></span>
                              <h3 className='text-md font-semibold'>Follow Up</h3>
                            </div>

                            <input
                              type='text'
                              placeholder='60 Days'
                              className='mb-2 w-full rounded-md border p-2 shadow-sm'
                              value={followUp.duration}
                              onChange={handleDurationChange}
                              disabled={isViewMode}
                            />

                            <div className='mb-2 flex items-center justify-between'>
                              <span className='text-sm font-semibold text-red-600'>
                                {followUp.date || "Select duration to calculate date"}
                              </span>
                              <label className='flex items-center gap-1 text-sm'>
                                <input
                                  type='checkbox'
                                  className='form-checkbox text-blue-500'
                                />
                                Auto Fill from Rx
                              </label>
                            </div>

                            <textarea
                              placeholder='Add notes'
                              rows={3}
                              className='w-full rounded-md border border-gray-300 p-2 shadow-sm'
                              value={followUp.notes}
                              onChange={(e) => {
                                setFollowUp({ ...followUp, notes: e.target.value });
                              }}
                              disabled={isViewMode}
                            />
                          </div>

                          <div className='rounded-lg border border-gray-200 p-4 shadow-sm'>
                            <div className='-ml-1 mb-2 flex items-center justify-between'>
                              <div className='flex items-center'>
                                <span
                                  className='mr-2 h-5 w-5 rounded-full'
                                  style={{ backgroundColor: "#9333EA" }}
                                ></span>
                                <h3 className='text-md font-semibold'>Advices</h3>
                              </div>
                              <label className='flex items-center gap-1 text-sm'>
                                <input
                                  type='checkbox'
                                  className='form-checkbox text-blue-500'
                                />
                                Enable Translations
                              </label>
                            </div>

                            <div className='mb-2 flex items-center space-x-2 rounded border border-gray-300 p-1'>
                              <button className='text-sm font-bold'>B</button>
                              <button className='text-sm italic'>I</button>
                              <button className='text-sm'>•</button>
                              <button className='ml-auto text-sm text-gray-500'>
                                ⤢
                              </button>
                            </div>

                            <div className='max-h-[140px] space-y-2 overflow-y-auto pr-2'>
                              {advices.map((advice, index) => (
                                <div key={index} className='flex items-start gap-2'>
                                  <input
                                    type='checkbox'
                                    className='form-checkbox mt-1 text-blue-500'
                                    checked={advice.isChecked}
                                    onChange={() => handleAdviceChange(index)}
                                    disabled={isViewMode}
                                  />
                                  <span className='text-sm'>{advice.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Treatment
                  if (sectionKey === "treatment") {
                    return (
                      <div
                        key={sectionKey}
                        draggable={!isViewMode}
                        onDragStart={(e) => handleDragStart(e, sectionKey)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseDown={(e) => handleSectionMouseDown(e, sectionKey)}
                        className={`mb-6 rounded-lg bg-white p-4 shadow transition-all ${dragOverIndex === index && draggedSection !== sectionKey
                          ? "border-blue-500 border-2"
                          : ""
                          } ${draggedSection === sectionKey ? "opacity-50" : ""}`}
                      >
                        <div className='section-header mb-2 flex items-center'>
                          {!isViewMode && (
                            <div className="grip-icon-container flex items-center justify-center mr-2">
                              <BsGripVertical
                                className="grip-icon text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                style={{ fontSize: '18px' }}
                              />
                            </div>
                          )}
                          <span className='mr-2 h-5 w-5 rounded-full bg-yellow-600'></span>
                          <h3 className='text-md font-medium'>Treatment</h3>
                          {/* <div className='ml-auto'>
                      <Link to='/add-service'>
                        <button className='rounded bg-blue-500 px-4 py-1 text-sm text-white hover:bg-blue-600'>
                          Add
                        </button>
                      </Link>
                    </div> */}
                        </div>

                        <select
                          onChange={(e) => {
                            setTreatmentType(e.target.value);
                          }}
                          value={treatmentType}
                          disabled={isViewMode}
                          className='w-full rounded-lg border border-gray-200 p-4 shadow focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value=''>Select treatment type</option>
                          {servicesData?.map((service, index) => {
                            return (
                              <option key={index} value={service.serviceName}>
                                {service.serviceName}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Upload */}
                {!isViewMode && (
                  <div className='mb-6'>
                    <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-gray-400'>
                      <label className='block cursor-pointer text-center text-gray-400'>
                        <span className='mb-2 inline-block'>
                          📎 Upload images
                        </span>
                        <input
                          type='file'
                          accept='image/jpeg,image/png'
                          multiple
                          onChange={handleFileChange}
                          className='hidden'
                        />
                        <p className='text-sm'>
                          (Only *.jpeg and *.png images accepted)
                        </p>
                      </label>
                      {attachments.length > 0 && (
                        <div className='mt-4'>
                          <h4 className='text-sm font-semibold text-gray-600'>
                            Selected Files:
                          </h4>
                          <ul className='mt-2 space-y-2'>
                            {attachments.map((file, index) => (
                              <li
                                key={index}
                                className='flex items-center justify-between text-sm text-gray-600'
                              >
                                <span>{file.name}</span>
                                <button
                                  onClick={() => removeAttachment(index)}
                                  className='text-red-600 hover:text-red-800'
                                >
                                  🗑️
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Save */}

                {!isViewMode && (
                  <div className='mt-6 flex justify-end gap-4'>
                    {/* Save and Order Button */}
                    {/* <button
                      onClick={async () => {
                        setIsOrder(true);
                        setPreview(2);
                      }}
                      className='rounded bg-[#0097DB] px-6 py-2 text-white transition hover:bg-blue-600'
                    >
                      Save and Order
                    </button> */}

                    {/* Save and Next Button */}
                    <button
                      onClick={async () => {
                        setIsOrder(false);
                        setPreview(2);
                      }}
                      className='rounded bg-green-600 px-6 py-2 text-white transition hover:bg-green-700'
                    >
                      Save and Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <PrescriptionPreview
          patient={selectedPatient || currentPatient || patient}
          doctor={doctor}
          complaints={symptoms}
          vitals={vitals}
          symptoms={symptoms}
          diagnosis={diagnosisList}
          diagnosisTests={diagnosisTestsList}
          medications={selectedMedications}
          advices={advices}
          followUp={followUp}
          notesForPatient={notesForPatient}
          privateNotes={privateNotes}
          treatmentType={treatmentType}
          onBack={() => setPreview(1)}
          onSaveTemplate={() => {
            console.log("Save Template");
          }}
          onAction={async () => {
            await handleCreateMedicalRecord();
          }}
        />
      )}
      <ConfigurePadModal
        isOpen={isConfigureModalOpen}
        closeModal={() => setIsConfigureModalOpen(false)}
        currentConfig={padConfig}
        onSave={handleSaveConfig}
      />
    </Layout>
  );
};

export default NewMedicalRecode;
