import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import TOTPLoginVerify from "../TOTP/TOTPLoginVerify";

import { useForm, FormProvider, useFormContext } from "react-hook-form";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginWithOtp, setLoginWithOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [storedCredentials, setStoredCredentials] = useState(null);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [loginToken, setLoginToken] = useState(null);
  const [totpUserId, setTotpUserId] = useState(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const { getDoctorData } = useDoctorAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { Login } = useDoctorAuthStore();

  // Add a separate form instance for forgot password
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm({
    defaultValues: {
      forgotEmail: "",
    },
  });

  const handleForgotPassword = async (data) => {
    setResetLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/forgetPassword`, {
        emailId: data.forgotEmail.trim(), // Correct key name
      });

      if (response.data.success) {
        toast.success("Password reset link has been sent to your email");
        setShowForgotPassword(false);
        resetForgotForm();
      }
    } catch (error) {
      console.error("Password Reset Failed:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to send reset link. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const sendOtp = async (input) => {
    let payload = {};

    // Regex patterns to validate email, mobile number, and doctorId
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^[0-9]{10}$/; // Assuming 10-digit mobile numbers
    const doctorIdPattern = /^[a-zA-Z0-9]+$/; // Adjust as per your doctorId format

    if (emailPattern.test(input)) {
      payload = { email: input };
    } else if (mobilePattern.test(input)) {
      payload = { mobileNumber: input };
    } else if (doctorIdPattern.test(input)) {
      payload = { doctorId: input };
    } else {
      toast.error("Please enter a valid email, mobile number, or Doctor ID.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-otp`,
        payload
      );

      if (response.data?.success) {
        toast.success(response.data?.message || "OTP sent successfully!");
        setOtpSent(true);
      } else {
        // Server responded 200 but did not indicate success
        toast.error(response.data?.message || "Failed to send OTP. Please try again.");
        setOtpSent(false);
      }
    } catch (error) {
      // Prefer error.response (server response) but fallback to generic error
      const resp = error.response;
      console.error("OTP Sending Failed:", resp ?? error);

      const status = resp?.status;
      const serverMsg = resp?.data?.message;

      if (status === 409) {
        // common for "OTP already sent" or rate-limit conflicts
        toast.error(serverMsg || "OTP already requested. Please wait before requesting again.");
      } else {
        toast.error(serverMsg || "Failed to send OTP. Please try again.");
      }

      setOtpSent(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let payload = {};

    if (requiresTotp && loginToken) {
      try {
        const payload = {
          loginToken,
          ...(useBackupCode
            ? { backupCode: data.code }
            : { token: data.totpToken }),
        };
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_BASE_URL}/auth/login/totp`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",

            },
            withCredentials: true,
          }
        );

        if (response.data.statusCode === 200) {
          // console.log(response.data);
          // Save token
          // if (response.data.data.token) {
          //   localStorage.setItem("token", response.data.data.token);
          // }

          // Fetch complete doctor data
          const doctorData = await getDoctorData();
          if (doctorData) {
            toast.success("Login successful!");
            if (doctorData) {
              navigate("/dashboard");
            } 
            // else {
            //   navigate("/");
            // }
          } else {
            toast.error("Failed to fetch user data");
          }
        } else {
          toast.error(response.data.message || "Invalid TOTP code");
        }
      } catch (error) {
        console.error("TOTP verification error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to verify TOTP";

        if (error.response?.status === 429) {
          toast.error(
            `Too many failed attempts. Please try again after ${new Date(
              error.response.data.data?.lockedUntil
            ).toLocaleTimeString()}`
          );
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // If email verification is required and OTP is being submitted
    if (requiresEmailVerification && data.emailOtp) {
      // Verify OTP using the verify-login-otp endpoint
      const verifyPayload = {
        email: verificationEmail,
        otp: data.emailOtp.toString().trim(),
      };

      try {
        // Call verify-login-otp endpoint
        const verifyResponse = await axios.post(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/verify-login-otp`,
          verifyPayload,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        if (verifyResponse.data?.success && verifyResponse.data?.data) {
          // Backend returns: { success: true, message: "...", data: { ...userData, token } }
          const userData = verifyResponse.data.data;

          // Save userId to localStorage
          if (userData?._id) {
            localStorage.setItem("userId", userData._id);
          }

          // Update doctor store with normalized data
          const { setDoctor } = useDoctorAuthStore.getState();
          const normalizedDoctor = {
            ...userData,
            personalDetails: {
              fullName: userData.fullName || "",
              emailId: userData.emailId || "",
              mobileNumber: userData.mobileNumber || "",
            },
            addressPerKyc: {
              address: userData.address || "",
              pincode: userData.pincode || "",
              state: userData.state || "",
              district: userData.district || "",
              country: userData.country || "",
            },
          };
          setDoctor(normalizedDoctor);

          // Show success message and navigate
          toast.success("OTP verified successfully! Login successful.");

          // Navigate to dashboard
          navigate("/dashboard");
        } else {
          toast.error(verifyResponse.data?.message || "OTP verification failed");
        }
      } catch (error) {
        // Handle errors gracefully
        const errorMessage = error.response?.data?.message || error.message || "OTP verification failed";

        if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("expired")) {
          toast.error("Invalid or expired OTP. Please check and try again.");
        } else if (errorMessage.toLowerCase().includes("not found")) {
          toast.error("OTP not found. Please request a new OTP.");
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Detect input type (email, mobile number, or doctorId)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^[0-9]{10}$/; // Assuming 10-digit mobile numbers
    const doctorIdPattern = /^[a-zA-Z0-9]+$/; // Adjust as per your doctorId format

    const input = data.email.trim();
    let identifierField = {};

    if (emailPattern.test(input)) {
      identifierField = { email: input };
    } else if (mobilePattern.test(input)) {
      identifierField = { mobileNumber: input };
    } else if (doctorIdPattern.test(input)) {
      identifierField = { doctorId: input };
    } else {
      toast.error("Please enter a valid email, mobile number, or Doctor ID.");
      setLoading(false);
      return;
    }

    if (loginWithOtp) {
      payload = {
        ...identifierField,
        otp: data.otp,
      };
    } else {
      payload = {
        ...identifierField,
        password: data.password,
      };
    }

    try {
      const result = await Login(payload, navigate);

      // Check if TOTP verification is required
      if (result?.requiresTotp && result?.loginToken) {
        setRequiresTotp(true);
        setLoginToken(result.loginToken);
        setTotpUserId(result.userId);
        toast.success("Password verified. Please enter your TOTP code.");
        return;
      }

      // Check if email verification is required
      if (result?.emailVerificationRequired) {
        setRequiresEmailVerification(true);
        setVerificationEmail(result.email);
        setStoredCredentials(payload);
        toast.success(`OTP sent to ${result.email}. Please enter the OTP to continue.`);
      }
      // If login succeeds, it will navigate automatically
    } catch (error) {
      console.error("Login Failed:", error);
      if (error.response?.data?.message === "User not found") {
        toast.error("User not found. Please make an account.");
        navigate("/register");
      } else if (error.response?.data?.message === "Invalid password") {
        toast.error("Invalid password");
      } else if (error.response?.data?.message === "Inavlid OTP") {
        toast.error("Invalid OTP");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="flex items-center justify-center p-2 sm:p-4 bg-gray-100">
        <div className="w-full max-w-4xl lg:max-w-5xl rounded-lg border mt-3 p-4 sm:p-6 md:p-10 lg:p-14 bg-white shadow-lg flex flex-col lg:flex-row">
          {/* Left Section - Features */}
          <div className="w-full lg:w-4/5 pr-0 lg:pr-6 mb-4 lg:mb-0 hidden md:block">
            <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 mb-4">
              Keep track of your patient's health
              with this powerful app that makes it easy to communicate with them.
            </h4>
            {/* <p className="text-gray-600 mb-4">
          </p> */}
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
              <li>Create a professional profile</li>
              <li>Set available timings</li>
              <li>Accept/Reject appointments</li>
              <li>Real-time chat with patients</li>
              <li>Read patient reviews</li>
              <li>Check customer reviews</li>
              <li>Easy login with OTP verification</li>
              <li>Multi-Lingual support including RTL</li>
            </ul>
          </div>

          {/* Right Section - Login Form */}
          <div className="w-full lg:w-3/5 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 shadow p-3 sm:p-4 md:p-6 rounded">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* TOTP Verification Section */}
             
              {requiresTotp && loginToken ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-blue-800 mb-4">
                      Two-factor authentication is enabled. Please enter the 6-digit code
                      from your authenticator app.
                    </p>

                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setUseBackupCode(!useBackupCode);
                          setValue("totpToken", "");
                          setValue("code", "");
                        }}
                        className="text-sm text-[#0095D9] hover:underline"
                      >
                        {useBackupCode
                          ? "Use authenticator app code"
                          : "Use backup code instead"}
                      </button>
                    </div>

                    {/* <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> */}
                    {useBackupCode ? (
                      <div>
                        <label className="block font-medium text-gray-700 text-sm sm:text-base mb-1">
                          Enter backup code
                        </label>
                        <input
                          type="text"
                          {...register("code", {
                            required: "Backup code is required",
                            pattern: {
                              value: /^[0-9]{8}$/,
                              message: "Backup code must be 8 digits",
                            },
                          })}
                          className="w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
                          placeholder="00000000"
                          maxLength={8}
                        />
                        {errors.code && (
                          <p className="text-xs sm:text-sm text-red-500 mt-1">
                            {errors.code.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block font-medium text-gray-700 text-sm sm:text-base mb-1">
                          Enter 6-digit code
                        </label>
                        <input
                          type="text"
                          {...register("totpToken", {
                            required: "TOTP code is required",
                            pattern: {
                              value: /^[0-9]{6}$/,
                              message: "TOTP code must be 6 digits",
                            },
                          })}
                          className="w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
                          placeholder="000000"
                          maxLength={6}
                        />
                        {errors.totpToken && (
                          <p className="text-xs sm:text-sm text-red-500 mt-1">
                            {errors.totpToken.message}
                          </p>
                        )}
                      </div>
                    )}
                    {/* </form> */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-[#0095D9] py-2.5 sm:py-3 font-semibold text-white hover:bg-[#007bbd] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>

                  </div>
                </div>
              ) : requiresEmailVerification ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      Email verification required. We've sent a 6-digit OTP to <strong>{verificationEmail}</strong>
                    </p>
                  </div>
                  <div>
                    <label className='block font-medium text-gray-700 text-sm sm:text-base'>
                      Enter Email Verification OTP
                    </label>
                    <input
                      type='text'
                      {...register("emailOtp", {
                        required: "OTP is required",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "OTP must be 6 digits"
                        }
                      })}
                      className='mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]'
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    {errors.emailOtp && (
                      <p className='text-xs sm:text-sm text-red-500 mt-1'>{errors.emailOtp.message}</p>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setRequiresEmailVerification(false);
                      setVerificationEmail("");
                      setStoredCredentials(null);
                      setValue("emailOtp", "");
                    }}
                    className='text-[#0095D9] hover:underline text-xs sm:text-sm font-medium'
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 text-sm sm:text-base">
                      Mobile Number / HF ID / Email ID
                    </label>
                    <input
                      type="text"
                      {...register("email", {
                        required: "Email, mobile number, or Doctor ID is required",
                      })}
                      className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
                      placeholder="Enter email, mobile, or ID"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {!loginWithOtp ? (
                    <div>
                      <label className='block font-medium text-gray-700 text-sm sm:text-base'>
                        Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("password", {
                            required: "Password is required",
                          })}
                          className='mt-1 w-full rounded-lg border p-2.5 sm:p-3 pr-10 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]'
                          placeholder="Enter your password"
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute inset-y-0 right-3 flex items-center text-gray-600'
                        >
                          {showPassword ? <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className='text-xs sm:text-sm text-red-500 mt-1'>
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className='block font-medium text-gray-700 text-sm sm:text-base'>
                        Enter OTP
                      </label>
                      <div className='flex flex-col sm:flex-row gap-2 sm:space-x-2'>
                        <input
                          type='text'
                          {...register("otp", { required: "OTP is required" })}
                          className='w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]'
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                        {!otpSent ? (
                          <button
                            type='button'
                            onClick={() =>
                              sendOtp(
                                document.querySelector('input[name="email"]').value
                              )
                            }
                            className='rounded-lg bg-[#0095D9] px-4 py-2.5 sm:py-2 text-white hover:bg-[#007bbd] text-sm sm:text-base whitespace-nowrap'
                          >
                            Send OTP
                          </button>
                        ) : (
                          <button
                            type='button'
                            className='cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2.5 sm:py-2 text-gray-700 text-sm sm:text-base whitespace-nowrap'
                            disabled
                          >
                            OTP Sent
                          </button>
                        )}
                      </div>
                      {errors.otp && (
                        <p className='text-xs sm:text-sm text-red-500 mt-1'>{errors.otp.message}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {!requiresTotp && !requiresEmailVerification && (
                <>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-400'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        {...register("rememberMe")}
                        className='mr-2'
                      />
                      <span>Remember me for 30 days</span>
                    </label>
                    <button
                      type='button'
                      onClick={() => setShowForgotPassword(true)}
                      className='text-[#0095D9] hover:underline whitespace-nowrap'
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className='text-left'>
                    <button
                      type='button'
                      onClick={() => {
                        setLoginWithOtp(!loginWithOtp);
                        setOtpSent(false);
                        setValue("otp", "");
                      }}
                      className='text-[#0095D9] hover:underline text-xs sm:text-sm font-medium'
                    >
                      {loginWithOtp ? "Login with Password" : "Login with OTP"}
                    </button>
                  </div>
                </>
              )}
              <button
                type='submit'
                className='w-full rounded-lg bg-[#0095D9] py-2.5 sm:py-3 font-semibold text-white hover:bg-[#007bbd] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={loading}
              >
                {loading ? (
                  <span className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></span>
                ) : (
                  requiresEmailVerification ? "Verify & Login" : requiresTotp ? "Verifying..." : "Login"
                )}
              </button>

            </form>

            <div className='mt-4 text-center text-xs sm:text-sm text-gray-500'>
              Don't have an account?{" "}
              <Link to='/signup' className='text-[#0095D9] hover:underline'>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='relative w-full max-w-md rounded-lg bg-white p-4 sm:p-6'>
            <button
              type='button'
              onClick={() => {
                setShowForgotPassword(false);
                resetForgotForm();
              }}
              className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'
            >
              <IoClose size={24} />
            </button>

            <h2 className='mb-2 text-xl sm:text-2xl font-semibold text-gray-800'>
              Find Your Account
            </h2>
            <p className='mb-6 text-sm sm:text-base text-gray-600'>
              Please enter your email to reset your password.
            </p>

            {/* FormProvider wrapper here */}
            <FormProvider
              {...{
                register: registerForgot,
                handleSubmit: handleSubmitForgot,
                formState: { errors: forgotErrors },
              }}
            >
              <form
                onSubmit={handleSubmitForgot(handleForgotPassword)}
                className='space-y-6'
              >
                <div>
                  <input
                    type='email'
                    {...registerForgot("forgotEmail", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    placeholder='enter your email'
                    className={`w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${forgotErrors.forgotEmail ? "border-red-500" : ""
                      }`}
                  />
                  {forgotErrors.forgotEmail && (
                    <p className='mt-1 text-sm text-red-500'>
                      {forgotErrors.forgotEmail.message}
                    </p>
                  )}
                </div>

                <div className='flex justify-end'>
                  <button
                    type='submit'
                    disabled={resetLoading}
                    className={`rounded-lg bg-blue-500 px-4 sm:px-6 py-2 text-sm sm:text-base text-white ${resetLoading
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-blue-600"
                      }`}
                  >
                    {resetLoading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorLogin;