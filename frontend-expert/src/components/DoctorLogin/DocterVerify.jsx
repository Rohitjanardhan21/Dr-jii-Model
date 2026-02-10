// DoctorVerify.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";

const DoctorVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('signupEmail') || location.state?.email || "";
  const phone = localStorage.getItem('signupMobile') || location.state?.phone || "";

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      emailOTP: ["", "", "", "", "", ""],
      phoneOTP: ["", "", "", "", "", ""],
    },
  });

  const emailOTPArr = watch("emailOTP");
  const phoneOTPArr = watch("phoneOTP");

  const [emailTimer, setEmailTimer] = useState(30);
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailTimer > 0) {
      const interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailTimer]);

  useEffect(() => {
    if (phoneTimer > 0) {
      const interval = setInterval(() => setPhoneTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phoneTimer]);

  const resendEmailOTP = async () => {
    if (email) {
      setEmailTimer(30);
      try {
        await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-otp`, { email });
        toast.success("Email OTP resent successfully!");
      } catch (error) {
        console.error("Error resending email OTP:", error);
        toast.error("Failed to resend email OTP. Please try again.");
      }
    } else {
      toast.error("Email address not available.");
    }
  };

  const resendPhoneOTP = async () => {
    if (phone) {
      setPhoneTimer(30);
      try {
        await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-otp`, { mobileNumber: phone });
        toast.success("Phone OTP resent successfully!");
      } catch (error) {
        console.error("Error resending phone OTP:", error);
        toast.error("Failed to resend phone OTP. Please try again.");
      }
    } else {
      toast.error("Mobile number not available.");
    }
  };

  const onSubmit = async () => {
    const enteredEmailOTP = emailOTPArr.join("");
    const enteredPhoneOTP = phoneOTPArr.join("");

    if (enteredEmailOTP.length === 6 && enteredPhoneOTP.length === 6 && email && phone) {
      setLoading(true);
      try {
        const payload = {
          emailOtp: enteredEmailOTP,
          mobileOtp: enteredPhoneOTP,
          email,
          mobileNumber: phone,
        };
        await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/verify-both-otp`, payload);
        toast.success("Verification Successfully!");
        navigate('/new-account'); 
      } catch (error) {
        console.error("Verification Failed:", error);
        toast.error(error.response?.data?.message || "Please enter valid OTPs.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please enter valid 6-digit OTPs for both email and mobile.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-gray-100 p-7">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md lg:max-w-lg xl:max-w-3xl">
        <h2 className="text-2xl font-semibold text-center mb-4">Two Step Verification</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4">
            <p className="font-medium">Verify Email Address</p>
            <p className="text-sm text-gray-600">To verify your email, We have sent you a code on your email address {email}</p>
            <div className="flex  gap-2 mt-3">
              {emailOTPArr.map((_, index) => (
                <Controller
                  key={index}
                  name={`emailOTP.${index}`}
                  control={control}
                  render={({ field }) => (
                    <input
                    {...field}
                    id={`email-otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={field.value || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^\d*$/.test(val)) return; // Allow only numbers
                      const updatedOTP = [...emailOTPArr];
                      updatedOTP[index] = val;
                      setValue("emailOTP", updatedOTP);
                      if (val && index < 5) {
                        document.getElementById(`email-otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !emailOTPArr[index] && index > 0) {
                        document.getElementById(`email-otp-${index - 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const paste = e.clipboardData.getData("text").slice(0, 6).split('');
                      if (paste.length) {
                        const updatedOTP = [...emailOTPArr];
                        for (let i = 0; i < 6; i++) {
                          updatedOTP[i] = paste[i] || "";
                        }
                        setValue("emailOTP", updatedOTP);
                      }
                    }}
                    onCopy={(e) => {
                      e.preventDefault();
                      const fullOTP = emailOTPArr.join('');
                      e.clipboardData.setData('text/plain', fullOTP);
                      toast.success("Email OTP copied!");
                    }}
                    className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  

                  )}
                />
              ))}
            </div>
            <p className="text-sm mt-2 text-gray-600">
  {phoneTimer > 0 ? (
    <>
      <span className="text-blue-500">Don't receive OTP?</span> Resend OTP in {emailTimer}s
    </>
  ) : (
    <button onClick={resendEmailOTP} className="text-blue-500 hover:underline">
      Resend OTP
    </button>
  )}
</p>
          </div>

          <div className="mt-6">
            <p className="font-medium">Verify Mobile Number</p>
            <p className="text-sm text-gray-600">To Verify your mobile number {phone}, We have sent you a sms on your phone</p>
            <div className="flex  gap-2 mt-3">
              {phoneOTPArr.map((_, index) => (
                <Controller
                  key={index}
                  name={`phoneOTP.${index}`}
                  control={control}
                  render={({ field }) => (
                    <input
                    {...field}
                    id={`phone-otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={field.value || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^\d*$/.test(val)) return; // Allow only numbers
                      const updatedOTP = [...phoneOTPArr];
                      updatedOTP[index] = val;
                      setValue("phoneOTP", updatedOTP);
                      if (val && index < 5) {
                        document.getElementById(`phone-otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !phoneOTPArr[index] && index > 0) {
                        document.getElementById(`phone-otp-${index - 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const paste = e.clipboardData.getData("text").slice(0, 6).split('');
                      if (paste.length) {
                        const updatedOTP = [...phoneOTPArr];
                        for (let i = 0; i < 6; i++) {
                          updatedOTP[i] = paste[i] || "";
                        }
                        setValue("phoneOTP", updatedOTP);
                      }
                    }}
                    onCopy={(e) => {
                      e.preventDefault();
                      const fullOTP = phoneOTPArr.join('');
                      e.clipboardData.setData('text/plain', fullOTP);
                      toast.success("Phone OTP copied!");
                    }}
                    className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  
                  )}
                />
              ))}
            </div>
            <p className="text-sm mt-2 text-gray-600">
  {phoneTimer > 0 ? (
    <>
      <span className="text-blue-500">Don't receive OTP?</span> Resend OTP in {phoneTimer}s
    </>
  ) : (
    <button onClick={resendPhoneOTP} className="text-blue-500 hover:underline">
      Resend OTP
    </button>
  )}
</p>

          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'VERIFY'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorVerify;