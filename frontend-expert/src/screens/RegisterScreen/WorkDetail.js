import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { LuFolderUp } from "react-icons/lu";
import { FiCheckCircle, FiFile, FiX } from "react-icons/fi";
import axios from "axios";
import { toastHandler } from "../../utils/toastHandler.js";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";


const FileUpload = ({ label, name, file, setFile, uploaded, setUploaded, uploadHandler, register, errors, multiple = false }) => (
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
            multiple={multiple}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            {...register(name, { required: `${label} is required` })}
            onChange={(e) => {
              if (multiple) {
                const files = Array.from(e.target.files);
                setFile(files);
              } else {
                const file = e.target.files[0];
                if (file) setFile(file);
              }
            }}
            className="hidden"
          />
        </label>
      </div>
    ) : (
      <div
        className={`mt-2 flex items-center rounded-md border p-3 ${
          uploaded ? "border-green-500 bg-green-50" : "border-blue-300 bg-blue-50"
        }`}
      >
        <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-white">
          {uploaded ? <FiCheckCircle className="text-xl text-green-500" /> : <FiFile className="text-xl text-blue-500" />}
        </div>
        <div className="flex-1">
          {multiple && Array.isArray(file) ? (
            <div>
              <p className="text-sm font-medium">{file.length} file(s) selected</p>
              <p className="text-xs text-gray-500">{uploaded ? "Successfully uploaded" : "Ready to upload"}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">{file?.name || label}</p>
              <p className="text-xs text-gray-500">{uploaded ? "Successfully uploaded" : "Ready to upload"}</p>
            </div>
          )}
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

const WorkDetail = ({
  step,
  nextStep,
  prevStep,
  currentWorkDetails,
  placeOfWork,
  setAllData,
  states,
  districts,
  setDistricts,
}) => {
  const [natureOfWork, setNatureOfWork] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDistricts, setIsFetchingDistricts] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [isSearchingFacilities, setIsSearchingFacilities] = useState(false);
  const [showFacilitySearch, setShowFacilitySearch] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const { setDoctor, doctor, getDoctorData } = useDoctorAuthStore();

  const {
    register,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useFormContext({
    defaultValues: {
      currentlyWorking: currentWorkDetails?.currentlyWorking || "",
      reasonForNotWorking: currentWorkDetails?.reasonForNotWorking || "",
      natureOfWork: currentWorkDetails?.natureOfWork || "",
      teleconsultationUrl: currentWorkDetails?.teleconsultationUrl || "",
      workStatus: currentWorkDetails?.workStatus || "",
      experience: doctor?.experience || currentWorkDetails?.experience || currentWorkDetails?.yearsOfExperience || "",
      facilityName: placeOfWork?.facilityName || "",
      state: placeOfWork?.state || "",
      district: placeOfWork?.district || "",
      facilityId: placeOfWork?.facilityId || "",
      facilityPinCode: placeOfWork?.facilityPinCode || "",
      longitude: placeOfWork?.longitude || "",
      latitude: placeOfWork?.latitude || "",
      documents: currentWorkDetails?.documents || [],
      selectedFacility: currentWorkDetails?.selectedFacility || null
    },
  });


  

  const selectedState = watch("state");
  const currentlyWorking = watch("currentlyWorking");
  const workStatus = watch("workStatus");
  const selectedFacility = watch("selectedFacility");

  const isDocumentRequired = currentlyWorking === "true" && (workStatus === "Govt" || workStatus === "Both");
  const isPlaceOfWorkRequired = currentlyWorking === "true" && (workStatus === "Govt" || workStatus === "Both");
  const shouldShowPlaceOfWork = currentlyWorking === "true";

  useEffect(() => {
    if (!isDocumentRequired) {
      setDocuments([]);
      setDocumentsUploaded(false);
      setValue("documents", []);
    }
  }, [isDocumentRequired, setValue]);

  useEffect(() => {
    const getDistricts = async () => {
      if (selectedState && selectedState.includes("#")) {
        // Extract state ID from format "name#id"
        const selectedStateId = selectedState.split("#")[1] || selectedState.split("#")[0];
        setIsFetchingDistricts(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/districts/${selectedStateId}`,
            { withCredentials: true }
          );
          setDistricts(response.data.data || []);
        } catch (error) {
          // Handle 500 errors gracefully - don't show toast for server errors
          if (error.response?.status === 500) {
            console.warn("Server error fetching districts, state ID might be invalid:", selectedStateId);
            setDistricts([]);
          } else {
            console.error("Failed to fetch districts:", error);
            toastHandler("error", "Failed to fetch districts");
            setDistricts([]);
          }
        } finally {
          setIsFetchingDistricts(false);
        }
      } else {
        setDistricts([]);
        setIsFetchingDistricts(false);
      }
    };
    getDistricts();
  }, [selectedState, setDistricts]);

  const searchFacilities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setFacilities([]);
      return;
    }

    setIsSearchingFacilities(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/facility/search?q=${searchTerm}`,
        { withCredentials: true }
      );
      console.log(response.data.data);
      setFacilities(response.data.data || []);
    } catch (error) {
      console.error("Failed to search facilities:", error);
      toastHandler("error", "Failed to search facilities");
      setFacilities([]);
    } finally {
      setIsSearchingFacilities(false);
    }
  };

  const debouncedSearch = React.useCallback(
    React.useMemo(() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          searchFacilities(searchTerm);
        }, 300);
      };
    }, []),
    []
  );

  const handleFacilitySelect = async (facility) => {
    setValue("selectedFacility", facility);
    setValue("facilityName", facility.name);
    setValue("facilityId", facility.facilityId || facility.id);
    
    if (facility.state) {
      const matchingState = states.find(s => String(s.id) === String(facility.state));
      
      if (matchingState) {
        const stateValue = `${matchingState.id}#${matchingState.name}#${matchingState.isoCode}`;
        setValue("state", stateValue);
        
        setIsFetchingDistricts(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/districts/${matchingState.id}`,
            { withCredentials: true }
          );
          const fetchedDistricts = response.data.data || [];
          setDistricts(fetchedDistricts);
          
          if (facility.district) {
            let matchingDistrict = null;
            
            matchingDistrict = fetchedDistricts.find(d => String(d.id) === String(facility.district));
            
            if (!matchingDistrict) {
              matchingDistrict = fetchedDistricts.find(d => String(d.isoCode) === String(facility.district));
            }
            
            if (!matchingDistrict) {
              matchingDistrict = fetchedDistricts.find(d => String(d.districtCode) === String(facility.district));
            }
            
            if (!matchingDistrict) {
              const districtIndex = parseInt(facility.district) - 1;
              if (districtIndex >= 0 && districtIndex < fetchedDistricts.length) {
                matchingDistrict = fetchedDistricts[districtIndex];
              }
            }
            
            if (matchingDistrict) {
              const districtValue = `${matchingDistrict.districtName}#${matchingDistrict.isoCode}`;
              setValue("district", districtValue);
              
              setTimeout(() => {
                trigger("district");
              }, 100);
            } else {
              setValue("district", facility.district);
            }
          }
        } catch (error) {
          console.error("Failed to fetch districts:", error);
          toastHandler("error", "Failed to fetch districts for the selected state");
        } finally {
          setIsFetchingDistricts(false);
        }
      } else {
        setValue("state", facility.state);
      }
    }
    
    setValue("facilityPinCode", facility.pincode || "");
    setValue("longitude", facility.longitude || "");
    setValue("latitude", facility.latitude || "");
    setShowFacilitySearch(false);
    setFacilities([]);
    
    toastHandler("success", `Facility "${facility.name}" selected successfully`);
  };

  const handleDocumentUpload = async () => {
    if (!documents || documents.length === 0) {
      toastHandler("error", "Please select documents to upload");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = documents.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toastHandler("error", `Some files are too large. Maximum size is 5MB.`);
      return;
    }

    setUploadingDocuments(true);
    try {
      const formData = new FormData();
      documents.forEach((file) => {
        formData.append("documents", file);
      });

      const res = await axios.patch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/update-phase-3-documents`,
        formData,
        { 
          withCredentials: true, 
          headers: { "Content-Type": "multipart/form-data" } 
        }
      );

      if (res.status === 200) {
        setDocumentsUploaded(true);
        setValue("documents", documents);
        // Update doctor store with response data to update progress percentage
        if (res.data?.data) {
          setDoctor(res.data.data);
        } else if (doctor && res.data) {
          // Merge response data with existing doctor object
          setDoctor({ ...doctor, ...res.data });
        }
        toastHandler("success", "Documents uploaded successfully");
      } else {
        toastHandler("error", "Failed to upload documents");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toastHandler("error", "Error uploading documents");
      setDocumentsUploaded(false);
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleNext = async () => {
    const isValid = await trigger();

    if (currentlyWorking === "true" && (workStatus === "Govt" || workStatus === "Both")) {
      if (!documents || documents.length === 0) {
        toastHandler("error", "Please select documents to upload");
        return;
      }
      
      if (!documentsUploaded) {
        toastHandler("error", "Please upload the selected documents before proceeding");
        return;
      }
      
      const facilityId = watch("facilityId");
      const facilityName = watch("facilityName");
      const state = watch("state");
      const district = watch("district");

      const isFacilityDetailsFilled = facilityName && state && district;
      const isEitherValid = facilityId || isFacilityDetailsFilled;

      if (!isEitherValid) {
        toastHandler("error", "Place of work is mandatory for Government/Both work status");
        return;
      }
    }

    if (isValid) {
      setIsLoading(true);
      const data = {
        currentlyWorking: watch("currentlyWorking"),
        reasonForNotWorking: watch("reasonForNotWorking"),
        natureOfWork: watch("natureOfWork"),
        teleconsultationUrl: watch("teleconsultationUrl"),
        workStatus: watch("workStatus"),
        experience: watch("experience"),
        facilityName: watch("facilityName"),
        state: watch("state"),
        district: watch("district"),
        facilityId: watch("facilityId"),
        facilityPinCode: watch("facilityPinCode"),
        longitude: watch("longitude"),
        latitude: watch("latitude")
      };
      
      try {
        const res = await axios.patch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/update-phase-3`,
          data,
          { 
            withCredentials: true
          }
        );
        await toastHandler(
          res,
          "Updating Work Details",
          "Work Details Updated Successfully",
          "Error Updating Work Details"
        );
        if (res.status === 200) {
          setAllData(res.data.data);
          // Refresh doctor data to update progress percentage
          await getDoctorData();
          nextStep();
        }
      } catch (error) {
        console.error("Error updating work details:", error);
        toastHandler(null, "", "", "Error updating work details");
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className='mt-3 px-6'>
      <h4 className='commonHeading p-3'>Current Work Details</h4>

      <div className='mt-3'>
        <div>
          <label className='font-semibold'>Are you currently working?</label>
          <div className='mt-2 flex gap-3'>
            {["true", "false"].map((option) => (
              <label
                key={option}
                className='flex items-center gap-1 font-normal'
              >
                <input
                  type='radio'
                  {...register("currentlyWorking", {
                    required: "Please select your working status",
                  })}
                  value={option}
                />
                {option === "true" ? "Yes" : "No"}
              </label>
            ))}
          </div>
          {errors.currentlyWorking && (
            <p className='text-red-500'>{errors.currentlyWorking.message}</p>
          )}
        </div>

        {/* Reason for not working - shown only when "No" is selected */}
        {currentlyWorking === "false" && (
          <div className='mt-3'>
            <label className='font-semibold'>Reason for not working</label>
            <textarea
              placeholder='Please provide the reason for not currently working'
              {...register("reasonForNotWorking", {
                required: "Please provide a reason for not working",
              })}
              className='mt-1 w-full rounded border p-3'
              rows="3"
            />
            {errors.reasonForNotWorking && (
              <p className='text-red-500'>{errors.reasonForNotWorking.message}</p>
            )}
          </div>
        )}

        {/* Work Status - shown only when "Yes" is selected */}
        {currentlyWorking === "true" && (
          <div className='mt-3'>
            <label className='font-semibold'>Work Status</label>
            <div className='mt-2 flex gap-3'>
              {["Govt", "Private", "Both"].map((status) => (
                <label
                  key={status}
                  className='flex items-center gap-1 font-normal'
                >
                  <input
                    type='radio'
                    {...register("workStatus", {
                      required: "Please select work status",
                    })}
                    value={status}
                  />
                  {status}
                </label>
              ))}
            </div>
            {errors.workStatus && (
              <p className='text-red-500'>{errors.workStatus.message}</p>
            )}
          </div>
        )}

        {isDocumentRequired && (
          <div>
            <p className='text-sm text-gray-600 mb-2'>
              <span className='text-red-500'>*</span> Document upload is mandatory for Government/Both work status. 
              Upload relevant documents like payslip, recent transfer order, etc. Maximum file size: 5MB per file.
            </p>
            <FileUpload
              label="Document Upload (Payslip, Transfer Order, etc.)"
              name="documents"
              file={documents}
              setFile={setDocuments}
              uploaded={documentsUploaded}
              setUploaded={setDocumentsUploaded}
              uploadHandler={handleDocumentUpload}
              register={register}
              errors={errors}
              multiple={true}
            />
          </div>
        )}

        <div className='mt-3 flex gap-16'>
          <div className='w-1/2'>
            <label className='font-semibold'>Nature Of Work</label>
            <select
              {...register("natureOfWork", {
                required: "Please select the nature of work",
              })}
              className='mt-1 w-full rounded border p-3 font-serif text-gray-900 placeholder-gray-400'
            >
              <option value='' disabled>
                Select an option
              </option>
              <option value='Practice'>Practice</option>
              <option value='Teaching'>Teaching</option>
              <option value='Research'>Research</option>
              <option value='Administrative'>Administrative</option>
            </select>
            {errors.natureOfWork && (
              <p className='text-red-500'>{errors.natureOfWork.message}</p>
            )}
          </div>

          <div className='w-1/2'>
            <label className='font-semibold'>Teleconsultation URL</label>
            <input
              type='url'
              placeholder='Enter URL'
              {...register("teleconsultationUrl", {
                pattern: {
                  value: /^https?:\/\/.+$/,
                  message: "Invalid URL format",
                },
              })}
              className='mt-1 w-full rounded border p-3'
            />
            {errors.teleconsultationUrl && (
              <p className='text-red-500'>
                {errors.teleconsultationUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className='mt-3'>
          <label className='font-semibold'>Experience (Years)</label>
          <select
            {...register("experience", {
              required: "Please select your years of experience",
            })}
            className='mt-1 w-full rounded border p-3 font-serif text-gray-900 placeholder-gray-400'
          >
            <option value='' disabled>
              Select experience
            </option>
            <option value='less than 1'>Less than 1</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='greater than 5'>Greater than 5</option>
          </select>
          {errors.experience && (
            <p className='text-red-500'>{errors.experience.message}</p>
          )}
        </div>

        {/* Place of Work - shown only when "Yes" is selected */}
        {shouldShowPlaceOfWork && (
          <>
            <h4 className='commonHeading mb-3 mt-4 p-3'>
              Place Of Work 
              {isPlaceOfWorkRequired && <span className='text-red-500'> *</span>}
            </h4>

            {/* Facility Search */}
            <div className='mb-4'>
              <label className='font-semibold'>Search Facility</label>
              <div className='mt-2 flex gap-2'>
                <input
                  type='text'
                  placeholder='Search by facility name or ID'
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className='flex-1 rounded border p-3'
                />
                <button
                  type='button'
                  onClick={() => {
                    setFacilities([]);
                    setShowFacilitySearch(false);
                  }}
                  className='px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600'
                >
                  Clear
                </button>
              </div>
              

              
              {/* Search Results */}
              {facilities.length > 0 && (
                <div className='mt-2 max-h-40 overflow-y-auto border rounded'>
                  <div className='p-2 bg-gray-50 border-b'>
                    <span className='text-sm font-medium text-gray-700'>Search Results ({facilities.length} found):</span>
                  </div>
                  {facilities.map((facility) => {
                    const stateName = (() => {
                      const matchingState = states.find(s => String(s.id) === String(facility.state));
                      return matchingState ? matchingState.name : facility.state;
                    })();
                    
                    const districtName = (() => {
                      let matchingDistrict = null;
                      
                      matchingDistrict = districts.find(d => String(d.id) === String(facility.district));
                      
                      if (!matchingDistrict) {
                        matchingDistrict = districts.find(d => String(d.isoCode) === String(facility.district));
                      }
                      
                      if (!matchingDistrict) {
                        matchingDistrict = districts.find(d => String(d.districtCode) === String(facility.district));
                      }
                      
                      if (!matchingDistrict) {
                        const districtIndex = parseInt(facility.district) - 1;
                        if (districtIndex >= 0 && districtIndex < districts.length) {
                          matchingDistrict = districts[districtIndex];
                        }
                      }
                      
                      return matchingDistrict ? matchingDistrict.districtName : `District ${facility.district}`;
                    })();
                    
                    return (
                      <div
                        key={facility.id}
                        onClick={() => handleFacilitySelect(facility)}
                        className='p-2 hover:bg-gray-100 cursor-pointer border-b'
                      >
                        <div className='font-medium'>{facility.name}</div>
                        <div className='text-sm text-gray-600'>
                          ID: {facility.facilityId || facility.id} | State: {stateName}, District: {districtName}
                        </div>
                        {facility.address && (
                          <div className='text-xs text-gray-500 mt-1'>
                            📍 {facility.address}
                          </div>
                        )}
                        {facility.pincode && (
                          <div className='text-xs text-gray-500'>
                            📮 Pincode: {facility.pincode}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {isSearchingFacilities && (
                <div className='mt-2 text-center'>
                  <span className='text-blue-500'>Searching facilities...</span>
                </div>
              )}
              
              {!isSearchingFacilities && facilities.length === 0 && (
                <div className='mt-2 p-2 text-center text-gray-600 bg-gray-50 rounded'>
                  <p>No facilities found. Please enter facility details manually below.</p>
          </div>
          )}
        </div>





        <div className='mt-3 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div>
                <label className='font-semibold'>
                  Facility Name
                  {isPlaceOfWorkRequired && <span className='text-red-500'> *</span>}
                </label>
            <input
              type='text'
              placeholder='Enter Facility Name'
                  {...register("facilityName", {
                    required: isPlaceOfWorkRequired ? "Facility name is required" : false
                  })}
              className='mt-1 w-full rounded border p-3'
            />
            {errors.facilityName && (
              <p className='text-red-500'>{errors.facilityName.message}</p>
            )}
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              State
                  {isPlaceOfWorkRequired && <span className='text-red-500'> *</span>}
            </label>
            <select
              {...register("state", {
                    required: isPlaceOfWorkRequired ? "State is required" : false,
              })}
              className='w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100'
              aria-label='Communication State'
            >
              <option value='' disabled>
                Select an option
              </option>
              {states.map((item, index) => (
                <option
                  key={index}
                  value={item.id + `#${item.name}#${item.isoCode}`}
                >
                  {item.name}
                </option>
              ))}
            </select>
                {errors.state && (
              <p className='mt-1 text-sm text-red-500'>
                    {errors.state.message}
              </p>
            )}
          </div>
              
          <div className='relative'>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              District
                  {isPlaceOfWorkRequired && <span className='text-red-500'> *</span>}
            </label>
            <select
              {...register("district", {
                    required: isPlaceOfWorkRequired ? "District is required" : false,
              })}
              className='w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100'
              disabled={!selectedState || isFetchingDistricts}
              aria-label='Communication District'
              aria-busy={isFetchingDistricts}

            >
              <option value='' disabled>
                {isFetchingDistricts ? "Loading..." : "Select an option"}
              </option>
                                    {districts.map((item, index) => (
                    <option
                      key={index}
                      value={item.districtName + `#${item.isoCode}`}
                    >
                      {item.districtName}
                    </option>
                  ))}
            </select>
            {isFetchingDistricts && (
              <div className='absolute right-3 top-10 -translate-y-1/2 transform'>
                <svg
                  className='h-5 w-5 animate-spin text-blue-500'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z'
                  />
                </svg>
              </div>
            )}
                {errors.district && (
              <p className='mt-1 text-sm text-red-500'>
                    {errors.district.message}
              </p>
            )}
          </div>

          <div>
          <label className='font-semibold'>Facility PinCode</label>
          <input
            type='text'
            placeholder='Enter Facility pincode'
            {...register("facilityPinCode")}
            className='mt-1 w-full rounded border p-3'
          />
                {errors.facilityPinCode && (
            <p className='text-red-500'>{errors.facilityPinCode.message}</p>
          )}
        </div>

              <div>
                <label className='font-semibold'>Longitude</label>
                <input
                  type='text'
                  placeholder='Enter longitude'
                  {...register("longitude")}
                  className='mt-1 w-full rounded border p-3'
                
                />
                {errors.longitude && (
                  <p className='text-red-500'>{errors.longitude.message}</p>
                )}
              </div>

              <div>
                <label className='font-semibold'>Latitude</label>
                <input
                  type='text'
                  placeholder='Enter latitude'
                  {...register("latitude")}
                  className='mt-1 w-full rounded border p-3'
                />
                {errors.latitude && (
                  <p className='text-red-500'>{errors.latitude.message}</p>
                )}
              </div>
        </div>

        <div className='mt-3 text-center font-medium'>or</div>

        <div className='mt-3 w-1/3'>
          <label className='font-semibold'>Facility ID</label>
          <input
            type='text'
            placeholder='Enter Facility ID'
            {...register("facilityId")}
            className='mt-1 w-full rounded border p-3'
          />
          {errors.facilityId && (
            <p className='text-red-500'>{errors.facilityId.message}</p>
          )}
        </div>
          </>
        )}
      </div>

      <div className='d-flex justify-content-between mt-3 py-4'>
        {step > 0 && (
          <button type="button" className='btn btn-secondary' onClick={prevStep}>
            Back
          </button>
        )}
        <button
          type='button'
          className='btn text-white flex items-center gap-2'
          style={{ backgroundColor: "#0095D9" }}
          onClick={handleNext}
          disabled={isLoading || uploadingDocuments}
        >
          {isLoading ? (
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

export default React.memo(WorkDetail);
