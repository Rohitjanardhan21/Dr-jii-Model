import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";

const TOTPLoginVerify = ({ loginToken, userId, onSuccess }) => {
  const navigate = useNavigate();
  const { getDoctorData } = useDoctorAuthStore();
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    console.log("inside");
    setLoading(true);
    try {
      const payload = {
        loginToken,
        ...(useBackupCode
          ? { backupCode: data.code }
          : { token: data.totpToken }),
      };
      console.log("Inside");
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
        console.log(response.data);
        // Save token
        if (response.data.data.token) {
          localStorage.setItem("token", response.data.data.token);
        }

        // Fetch complete doctor data
        const doctorData = await getDoctorData();
        if (doctorData) {
          toast.success("Login successful!");
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/dashboard");
          }
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
  };

  return (
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0095D9] py-2.5 sm:py-3 font-semibold text-white hover:bg-[#007bbd] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TOTPLoginVerify;

