import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const DoctorIdGenerate = () => {
  const {
    register,
    handleSubmit,
    watch,
    //getValues,
    formState: { errors },
  } = useForm();
  const { Login } = useDoctorAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const selectedCategory = watch("category"); // Watch category to update subcategories

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const selectedSubCategory = watch("subCategory"); // Watch subcategory to enable specialization

  // Hardcoded specialization data mapped by subCategory codes
  const specializations = {
    "Modern Medicine#1": [
      { specialization: "Cardiologist", code: "CAR" },
      { specialization: "Neurologist", code: "NEU" },
      { specialization: "Orthopaedic Surgeon", code: "ORT" },
      { specialization: "Gastroenterologist", code: "GAS" },
      { specialization: "Dermatologist", code: "DER" },
      { specialization: "Pediatrician", code: "PED" },
      { specialization: "Radiologist", code: "RAD" },
      { specialization: "Psychiatrist", code: "PSY" },
      { specialization: "Endocrinologist", code: "END" },
      { specialization: "Pulmonologist", code: "PUL" },
      { specialization: "Nephrologist", code: "NEP" },
      { specialization: "Oncologist", code: "ONC" },
      { specialization: "ENT Specialist", code: "ENT" },
      { specialization: "Ophthalmologist", code: "OPH" },
      { specialization: "Urologist", code: "URO" },
      { specialization: "General Surgeon", code: "GSU" },
      { specialization: "Plastic Surgeon", code: "PLS" },
      { specialization: "Emergency Medicine", code: "EMR" },
      { specialization: "Family Physician", code: "FAM" },
      { specialization: "Rheumatologist", code: "RHE" },
      { specialization: "Infectious Disease", code: "INF" },
    ],
    "Dentist#2": [
      { specialization: "Orthodontist", code: "ORTH" },
      { specialization: "Periodontist", code: "PERI" },
      { specialization: "Endodontist", code: "ENDO" },
      { specialization: "Prosthodontist", code: "PROS" },
      { specialization: "Oral & Maxillofacial Surgeon", code: "OMS" },
      { specialization: "Pediatric Dentist", code: "PEDD" },
      { specialization: "Oral Medicine", code: "OMD" },
    ],
    "Homoeopathy#3": [
      { specialization: "General Homoeopathy", code: "HOM" },
      { specialization: "Pediatric Homoeopathy", code: "PHO" },
      { specialization: "Dermatologic Homoeopathy", code: "DHO" },
      { specialization: "Psychiatric Homoeopathy", code: "PSH" },
    ],
    "Ayurveda#4": [
      { specialization: "Panchakarma Specialist", code: "PAN" },
      { specialization: "Kayachikitsa (Internal Medicine)", code: "KAY" },
      { specialization: "Shalya Tantra (Surgery)", code: "SHY" },
      { specialization: "Shalakya Tantra (ENT & Ophthalmology)", code: "SHL" },
      { specialization: "Bala Roga (Pediatrics)", code: "BAL" },
      { specialization: "Rasashastra & Bhaishajya Kalpana", code: "RAS" },
    ],
    "Unani#5": [
      { specialization: "General Unani", code: "UNA" },
      { specialization: "Tibb-e-Akbar (Internal Medicine)", code: "TAB" },
      {
        specialization:
          "Ilmul Qabalat wa Amraze Niswan (Obstetrics & Gynaecology)",
        code: "IQN",
      },
    ],
    "Siddha#6": [
      { specialization: "Siddha Medicine", code: "SID" },
      { specialization: "Siddha Pulmonology", code: "SPD" },
    ],
    "Sowa-Rigpa#7": [
      { specialization: "Traditional Sowa-Rigpa", code: "SOW" },
      { specialization: "Sowa-Rigpa Internal Medicine", code: "SRM" },
    ],
    "RANM#8": [
      { specialization: "General Nursing", code: "GN" },
      { specialization: "Community Health Nurse", code: "CHN" },
    ],
    "RN#9": [
      { specialization: "Registered Nurse Specialist", code: "RNS" },
      { specialization: "Critical Care Nurse", code: "CCN" },
      { specialization: "Pediatric Nurse", code: "PEN" },
      { specialization: "Psychiatric Nurse", code: "PSN" },
    ],
    "RN & RM#10": [
      { specialization: "Midwifery Specialist", code: "MID" },
      { specialization: "Maternal & Child Health", code: "MCH" },
    ],
    "RLHV#11": [
      { specialization: "Rural Health Specialist", code: "RHS" },
      { specialization: "Primary Health Care", code: "PHC" },
    ],
  };

  // Hardcoded subcategory data
  const doctorSubcategories = [
    { subCategory: "Modern Medicine", code: 1 },
    { subCategory: "Dentist", code: 2 },
    { subCategory: "Homoeopathy", code: 3 },
    { subCategory: "Ayurveda", code: 4 },
    { subCategory: "Unani", code: 5 },
    { subCategory: "Siddha", code: 6 },
    { subCategory: "Sowa-Rigpa", code: 7 },
    // Added the Sub-categoies but no specializations for these subcategories (Remember this) 🚨
    { subCategory: "Nutrician", code: 8 },
    { subCategory: "Dietician", code: 9 },
  ];

  const nurseSubcategories = [
    { subCategory: "RANM", code: 8 },
    { subCategory: "RN", code: 9 },
    { subCategory: "RN & RM", code: 10 },
    { subCategory: "RLHV", code: 11 },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    const {
      role,
      category,
      subCategory,
      specialization,
      healthcareId,
      password,
    } = data;
    const email = localStorage.getItem("signupEmail");
    const mobileNumber = localStorage.getItem("signupMobile");
    const fullName = localStorage.getItem("signupName");
    const emailOtp = localStorage.getItem("emailOtp");
    const mobileOtp = localStorage.getItem("mobileOtp");
    const fullHealthcareId = `${healthcareId}@hpr.abdm`;

    // Validate all required fields
    if (!email || !mobileNumber || !fullName || !emailOtp || !mobileOtp) {
      toast.error("Please complete the sign-up process first.");
      setLoading(false);
      return;
    }

    if (!role || !category || !subCategory || !specialization || !healthcareId || !password) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Server expects subCategory and specialization in format 'name#id'
    // Keep the full format as it comes from the form (e.g., "Modern Medicine#1")
    // Don't parse it - send it as-is

    // Server expects role as a string (it calls .trim() on it)
    // Server expects subCategory and specialization in format 'name#id' (full format)
    const payload = {
      email,
      mobileNumber,
      fullName,
      emailOtp,
      mobileOtp,
      role: String(role), // Ensure role is a string
      category,
      subCategory: subCategory, // Send full format: "Modern Medicine#1"
      specialization: specialization, // Send full format: "Cardiologist#CAR"
      userName: fullHealthcareId,
      password,
    };

    // Log payload for debugging (remove sensitive data in production)
    const logPayload = {
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      fullName: payload.fullName,
      emailOtp: "***",
      mobileOtp: "***",
      role: payload.role,
      category: payload.category,
      subCategory: payload.subCategory,
      specialization: payload.specialization,
      userName: payload.userName,
      password: "***"
    };
    console.log("Sending doctor creation payload:", logPayload);
    console.log("Full payload structure:", JSON.stringify(payload, null, 2).replace(/"password":\s*"[^"]*"/, '"password": "***"').replace(/"emailOtp":\s*"[^"]*"/, '"emailOtp": "***"').replace(/"mobileOtp":\s*"[^"]*"/, '"mobileOtp": "***"'));

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Doctor ID Generated Successfully!");

      // Check if TOTP setup is required
      // Response structure: { statusCode: 200, message: "...", data: { userId: "...", requiresTotpSetup: true } }
      console.log("Doctor creation response:", response.data);
      
      // Handle both possible response structures
      const responseData = response.data?.data || response.data;
      const requiresTotpSetup = responseData?.requiresTotpSetup;
      const userId = responseData?.userId;

      if (requiresTotpSetup && userId) {
        console.log("TOTP setup required, navigating to TOTP setup page");
        // Clean up localStorage
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("signupMobile");
        localStorage.removeItem("signupName");
        localStorage.removeItem("emailOtp");
        localStorage.removeItem("mobileOtp");
        
        // Navigate to TOTP setup
        localStorage.setItem("totpSetupUserId", userId);
        navigate("/totp-setup", { state: { userId: userId } });
      } else {
        console.log("TOTP setup not required, auto-logging in");
        // Auto login after successful registration (only if TOTP is not required)
        const loginPayload = {
          email: email,
          password: password,
        };

        await Login(loginPayload, navigate);

        // Clean up localStorage
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("signupMobile");
        localStorage.removeItem("signupName");
        localStorage.removeItem("emailOtp");
        localStorage.removeItem("mobileOtp");
      }
    } catch (error) {
      console.error("Doctor Creation Failed:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.response?.data?.message);
      
      // Show more detailed error message
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to generate Doctor ID. Please try again.";
      
      toast.error(errorMessage);
      
      // Log full error details for debugging
      if (error.response?.data) {
        console.error("Full error response:", JSON.stringify(error.response.data, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center bg-gray-100 p-7'>
      <div className='w-full max-w-4xl rounded-lg bg-white p-14 shadow-md lg:max-w-5xl xl:max-w-6xl'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Roles Selection */}
          <div>
            <label className='block font-medium'>Roles</label>
            <div className='mt-2 flex flex-col gap-3'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  {...register("role", { required: "Please select a role" })}
                  value='1'
                  className='form-radio'
                />
                I am a Healthcare Professional
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  {...register("role", { required: "Please select a role" })}
                  value='3'
                  className='form-radio'
                />
                I am a Healthcare Professional & Facility Manager
              </label>
            </div>
            {errors.role && (
              <p className='text-sm text-red-500'>{errors.role.message}</p>
            )}
          </div>

          {/* Category, Subcategory & Specialization */}
          <div className='grid grid-cols-3 gap-6'>
            {/* Category */}
            <div>
              <label className='block font-medium'>Category</label>
              <select
                {...register("category", { required: "Category is required" })}
                className='w-full rounded border p-3'
                aria-label='Select Category'
              >
                <option value=''>Select</option>
                <option value='Doctor'>Doctor</option>
                <option value='Nurse'>Nurse</option>
              </select>
              {errors.category && (
                <p className='text-sm text-red-500'>
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Sub Category */}
            <div>
              <label className='block font-medium'>Sub Category</label>
              <select
                {...register("subCategory", {
                  required: "Sub Category is required",
                })}
                className='w-full rounded border p-3'
                aria-label='Select Sub Category'
                disabled={!selectedCategory} // Disable until category is selected
              >
                <option value=''>Select</option>
                {(selectedCategory === "Doctor"
                  ? doctorSubcategories
                  : nurseSubcategories
                ).map((item) => (
                  <option
                    key={item.code}
                    value={`${item.subCategory}#${item.code}`}
                  >
                    {item.subCategory}
                  </option>
                ))}
              </select>
              {errors.subCategory && (
                <p className='text-sm text-red-500'>
                  {errors.subCategory.message}
                </p>
              )}
            </div>

            {/* Specialization */}
            <div>
              <label className='block font-medium'>Specialization</label>
              <select
                {...register("specialization", {
                  required: "Specialization is required",
                })}
                className='w-full rounded border p-3'
                aria-label='Select Specialization'
                disabled={!selectedSubCategory} // Disable until subcategory is selected
              >
                <option value=''>Select</option>
                {selectedSubCategory &&
                  specializations[selectedSubCategory]?.map((item) => (
                    <option
                      key={item.code}
                      value={`${item.specialization}#${item.code}`}
                    >
                      {item.specialization}
                    </option>
                  ))}
              </select>
              {errors.specialization && (
                <p className='text-sm text-red-500'>
                  {errors.specialization.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Row for ID, Password & Confirm Password */}
          <div className='grid grid-cols-3 gap-6'>
            <div className='relative w-full'>
              <label className='mb-1 block font-medium'>
                Healthcare Professional ID / Username
              </label>

              <div className='relative'>
                {/* Input only for username */}
                <input
                  type='text'
                  {...register("healthcareId", {
                    required: "Healthcare ID is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+$/,
                      message:
                        "Only letters, numbers, dots, underscores allowed",
                    },
                  })}
                  placeholder='username'
                  className='w-full rounded border p-3 pr-28'
                />

                {/* Suffix inside input field */}
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
                  @hpr.abdm
                </span>
              </div>

              {errors.healthcareId && (
                <p className='text-sm text-red-500'>
                  {errors.healthcareId.message}
                </p>
              )}
            </div>

            <div>
              <label className='block font-medium'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Password must include uppercase, lowercase, number, and special character",
                    },
                  })}
                  className='w-full rounded border p-3 pr-10'
                  aria-label='Password'
                />
                <button
                  type='button'
                  onClick={togglePassword}
                  className='absolute inset-y-0 right-3 flex items-center'
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className='block font-medium'>Confirm Password</label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  className='w-full rounded border p-3 pr-10'
                  aria-label='Confirm Password'
                />
                <button
                  type='button'
                  onClick={toggleConfirmPassword}
                  className='absolute inset-y-0 right-3 flex items-center'
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-sm text-red-500'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          {/* <button
            type='button'
            className='mt-4 rounded bg-gray-500 p-2 text-white'
            onClick={() => console.log("Current Values:", getValues())}
          >
            Debug Form Data
          </button> */}

          <button
            type='submit'
            className='w-full rounded-lg bg-blue-500 p-3 text-white transition hover:bg-blue-600 disabled:bg-blue-300'
            disabled={loading}
          >
            {loading ? "Generating..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorIdGenerate;
