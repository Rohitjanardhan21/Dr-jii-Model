import React, { useState } from "react";
import {
  useForm,
  FormProvider,
  useFormContext
} from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";



const InputField = ({ label, name, type, showToggle, show, setShow, rules, placeholder }) => {
  const {
    register,
    formState: { errors }
  } = useFormContext();



  return (
    <div>
      <label className="block font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          {...register(name, rules)}
          className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {show ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  

  const {id} = useParams();

  console.log(window.location.pathname);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const methods = useForm();
  const { handleSubmit, watch } = methods;
  const password = watch("password");

  const onSubmit = async (data) => {
    

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/resetPassword/${id}`, {
        
        otp: data.otp,
        password: data.password
      });
      console.log(response.data);
      if (response.data.success) {
        toast.success("Password reset successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Password Reset Failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Your Password</h2>
        <p className="text-gray-600 mb-6">Please enter your OTP and new password.</p>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <InputField
              label="OTP"
              name="otp"
              type="text"
              rules={{
                required: "OTP is required",
              }}
              placeholder="Enter OTP"
            />

            <InputField
              label="New Password"
              name="password"
              type="password"
              showToggle
              show={showPassword}
              setShow={setShowPassword}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              }}
              placeholder="Enter new password"
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              showToggle
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match"
              }}
              placeholder="Confirm new password"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ResetPassword;