import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";

const TOTPSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || localStorage.getItem("totpSetupUserId");
  const [qrCode, setQRCode] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [step, setStep] = useState("setup"); // 'setup' or 'verify'
  const { getDoctorData } = useDoctorAuthStore();


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (!userId) {
      toast.error("User ID not found. Please complete registration first.");
      navigate("/register");
      return;
    }
    // Auto-generate TOTP setup on mount
    handleSetupTOTP();
  }, [userId]);

  const handleSetupTOTP = async () => {
    setSetupLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/auth/totp/setup`,
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.statusCode === 200) {
        setQRCode(response.data.data.qrCode);
        setManualEntryKey(response.data.data.manualEntryKey);
        setStep("verify");
        toast.success("TOTP setup data generated. Please scan the QR code.");
      } else {
        toast.error(response.data.message || "Failed to setup TOTP");
      }
    } catch (error) {
      console.error("TOTP setup error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to setup TOTP. Please try again."
      );
    } finally {
      setSetupLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/auth/totp/verify`,
        {
          userId,
          token: data.totpToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
        
      );

      if (response.data.statusCode === 200) {
        // Show backup codes
        if (response.data.data.backupCodes) {
          setBackupCodes(response.data.data.backupCodes);
          toast.success(
            "TOTP verified successfully! Please save your backup codes.",
            { duration: 5000 }
          );
        } else {
          toast.success("TOTP verified successfully!");
          // Navigate to login or dashboard
          await getDoctorData();

          
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } else {
        toast.error(response.data.message || "Invalid TOTP code");
      }
    } catch (error) {
      console.error("TOTP verification error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to verify TOTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodesSaved = async () => {
    localStorage.removeItem("totpSetupUserId");
    await getDoctorData();
    navigate("/dashboard");
  };

  if (backupCodes.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Save Your Backup Codes
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Important:</strong> These backup codes can be used to
              access your account if you lose access to your authenticator app.
            </p>
            <p className="text-sm text-yellow-800">
              Each code can only be used once. Save them in a safe place. You
              will not be able to see them again.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="font-mono text-lg text-center p-2 bg-white rounded border"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleBackupCodesSaved}
            className="w-full rounded-lg bg-[#0095D9] py-3 font-semibold text-white hover:bg-[#007bbd] text-base"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Set Up Two-Factor Authentication
        </h2>
        <p className="text-gray-600 mb-6">
          Scan the QR code with your authenticator app (Google Authenticator,
          Authy, Microsoft Authenticator, etc.) to complete registration.
        </p>

        {step === "setup" && (
          <div className="text-center">
            {setupLoading ? (
              <div className="py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0095D9] border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Generating TOTP setup...</p>
              </div>
            ) : (
              <button
                onClick={handleSetupTOTP}
                className="rounded-lg bg-[#0095D9] px-6 py-3 font-semibold text-white hover:bg-[#007bbd]"
              >
                Generate QR Code
              </button>
            )}
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center">
              {qrCode && (
                <div className="mb-6 p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img
                    src={qrCode}
                    alt="TOTP QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              )}
              {manualEntryKey && (
                <div className="mb-6 w-full">
                  <p className="text-sm text-gray-600 mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <code className="text-lg font-mono text-gray-800">
                      {manualEntryKey}
                    </code>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 text-sm sm:text-base mb-2">
                Enter 6-digit code from your authenticator app
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
                className="w-full rounded-lg border p-3 text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
                placeholder="000000"
                maxLength={6}
              />
              {errors.totpToken && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.totpToken.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep("setup");
                  setQRCode("");
                  setManualEntryKey("");
                  setValue("totpToken", "");
                }}
                className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[#0095D9] py-3 font-semibold text-white hover:bg-[#007bbd] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Complete Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TOTPSetup;

