import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_BASE_URL, 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/**
 * Normalizes doctor data - simple approach using backend data as-is
 * Only normalizes nested objects for consistent structure
 * 
 * @param {Object} rawDoctor - Raw doctor data from backend
 * @returns {Object} Normalized doctor object
 */
const normalizeDoctorData = (rawDoctor) => {
  if (!rawDoctor || typeof rawDoctor !== 'object') {
    console.error('⚠️ Invalid doctor data received:', rawDoctor);
    return null;
  }

  // Extract docRefId - handle populated objects, strings, or missing values
  let docRefId = undefined;
  if (rawDoctor.docRefId !== undefined && rawDoctor.docRefId !== null) {
    if (typeof rawDoctor.docRefId === 'object' && rawDoctor.docRefId._id) {
      docRefId = rawDoctor.docRefId._id.toString();
    } else {
      docRefId = rawDoctor.docRefId.toString();
    }
  }

  // Simple warning if docRefId is missing (but don't try to fix it)
  if (!docRefId) {
    console.log("rawDoctor", rawDoctor);
    console.warn('⚠️ docRefId is missing from backend response:', {
      _id: rawDoctor._id,
      docRefId: rawDoctor.docRefId,
    });
  }

  // Build normalized doctor object - use backend data as-is
  const normalizedDoctor = {
    ...rawDoctor,
    _id: rawDoctor._id ? rawDoctor._id.toString() : rawDoctor._id,
    docRefId: docRefId, // Use extracted docRefId or undefined
    // Normalize nested objects for consistent structure
    personalDetails: {
      fullName: rawDoctor.fullName || rawDoctor.personalDetails?.fullName || "",
      emailId: rawDoctor.emailId || rawDoctor.personalDetails?.emailId || "",
      mobileNumber: rawDoctor.mobileNumber || rawDoctor.personalDetails?.mobileNumber || "",
      gender: rawDoctor.gender || rawDoctor.personalDetails?.gender || "",
      nationality: rawDoctor.nationality || rawDoctor.personalDetails?.nationality || "",
      ...(rawDoctor.personalDetails || {}),
    },
    addressPerKyc: {
      address: rawDoctor.address || rawDoctor.addressPerKyc?.address || "",
      pincode: rawDoctor.pincode || rawDoctor.addressPerKyc?.pincode || "",
      state: rawDoctor.state || rawDoctor.addressPerKyc?.state || "",
      district: rawDoctor.district || rawDoctor.addressPerKyc?.district || "",
      country: rawDoctor.country || rawDoctor.addressPerKyc?.country || "",
      ...(rawDoctor.addressPerKyc || {}),
    },
    registrationDetails: {
      registerWithCouncil: rawDoctor.registerWithCouncil || rawDoctor.registrationDetails?.registerWithCouncil || "",
      registrationNumber: rawDoctor.registrationNumber || rawDoctor.registrationDetails?.registrationNumber || "",
      ...(rawDoctor.registrationDetails || {}),
    },
    qualificationDetails: {
      degreeName: rawDoctor.degreeName || rawDoctor.qualificationDetails?.degreeName || "",
      university: rawDoctor.university || rawDoctor.qualificationDetails?.university || "",
      ...(rawDoctor.qualificationDetails || {}),
    },
    currentWorkDetails: {
      facilityName: rawDoctor.facilityName || rawDoctor.currentWorkDetails?.facilityName || "",
      currentlyWorking: rawDoctor.currentlyWorking || rawDoctor.currentWorkDetails?.currentlyWorking || "",
      ...(rawDoctor.currentWorkDetails || {}),
    },
  };

  return normalizedDoctor;
};

export const useDoctorAuthStore = create((set, get) => ({
  doctor: null,
  isLoggingIn: false,
  isCheckingAuth: false,
  isVerifyingOTP: false,
  isResendingOTP: false,
  isUpdatingProfile: false,
  isDeletingAccount: false,

  // Add setDoctor function to allow components to update doctor data
  // Supports both direct value and function updates (like React's setState)
  setDoctor: (doctorData) => {
    if (typeof doctorData === 'function') {
      set((state) => ({ doctor: doctorData(state.doctor) }));
    } else {
      set({ doctor: doctorData });
    }
  },

  checkDoctorAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.post('/doctor/doctorLoginGet', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.data.success) {
        const rawDoctor = response.data.data;
        const normalizedDoctor = normalizeDoctorData(rawDoctor);
        
        if (!normalizedDoctor) {
          console.error('Failed to normalize doctor data in checkDoctorAuth');
          set({ doctor: null, isCheckingAuth: false });
          return false;
        }

        set({ doctor: normalizedDoctor, isCheckingAuth: false });
        return true;
} else {
        set({ doctor: null, isCheckingAuth: false });
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ doctor: null, isCheckingAuth: false });
      return false;
    }
  },

  Login: async (credentials, navigate) => {
    set({ isLoggingIn: true });
    const toastId = toast.loading("Logging in...");

    try {
      const requestPayload = {...credentials, role:"expert"};
      
      const response = await axiosInstance.post(
        '/doctor/doctorLogin',
        requestPayload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      // Handle both possible response structures
      const responseData = response.data.data || response.data;
      const step = responseData?.step || response.data?.step;
      const email = responseData?.email || response.data?.email;

      if (response.data.statusCode === 200 || response.data.success) {
        // Check if TOTP verification is required
        if (responseData?.requiresTotp && responseData?.loginToken) {
          set({ isLoggingIn: false });
          toast.dismiss(toastId);
          return {
            requiresTotp: true,
            loginToken: responseData.loginToken,
            userId: responseData.userId,
          };
        }

        // Check if email verification is required (check both possible locations)
        if (step === "EMAIL_VERIFICATION_REQUIRED") {
          set({ isLoggingIn: false });
          toast.dismiss(toastId);
          // Return the email verification info instead of completing login
          return {
            emailVerificationRequired: true,
            email: email,
            credentials: credentials, // Store credentials for resubmission with OTP
          };
        }

        // After successful login, fetch complete doctor data to ensure docRefId is included
        // The login endpoint might not return docRefId, but doctorLoginGet does
        const { getDoctorData } = get();
        const completeDoctorData = await getDoctorData();
        
        if (!completeDoctorData) {
          console.error('Failed to fetch complete doctor data after login');
          throw new Error('Failed to fetch complete doctor data');
        }

        // Save normalized profile ID to localStorage
        if (completeDoctorData._id) {
          localStorage.setItem("userId", completeDoctorData._id);
        }

        set({ doctor: completeDoctorData, isLoggingIn: false });

        toast.success("Login successful!", { toastId });
        
        // Navigate to dashboard if navigate function is provided
        if (navigate && typeof navigate === 'function') {
          navigate("/dashboard");
        } else {
          console.error("Navigate function is not available");
          // Fallback: use window.location if navigate is not available
          window.location.href = "/dashboard";
        }
        
        return completeDoctorData;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoggingIn: false });

      toast.error(error.message || "An error occurred during login", { toastId });
      throw error;
    }
    finally {
      toast.dismiss(toastId);
    }
  },

  getDoctorData: async () => {
    try {
      const res = await axiosInstance.post('/doctor/doctorLoginGet', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      if (res.data.success) {
        const rawDoctor = res.data.data;
        const normalizedDoctor = normalizeDoctorData(rawDoctor);
        
        if (!normalizedDoctor) {
          console.error('Failed to normalize doctor data in getDoctorData');
          set({ doctor: null });
          return null;
        }
        
        set({ doctor: normalizedDoctor });
        return normalizedDoctor;
      } else {
        set({ doctor: null });
        return null;
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch doctor data");
      set({ doctor: null });
      throw error;
    }
  },

  doctorLogout: async () => {
    const toastId = toast.loading("Logging out...");
    try {
      const response = await axiosInstance.put("/doctor/logout");

      if (response.data.success === true) {
        toast.success("Logout successful", { toastId })
        set({ doctor: null });
        return true;
      } else {
        toast.error("Logout failed", { toastId });
      }
    } catch (error) {
      console.error("There is an issue while logging out:", error);
      toast.error("Issue while logging out", { toastId });
    } finally {
      toast.dismiss(toastId);
    }
  },


  verifyDoctorOTP: async (otp) => {
    set({ isVerifyingOTP: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/auth/verify-otp`, { otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Normalize doctor data
      const normalizedDoctor = normalizeDoctorData(res.data.doctor);
      
      if (!normalizedDoctor) {
        console.error('Failed to normalize doctor data after OTP verification');
        set({ isVerifyingOTP: false });
        throw new Error('Invalid doctor data received after OTP verification');
      }
      
      set({ doctor: normalizedDoctor, isVerifyingOTP: false });
      localStorage.setItem("doctor", JSON.stringify(normalizedDoctor));
      toast.success("OTP verified successfully");
      return normalizedDoctor;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
      set({ isVerifyingOTP: false });
      throw error;
    }
  },

  resendDoctorOTP: async () => {
    set({ isResendingOTP: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/auth/resend-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ isResendingOTP: false });
      toast.success("OTP resent successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      set({ isResendingOTP: false });
      throw error;
    }
  },

updateDoctorProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const doctorId = get().doctor?._id; // get current logged in doctor
    if (!doctorId) throw new Error("Doctor ID not found");

    const formData = new FormData();
    // loop over data to append (works for text + file uploads)
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const res = await axiosInstance.put(
      `/doctorProfile/update/${doctorId}`,
      formData,
      {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Normalize the updated doctor data
    const normalizedDoctor = normalizeDoctorData(res.data);
    
    if (!normalizedDoctor) {
      console.error('Failed to normalize doctor data after profile update');
      set({ isUpdatingProfile: false });
      throw new Error('Failed to normalize updated doctor data');
    }
    
    set({ doctor: normalizedDoctor, isUpdatingProfile: false });
    localStorage.setItem("doctor", JSON.stringify(normalizedDoctor));
    toast.success("Profile updated successfully");
    return normalizedDoctor;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update profile");
    set({ isUpdatingProfile: false });
    throw error;
  }
},


  deleteDoctorAccount: async () => {
    set({ isDeletingAccount: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/auth/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ doctor: null, isDeletingAccount: false });
      localStorage.removeItem("doctor");
      localStorage.removeItem("token");
      toast.success("Account deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
      set({ isDeletingAccount: false });
      throw error;
    }
  }
})); 
