import React, { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toastHandler } from "../../utils/toastHandler.js";
import axios from "axios";
import PropTypes from "prop-types";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";


const PersonalDetails = ({
  step,
  prevStep,
  nextStep,
  personalDetails,
  addressPerKyc,
  setAllData,
  states,
  countries,
  districts,
  setDistricts,
}) => {
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDistricts, setIsFetchingDistricts] = useState(false);
  const { setDoctor, getDoctorData } = useDoctorAuthStore();

  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors },
    watch,
  } = useFormContext();

  const selectedState = watch("communicationState");
  const sameAddress = watch("sameAddress");

  // Fetch languages
  useEffect(() => {
    const getLanguages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/languages`, {
          withCredentials: true,
        });
        setLanguages(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
        toastHandler("error", "Failed to fetch languages");
      }
    };
    getLanguages();
  }, []);


  

  // Fetch districts when state changes
  useEffect(() => {
    const getDistricts = async () => {
      if (selectedState) {
        const selectedStateId = selectedState.split("#")[0];
        setIsFetchingDistricts(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/districts/${selectedStateId}`,
            { withCredentials: true }
          );
          setDistricts(response.data.data || []);
        } catch (error) {
          console.error("Failed to fetch districts:", error);
          toastHandler("error", "Failed to fetch districts");
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

  // Set default values for addressPerKyc
  useEffect(() => {
    if (addressPerKyc && states?.length) {
      const stateMatch = states.find(
        (item) => String(item.id) === String(addressPerKyc.state)
      );
      setValue("address", addressPerKyc.address || "");
      setValue("pincode", addressPerKyc.pincode || "");
      setValue("state", addressPerKyc.state || "");
      setValue("stateName", stateMatch?.name || "");
      setValue("district", addressPerKyc.district || "");
      setValue("country", addressPerKyc.country || "");
      setValue("sameAddress", addressPerKyc.communicationAddress || false);
    }
  }, [addressPerKyc, states, setValue]);

  // Set default values for personalDetails
  useEffect(() => {
    if (personalDetails) {
      setValue("fullName", personalDetails.fullName || "");
      setValue("title", personalDetails.title || "");
      setValue("dob", personalDetails.dob || "");
      setValue(
        "nationality",
        personalDetails?.nationality && personalDetails?.nationalityId
          ? `${personalDetails.nationality}#${personalDetails.nationalityId}`
          : ""
      );
      setValue(
        "language",
        personalDetails?.language && personalDetails?.languageId
          ? `${personalDetails.language}#${personalDetails.languageId}`
          : ""
      );
      setValue(
        "gender",
        personalDetails.gender === "M" || personalDetails.gender === "Male"
          ? "Male"
          : personalDetails.gender === "F" || personalDetails.gender === "Female"
          ? "Female"
          : personalDetails.gender === "Others" || personalDetails.gender === "Other"
          ? "Others"
          : personalDetails.gender || ""
      );
    }
  }, [personalDetails, setValue]);

  const handleNext = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setIsLoading(true);
      const data = getValues();
      const stateMatch = states.find(
        (item) => String(item.id) === String(data.state)
      );

      const payload = {
        title: data.title,
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        nationality:data.nationality,
        language:data.language,
        address: data.address,
        pincode: data.pincode,
        state: data.state,
        district: data.district,
        country: data.country,
        sameAddress: data.sameAddress,
        communicationAddress: data.communicationAddress,
        communicationPincode: data.communicationPincode,
        communicationState: data.communicationState,
        communicationDistrict: data.communicationDistrict,
        communicationCountry: data.communicationCountry,
      };

      try {
        const res = await axios.put(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/update-phase-1`,
          payload,
          { withCredentials: true }
        );
        await toastHandler(
          res,
          "Updating Personal Details",
          "Personal Details Updated Successfully",
          "Error Updating Personal Details"
        );
        if (res.status === 200) {
          setAllData(res.data.data);
          // Refresh doctor data to update progress percentage
          await getDoctorData();
          nextStep();
        }
      } catch (error) {
        console.error("Error updating personal details:", error);
        toastHandler("error", "Error updating personal details");
      } finally {
        setIsLoading(false);
      }
    }
  }, [trigger, getValues, nextStep, setAllData, states, getDoctorData]);

  return (
    <div className="flex-1 p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="p-2">
        <h4 className="commonHeading mb-4 p-3">Personal Details</h4>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <select
              {...register("title", { required: "Title is required" })}
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Title"
            >
              <option value="" disabled>
                Select an option
              </option>
              {["Mr", "Ms", "Mrs", "Dr"].map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              {...register("fullName", {
                required: "Full Name is required",
                pattern: {
                  value: /^[A-Za-z\s]{2,}$/,
                  message: "Full Name must contain only letters and spaces, minimum 2 characters",
                },
              })}
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Full Name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">DOB</label>
            <input
              type="text"
              {...register("dob", { required: "Date of Birth is required" })}
              
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              aria-label="Date of Birth"
            />
            {errors.dob && (
              <p className="mt-1 text-sm text-red-500">{errors.dob.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Gender"
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nationality</label>
            <select
              {...register("nationality", { required: "Nationality is required" })}
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Nationality"
            >
              <option value="" disabled>
                Select an option
              </option>
              {countries.map((item, index) => (
                <option key={index} value={`${item.nationality}#${item.id}`}>
                  {item.nationality}
                </option>
              ))}
            </select>
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-500">{errors.nationality.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Language</label>
            <select
              {...register("language", { required: "Language is required" })}
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Language"
            >
              <option value="" disabled>
                Select an option
              </option>
              {languages.map((item, index) => (
                <option key={index} value={`${item.name}#${item.id}`}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-500">{errors.language.message}</p>
            )}
          </div>
        </div>

        <h4 className="commonHeading mb-4 p-3">Address as per KYC</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Colony/Street/Locality</label>
            <input
              type="text"
              placeholder="Enter Address as per KYC"
              {...register("address", { required: "Address is required" })}
              
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              aria-label="KYC Address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              placeholder="Enter Pincode"
              {...register("pincode", {
                required: "Pincode is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Pincode must be 6 digits",
                },
              })}
              
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              aria-label="KYC Pincode"
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-500">{errors.pincode.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              {...register("state", { required: "State is required" })}
              
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              aria-label="KYC State"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
            )}
            <input type="hidden" {...register("stateName")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
            <input
              type="text"
              {...register("district", { required: "District is required" })}
              
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              aria-label="KYC District"
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-500">{errors.district.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              {...register("country", { required: "Country is required" })}
              
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              aria-label="KYC Country"
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>
        </div>

        <h4 className="commonHeading mb-4 p-3">Communication Address</h4>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            {...register("sameAddress")}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            aria-label="Same as KYC address"
          />
          <label class12="text-sm text-gray-700">
            Is your communication address the same as above?
          </label>
        </div>

        {!sameAddress && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Colony/Street/Locality
              </label>
              <input
                type="text"
                placeholder="Enter Communication Address"
                {...register("communicationAddress", { required: "Communication Address is required" })}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Communication Address"
              />
              {errors.communicationAddress && (
                <p className="mt-1 text-sm text-red-500">{errors.communicationAddress.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pincode</label>
              <input
                type="text"
                placeholder="Enter Pincode"
                {...register("communicationPincode", {
                  required: "Communication Pincode is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Pincode must be 6 digits",
                  },
                })}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Communication Pincode"
              />
              {errors.communicationPincode && (
                <p className="mt-1 text-sm text-red-500">{errors.communicationPincode.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">State</label>
              <select
                {...register("communicationState", { required: "Communication State is required" })}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                aria-label="Communication State"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {states.map((item, index) => (
                  <option key={index} value={item.id+`#${item.name}#${item.isoCode}`}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.communicationState && (
                <p className="mt-1 text-sm text-red-500">{errors.communicationState.message}</p>
              )}
            </div>
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
              <select
                {...register("communicationDistrict", { required: "Communication District is required" })}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                disabled={!selectedState || isFetchingDistricts}
                aria-label="Communication District"
                aria-busy={isFetchingDistricts}
              >
                <option value="" disabled>
                  {isFetchingDistricts ? "Loading..." : "Select an option"}
                </option>
                {districts.map((item, index) => (
                  <option key={index} value={item.districtName+`#${item.isoCode}`}>
                    {item.districtName}
                  </option>
                ))}
              </select>
              {isFetchingDistricts && (
                <div className="absolute right-3 top-10 transform -translate-y-1/2">
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                </div>
              )}
              {errors.communicationDistrict && (
                <p className="mt-1 text-sm text-red-500">{errors.communicationDistrict.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
              <select
                {...register("communicationCountry", { required: "Communication Country is required" })}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                aria-label="Communication Country"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {countries.map((item, index) => (
                  <option key={index} value={`${item.enShortName}#${item.id}`}>
                    {item.enShortName}
                  </option>
                ))}
              </select>
              {errors.communicationCountry && (
                <p className="mt-1 text-sm text-red-500">{errors.communicationCountry.message}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 0 && (
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm disabled:bg-gray-400"
              onClick={prevStep}
              disabled={isLoading}
              aria-label="Back"
            >
              Back
            </button>
          )}
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-blue-400"
            onClick={handleNext}
            disabled={isLoading}
            aria-label={step < 4 ? "Save and Next" : "Submit Data"}
          >
            {isLoading ? ( 
              <div className="flex items-center gap-2">
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
              </div>
            ) : step < 4 ? (
              "Save and Next"
            ) : (
              "Submit Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

PersonalDetails.propTypes = {
  step: PropTypes.number.isRequired,
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  personalDetails: PropTypes.object,
  addressPerKyc: PropTypes.object,
  setAllData: PropTypes.func.isRequired,
  states: PropTypes.array.isRequired,
  countries: PropTypes.array.isRequired,
  districts: PropTypes.array.isRequired,
  setDistricts: PropTypes.func.isRequired,
};

export default React.memo(PersonalDetails);