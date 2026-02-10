// Qualification.js
import React, { useEffect, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { LuFolderUp } from "react-icons/lu";
import { FiCheckCircle, FiFile, FiX } from "react-icons/fi";
import axios from "axios";
import { toastHandler } from "../../utils/toastHandler.js";
import { debounce } from "lodash";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
const FileUpload = ({ label, name, file, setFile, uploaded, setUploaded, uploadHandler, register, errors }) => (
  <div className="mt-3">
    <label className="block font-semibold text-gray-700">{label}</label>
    {!file && !uploaded ? (
      <div className="w-3/4 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
        <label
          htmlFor={`file-input-${name}`}
          className="flex flex-col items-center justify-center space-y-2 text-gray-600"
        >
          <LuFolderUp className="text-3xl text-gray-500" />
          <span className="text-sm">Drag and Drop File or Browse</span>
          <input
            type="file"
            id={`file-input-${name}`}
            accept="application/pdf,image/png,image/jpeg,image/jpg,image/gif,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
            {...register(name, { required: `${label} is required` })}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setFile(file);
            }}
            className="hidden"
          />
        </label>
      </div>
    ) : (
      <div
        className={`mt-2 flex items-center rounded-md border p-3 ${uploaded ? "border-green-500 bg-green-50" : "border-blue-300 bg-blue-50"
          }`}
      >
        <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-white">
          {uploaded ? <FiCheckCircle className="text-xl text-green-500" /> : <FiFile className="text-xl text-blue-500" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{file?.name || label}</p>
          <p className="text-xs text-gray-500">{uploaded ? "Successfully uploaded" : "Ready to upload"}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFile(null);
            setUploaded(false);
          }}
          className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        >
          <FiX className="text-lg" />
        </button>
      </div>
    )}
    {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    {file && !uploaded && (
      <button
        onClick={uploadHandler}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        type="button"
      >
        Upload {label}
      </button>
    )}
    {uploaded && (
      <button
        onClick={() => {
          setFile(null);
          setUploaded(false);
        }}
        className="mt-2 rounded border border-blue-500 bg-white px-4 py-2 text-blue-500 hover:bg-blue-50"
        type="button"
      >
        Upload Another File
      </button>
    )}
  </div>
);

const Qualification = ({
  step,
  nextStep,
  prevStep,
  setRegistrationCertificate,
  setDegreeDiploma,
  qualificationDetails,
  registrationDetails,
  systemOfMedicine,
  setAllData,
}) => {
  const [registrationFile, setRegistrationFile] = useState(null);
  const [degreeFile, setDegreeFile] = useState(null);
  const [uploadingRegistration, setUploadingRegistration] = useState(false);
  const [uploadingDegree, setUploadingDegree] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [registrationUploaded, setRegistrationUploaded] = useState(!!registrationDetails?.registrationCertificate);
  const [degreeUploaded, setDegreeUploaded] = useState(!!qualificationDetails?.degreeUrl);
  // eslint-disable-next-line no-unused-vars
  const [doctorSubcategories, setDoctorSubcategories] = useState([]); // Set but not yet used - reserved for future use
  // eslint-disable-next-line no-unused-vars
  const [nurseSubcategories, setNurseSubcategories] = useState([]); // Set but not yet used - reserved for future use
  const [medicalCouncils, setMedicalCouncils] = useState([]);
  const { setDoctor, getDoctorData } = useDoctorAuthStore();
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [collegeName, setCollegeName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
  const [country, setCountry] = useState([]);
  const [states, setStates] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");

  const {
    register,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useFormContext();

  const selectedCategory = watch("category");
  const selectedSubCategory = watch("subCategory");
  const selectedStateId = watch("state");
  // const selectedCollege = watch("college");


  // Fetch college name by ID
  useEffect(() => {
    if (qualificationDetails?.collegeId) {
      const fetchCollegeName = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/college/${qualificationDetails.collegeId}`, {
            withCredentials: true,
          });
          const name = response.data?.name || "";
          setCollegeName(name);
          setValue("collegeName", name);
        } catch (error) {
          console.error("Failed to fetch college name:", error);
          toastHandler(null, "", "", "Failed to fetch college name");
        }
      };
      fetchCollegeName();
    }
  }, [qualificationDetails?.collegeId, setValue]);

  // Fetch university name by ID
  useEffect(() => {
    if (qualificationDetails?.universityId) {
      const fetchUniversityName = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/university/${qualificationDetails.universityId}`, {
            withCredentials: true,
          });
          const name = response.data?.name || "";
          setUniversityName(name);
          setValue("universityName", name);
        } catch (error) {
          console.error("Failed to fetch university name:", error);
          toastHandler(null, "", "", "Failed to fetch university name");
        }
      };
      fetchUniversityName();
    }
  }, [qualificationDetails?.universityId, setValue]);

  // Set state name by ID
  useEffect(() => {
    if (qualificationDetails?.stateId && states?.length) {
      const stateMatch = states.find((item) => String(item.id) === String(qualificationDetails.stateId));
      const name = stateMatch?.name || "";
      setStateName(name);
      setValue("stateName", name);
    }
  }, [qualificationDetails?.stateId, states, setValue]);

  // Fetch subcategories
  useEffect(() => {
    const getSubcategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/sub-category`, { withCredentials: true });
        const manualCodeMapping = {
          1: 1,
          2: 2,
          3: 4,
          4: 2001,
          89: 5,
          5: 6,
          6: 3,
          7: 8,
          9: 10,
          10: 11,
          8: 9,
        };
        const doctor = [];
        const nurse = [];
        for (const [manualCode, originalId] of Object.entries(manualCodeMapping)) {
          const item = response?.data.data?.find((entry) => entry.id === Number(originalId));
          if (!item) continue;
          const entry = { subCategory: item.medicalSystem, code: Number(manualCode) };
          if (item.hprType === "doctor") doctor.push(entry);
          else if (item.hprType === "nurse") nurse.push(entry);
        }
        setDoctorSubcategories(doctor);
        setNurseSubcategories(nurse);
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        toastHandler(null, "", "", "Failed to load subcategories");
      }
    };
    getSubcategories();
  }, []);

  // Fetch medical councils
  useEffect(() => {
    const getMedicalCouncils = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-councils`, { withCredentials: true });
        setMedicalCouncils(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch medical councils:", error);
        toastHandler(null, "", "", "Failed to fetch medical councils");
      }
    };
    getMedicalCouncils();
  }, []);

  const uniqueCouncils = medicalCouncils.filter(
    (council, index, self) =>
      index === self.findIndex((t) => t.name === council.name)
  );


  //Fetch countries
  useEffect(() => {
    const getCountries = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/countries`, { withCredentials: true });
        setCountry(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toastHandler(null, "", "", "Failed to fetch countries");
      }
    };
    getCountries();
  }, []);


  // Extract watched values for dependency array
  const category = watch("category");
  const subCategory = watch("subCategory");

  useEffect(() => {
    const getCourses = async () => {
      if (!category || !subCategory) return; // Agar empty hai toh return karo

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/master-course`,
          { hprType: category, systemOfMedicine: subCategory },
          { withCredentials: true }
        );
        setCourses(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch course:", error);
        toastHandler(null, "", "", "Failed to fetch course");
      }
    };
    getCourses();
  }, [category, subCategory, watch]); // Dependency add karo

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCourses = useCallback(
    debounce(async (getCurrentValues) => {
      const { category, subCategory } = getCurrentValues();
      if (category && subCategory) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/master-course`,
            { hprType: category, systemOfMedicine: subCategory },
            { withCredentials: true }
          );
          setCourses(response.data.data || []);
        } catch (error) {
          console.error("Failed to fetch courses:", error);
          toastHandler(null, "", "", "Failed to fetch courses");
        }
      }
    }, 500),
    [] // debounce returns a stable function, dependencies are handled internally
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleColleges = useCallback(
    debounce(async (getCurrentValues) => {
      const { state, subCategory } = getCurrentValues();
      if (state && subCategory) {
        let stateId = state.split("#")[0];
        setIsLoadingColleges(true); // Start loading
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/master-college`,
            { stateId: stateId, systemOfMedicine: subCategory },
            { withCredentials: true }
          );
          setColleges(response.data.data || []);
        } catch (error) {
          console.error("Failed to fetch colleges:", error);
          toastHandler(null, "", "", "Failed to fetch colleges");
        } finally {
          setIsLoadingColleges(false); // Stop loading
        }
      }
    }, 500),
    [] // debounce returns a stable function, dependencies are handled internally
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleUniversities = useCallback(
    debounce(async (getCurrentValues) => {
      const { college } = getCurrentValues();
      if (college) {
        let collegeId = college.split("#")[1];
        setIsLoadingUniversities(true); // Start loading
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/master-university`,
            { collegeId: collegeId },
            { withCredentials: true }
          );
          setUniversities(response.data.data || []);
        } catch (error) {
          console.error("Failed to fetch universities:", error);
          toastHandler(null, "", "", "Failed to fetch universities");
        } finally {
          setIsLoadingUniversities(false); // Stop loading
        }
      }
    }, 500),
    [] // debounce returns a stable function, dependencies are handled internally
  );

  // Trigger API calls for dependent data
  useEffect(() => {
    handleCourses(() => ({ category: selectedCategory, subCategory: selectedSubCategory }));
    handleColleges(() => ({ state: selectedStateId, subCategory: selectedSubCategory }));
    handleUniversities(() => ({ college: selectedCollege }));
  }, [selectedCategory, selectedSubCategory, selectedStateId, selectedCollege, handleCourses, handleColleges, handleUniversities]);

  // Set form default values
  useEffect(() => {
    if (qualificationDetails || registrationDetails || systemOfMedicine) {
      reset({
        category: systemOfMedicine?.category || "",
        subCategory: systemOfMedicine?.systemOfMedicine || "",
        registerWithCouncil: registrationDetails?.registerWithCouncil + "#" + registrationDetails?.id || "",
        registrationNumber: registrationDetails?.registrationNumber || "",
        dateOfRegistration: registrationDetails?.dateOfRegistration
          ? new Date(registrationDetails.dateOfRegistration).toISOString().split("T")[0]
          : "",
        college: qualificationDetails?.college + "#" + qualificationDetails?.collegeId || "",
        collegeName: collegeName || "",
        university: qualificationDetails?.university + "#" + qualificationDetails?.universityId || "",
        universityName: universityName || "",
        passingMonth: qualificationDetails?.passingMonth || "",
        passingYear: qualificationDetails?.passingYear || "",
        degree: qualificationDetails?.degreeName + "#" + qualificationDetails?.degreeId || "",
        country: qualificationDetails?.country + "#" + qualificationDetails?.countryId || "",
        state: qualificationDetails?.state + "#" + qualificationDetails?.stateId || "",
        stateName: stateName || "",
        countryOfQualification: qualificationDetails?.countryOfQualification || "",
        status: registrationDetails?.status || "",
        nameSameAsAadhar: qualificationDetails?.nameSameAsAadhar || "",
      });
      setSelectedCountry(qualificationDetails?.country + "#" + qualificationDetails?.countryId || "");
      setSelectedState(qualificationDetails?.state + "#" + qualificationDetails?.stateId || "");
      setSelectedCollege(qualificationDetails?.college + "#" + qualificationDetails?.collegeId || "");
    }
  }, [qualificationDetails, registrationDetails, systemOfMedicine, collegeName, universityName, stateName, reset]);

  // Update collegeName when college changes
  useEffect(() => {
    if (selectedCollege && colleges.length) {
      const college = colleges.find((item) => String(item.id) === String(selectedCollege));
      setValue("collegeName", college?.name || "");
    }
  }, [selectedCollege, colleges, setValue]);

  // Update universityName when university changes
  // Extract watched value for dependency array
  const selectedUniversity = watch("university");
  
  useEffect(() => {
    if (selectedUniversity && universities.length) {
      const universityData = universities.find((item) => String(item.id) === String(selectedUniversity.split("#")[1]));
      setValue("universityName", universityData?.name || "");
    }
  }, [selectedUniversity, universities, setValue, watch]);

  // Update stateName when state changes
  useEffect(() => {
    if (selectedStateId && states.length) {
      const state = states.find((item) => String(item.id) === String(selectedStateId.split("#")[1]));
      setValue("stateName", state?.name || "");
    }
  }, [selectedStateId, states, setValue]);

  const handleNextStep = async (event) => {
    event.preventDefault();
    const isValid = await trigger();
    if (isValid) {
      setIsSaving(true);
      const data = {
        category: watch("category"),
        subCategory: watch("subCategory"),
        registerWithCouncil: watch("registerWithCouncil"),
        registrationNumber: watch("registrationNumber"),
        dateOfRegistration: watch("dateOfRegistration"),
        collegeId: watch("college"),
        collegeName: watch("collegeName"),
        universityId: watch("university"),
        universityName: watch("universityName"),
        passingMonth: watch("passingMonth"),
        passingYear: watch("passingYear"),
        degreeName: watch("degree"), // Send degreeName instead of degree URL
        country: watch("country"),
        stateId: watch("state"),
        stateName: watch("stateName"),
        countryOfQualification: watch("countryOfQualification"),
        status: watch("status"),
        nameSameAsAadhar: watch("nameSameAsAadhar"),
      };
      try {
        const res = await axios.patch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/update-phase-2-text`,
          data,
          { withCredentials: true }
        );
        await toastHandler(
          res,
          "Updating Qualification Details",
          "Qualification Details Updated Successfully",
          "Error Updating Qualification Details"
        );
        if (res.status === 200) {
          setAllData(res.data.data);
          // Refresh doctor data to update progress percentage
          await getDoctorData();
          nextStep();
        }
      } catch (error) {
        console.error("Error updating qualification details:", error);
        toastHandler(null, "", "", "Error updating qualification details");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const uploadRegistrationCertificate = async () => {
    if (!registrationFile) {
      toastHandler(null, "", "", "Please select a registration certificate file");
      return;
    }
    setUploadingRegistration(true);
    try {
      const formData = new FormData();
      formData.append("registrationCertificate", registrationFile);
      const res = await axios.patch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/update-phase-2-registration-certificate`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      await toastHandler(
        res,
        "Uploading Registration Certificate",
        "Registration Certificate Uploaded Successfully",
        "Error Uploading Registration Certificate"
      );
      if (res.status === 200) {
        setRegistrationCertificate(registrationFile);
        setRegistrationUploaded(true);
        if (res.data?.data) {
          setDoctor(res.data.data);
        } else if (res.data) {
          // If response structure is different, merge with existing doctor
          const { doctor } = useDoctorAuthStore.getState();
          if (doctor) {
            setDoctor({ ...doctor, ...res.data });
          }
        } 
      }
    } catch (error) {
      console.error("Error uploading registration certificate:", error);
      toastHandler(null, "", "", "Error uploading registration certificate");
    } finally {
      setUploadingRegistration(false);
    }
  };

  const uploadQualificationDegree = async () => {
    if (!degreeFile) {
      toastHandler(null, "", "", "Please select a degree/diploma file");
      return;
    }
    setUploadingDegree(true);
    try {
      const formData = new FormData();
      formData.append("qualificationDegree", degreeFile);
      const res = await axios.patch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/update-phase-2-qualification-degree`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      await toastHandler(
        res,
        "Uploading Qualification Degree",
        "Qualification Degree Uploaded Successfully",
        "Error Uploading Qualification Degree"
      );
      if (res.status === 200) {
        setDegreeDiploma(degreeFile);
        setDegreeUploaded(true);
        if (res.data?.data) {
          setDoctor(res.data.data);
        } else if (res.data) {
          // If response structure is different, merge with existing doctor
          const { doctor } = useDoctorAuthStore.getState();
          if (doctor) {
            setDoctor({ ...doctor, ...res.data });
          }
        }
      }
    } catch (error) {
      console.error("Error uploading qualification degree:", error);
      toastHandler(null, "", "", "Error uploading qualification degree");
    } finally {
      setUploadingDegree(false);
    }
  };


  // useEffect(() => {
  //   if (selectedCountry) {
  //     axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/states/${selectedCountry.split("#")[1]}`)
  //       .then(res => setStates(res.data));
  //   } else {
  //     setStates([]);
  //     setColleges([]);
  //     setUniversities([]);
  //   }
  // }, [selectedCountry]);

  // useEffect(() => {
  //   if (selectedState) {
  //     axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/colleges/${selectedState.split("#")[1]}`)
  //       .then(res => setColleges(res.data));
  //   } else {
  //     setColleges([]);
  //     setUniversities([]);
  //   }
  // }, [selectedState]);

  // useEffect(() => {
  //   if (selectedCollege) {
  //     axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/universities/${selectedCollege.split("#")[1]}`)
  //       .then(res => setUniversities(res.data));
  //   } else {
  //     setUniversities([]);
  //   }
  // }, [selectedCollege]);



  // useEffect(() => {
  //   if (selectedCountry) {
  //     axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/states/${selectedCountry.split("#")[1]}`)
  //       .then(res => setStates(res.data));
  //   } else {
  //     setStates([]);
  //     setColleges([]);
  //     setUniversities([]);
  //   }
  // }, [selectedCountry]);

  // useEffect(() => {
  //   if (selectedState) {
  //     axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/colleges/${selectedState.split("#")[1]}`)
  //       .then(res => setColleges(res.data));
  //   } else {
  //     setColleges([]);
  //     setUniversities([]);
  //   }
  // }, [selectedState]);

  // useEffect(() => {
  //   if (selectedCollege) {
  //     axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/universities/${selectedCollege.split("#")[1]}`)
  //       .then(res => setUniversities(res.data));
  //   } else {
  //     setUniversities([]);
  //   }
  // }, [selectedCollege]);



  useEffect(() => {
    // If nothing is selected yet, don't make the API call
    if (!selectedCountry || !selectedCountry.includes("#")) {
      setStates([]);
      setColleges([]);
      setUniversities([]);
      return;
    }

    // Extract ID safely
    const countryId = selectedCountry.split("#")[1];

    if (countryId && !isNaN(countryId)) {
      axios
        .get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/states/${countryId}`)
        .then(res => setStates(res.data))
        .catch(err => console.error("Error fetching states:", err));
    } else {
      setStates([]);
      setColleges([]);
      setUniversities([]);
    }
  }, [selectedCountry]);








  useEffect(() => {
    // If no state selected yet, reset and exit
    if (!selectedState || !selectedState.includes("#")) {
      setColleges([]);
      setUniversities([]);
      return;
    }

    const stateId = selectedState.split("#")[1];

    if (stateId && !isNaN(stateId)) {
      axios
        .get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/colleges/${stateId}`)
        .then(res => setColleges(res.data))
        .catch(err => console.error("Error fetching colleges:", err));
    } else {
      setColleges([]);
      setUniversities([]);
    }
  }, [selectedState]);







  useEffect(() => {
    if (!selectedCollege || !selectedCollege.includes("#")) {
      setUniversities([]);
      return;
    }

    const collegeId = selectedCollege.split("#")[1];

    if (collegeId && !isNaN(collegeId)) {
      axios
        .get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/universities/${collegeId}`)
        .then(res => setUniversities(res.data))
        .catch(err => console.error("Error fetching universities:", err));
    } else {
      setUniversities([]);
    }
  }, [selectedCollege]);

  return (
    <div className="px-4 md:px-16 lg:px-24">
      <h4 className="commonHeading mb-4 mt-6 p-3">System of Medicine</h4>
      <div className="mb-3">
        <div className="mb-3 flex flex-col justify-between gap-4 md:flex-row">
          <div className="mb-3 w-full md:mb-0 md:mr-3 md:w-1/2">
            <label className="block font-semibold text-gray-700">Category</label>
            <input
              type="text"
              {...register("category", { required: "Category is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
          </div>
          <div className="mb-3 w-full md:mb-0 md:mr-3 md:w-1/2">
            <label className="block font-medium">Sub Category</label>
            <input
              type="text"
              {...register("subCategory", { required: "Sub Category is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled
            />
            {errors.subCategory && <p className="mt-1 text-sm text-red-500">{errors.subCategory.message}</p>}
          </div>
        </div>
      </div>

      <h4 className="commonHeading mb-4 mt-4 p-3">Register Details</h4>
      <div className="mb-3">
        <div className="mb-3 flex flex-col justify-between gap-6 md:flex-row">
          <div className="w-full">
            <label className="block font-medium text-gray-700">Register with council</label>
            <select
              {...register("registerWithCouncil", { required: "Council is required" })}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Medical Council</option>
              {uniqueCouncils.map((council) => (
                <option key={council._id} value={`${council.name}#${council.id}`}>
                  {council.name}
                </option>
              ))}

            </select>
            {errors.registerWithCouncil && <p className="mt-1 text-sm text-red-500">{errors.registerWithCouncil.message}</p>}
          </div>
          <div className="w-full">
            <label className="mb-3 block font-medium text-gray-700">Registration Number</label>
            <input
              type="text"
              {...register("registrationNumber", {
                required: "Registration Number is required",
                pattern: { value: /^[A-Za-z0-9]+$/, message: "Invalid registration number" },
              })}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.registrationNumber && <p className="mt-1 text-sm text-red-500">{errors.registrationNumber.message}</p>}
          </div>
          <div className="w-full">
            <label className="mb-3 block font-medium text-gray-700">Date of First Registration</label>
            <input
              type="date"
              {...register("dateOfRegistration", { required: "Registration Date is required" })}
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.dateOfRegistration && <p className="mt-1 text-sm text-red-500">{errors.dateOfRegistration.message}</p>}
          </div>
        </div>
        <small className="text-sm">Is the registration permanent or renewal?</small>
        <div className="mt-2">
          <div className="flex gap-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="Permanent"
                {...register("status", { required: "Status is required" })}
                className="mr-2 accent-blue-500"
              />
              Permanent
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="Renewal"
                {...register("status", { required: "Status is required" })}
                className="mr-2 accent-blue-500"
              />
              Renewal
            </label>
          </div>
          {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>}
        </div>
        <FileUpload
          label="Registration Certificate Attachment"
          name="registrationFile"
          file={registrationFile}
          setFile={setRegistrationFile}
          uploaded={registrationUploaded}
          setUploaded={setRegistrationUploaded}
          uploadHandler={uploadRegistrationCertificate}
          register={register}
          errors={errors}
        />
      </div>

      <h4 className="commonHeading mb-4 mt-5 p-3">Qualification Details</h4>
      <div className="mb-3 mt-4">
        <div>
          <label className="block font-medium">Country of Qualification</label>
          <div className="mt-2 flex gap-3">
            <label className="mb-4 flex items-center gap-2">
              <input
                type="radio"
                {...register("countryOfQualification", { required: "Qualification Country is required" })}
                value="India"
                className="accent-blue-500"
              />
              India
            </label>
            <label className="mb-4 flex items-center gap-2">
              <input
                type="radio"
                {...register("countryOfQualification", { required: "Qualification Country is required" })}
                value="Other"
                className="accent-blue-500"
              />
              Other
            </label>
          </div>
          {errors.countryOfQualification && <p className="mt-1 text-sm text-red-500">{errors.countryOfQualification.message}</p>}
        </div>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <label className="mb-2 block font-medium text-gray-700">Name of Degree/Diploma</label>
            <select
              {...register("degree", { required: "Degree/Diploma is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Degree/Diploma</option>
              {courses.map((course, i) => (
                <option key={i} value={`${course.name}#${course.id}`}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.degree && <p className="mt-1 text-sm text-red-500">{errors.degree.message}</p>}
          </div>
          <div className="w-full md:w-1/2">
            <label className="mb-2 block font-medium text-gray-700">Country</label>
            <select
              {...register("country", { required: "Country is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              {country.map((item, i) => (
                <option key={i} value={`${item.enShortName}#${item.id}`}>
                  {item.enShortName}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>}
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/3">
            <label className="mb-2 block font-medium text-gray-700">State</label>
            <select
              {...register("state", { required: "State is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">Select State</option>
              {states.map((item, i) => (
                <option key={i} value={`${item.name}#${item.id}`}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
            <input type="hidden" {...register("stateName")} />
          </div>
          <div className="w-full md:w-1/3">
            <label className="mb-2 block font-medium text-gray-700">College</label>
            <div className="relative">
              <select
                {...register("college", { required: "College is required" })}
                className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingColleges}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("college", value);
                  setSelectedCollege(value);
                }}
              >
                <option value="">Select College</option>
                {colleges.map((item, i) => (
                  <option key={i} value={`${item.name}#${item.id}`}>
                    {item.name}
                  </option>
                ))}
              </select>
              {isLoadingColleges && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
            {errors.college && <p className="mt-1 text-sm text-red-500">{errors.college.message}</p>}
            <input type="hidden" {...register("collegeName")} />
          </div>
          <div className="w-full md:w-1/3">
            <label className="mb-2 block font-medium text-gray-700">University</label>
            <div className="relative">
              <select
                {...register("university", { required: "University is required" })}
                className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingUniversities}
              >
                <option value="">Select University</option>
                {universities.map((item, i) => (
                  <option key={i} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              {isLoadingUniversities && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
            {errors.university && <p className="mt-1 text-sm text-red-500">{errors.university.message}</p>}
            <input type="hidden" {...register("universityName")} />
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <label className="mb-2 block font-medium text-gray-700">Passing Month</label>
            <select
              {...register("passingMonth", { required: "Passing Month is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Month</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                (month, i) => (
                  <option key={i} value={month}>
                    {month}
                  </option>
                )
              )}
            </select>
            {errors.passingMonth && <p className="mt-1 text-sm text-red-500">{errors.passingMonth.message}</p>}
          </div>
          <div className="w-full md:w-1/2">
            <label className="mb-2 block font-medium text-gray-700">Passing Year</label>
            <select
              {...register("passingYear", { required: "Passing Year is required" })}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Year</option>
              {[...Array(50)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={i} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            {errors.passingYear && <p className="mt-1 text-sm text-red-500">{errors.passingYear.message}</p>}
          </div>
        </div>
        <FileUpload
          label="Degree/Diploma Attachment"
          name="degreeFile"
          file={degreeFile}
          setFile={setDegreeFile}
          uploaded={degreeUploaded}
          setUploaded={setDegreeUploaded}
          uploadHandler={uploadQualificationDegree}
          register={register}
          errors={errors}
        />
      </div>
      <div className="mt-6">
        <label className="mb-2 block font-medium text-gray-700">Is your name in the degree the same as your name in Aadhar?</label>
        <div className="mb-3 flex gap-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              {...register("nameSameAsAadhar", { required: "This field is required" })}
              className="mr-2 accent-blue-500"
            />
            Yes
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="no"
              {...register("nameSameAsAadhar", { required: "This field is required" })}
              className="mr-2 accent-blue-500"
            />
            No
          </label>
        </div>
        {errors.nameSameAsAadhar && <p className="mt-1 text-sm text-red-500">{errors.nameSameAsAadhar.message}</p>}
      </div>
      {watch("nameSameAsAadhar") === "no" && (
        <FileUpload
          label="Name Discrepancy Proof"
          name="discrepancyProof"
          file={null}
          setFile={() => { }}
          uploaded={false}
          setUploaded={() => { }}
          uploadHandler={() => toastHandler(null, "", "", "Name discrepancy proof upload not implemented")}
          register={register}
          errors={errors}
        />
      )}
      <div className="flex justify-between mt-6">
        {step > 0 && (
          <button type="button" className="btn btn-secondary px-4 py-2" onClick={prevStep}>
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNextStep}
          className="btn text-white px-4 py-2 flex items-center gap-2"
          style={{ backgroundColor: "#0095D9" }}
          disabled={uploadingRegistration || uploadingDegree || isSaving}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                />
              </svg>
              Saving...
            </>
          ) : step < 3 ? (
            "Save and Next"
          ) : (
            "Submit Data"
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(Qualification);