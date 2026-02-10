// DoctorSignUp.jsx
import React, { useState } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const countryCodes = [
  { code: "+1",
    country: "US" },
  { code: "+91",
    country: "IN" },
  { code: "+44",
    country: "UK" },
  { code: "+61",
    country: "AU" },
  { code: "+81", country: "JP" },
];

const DoctorSignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [receiveOffers,setReceiveOffers] = useState("");
  const [agreeToTerms,setAgreeToTerms] = useState("");

 const handleSignUp = async (e) => {
  e.preventDefault();
  setLoading(true);

  const payload = { email, mobileNumber: `${mobile}`, fullName: name };

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-otp`,
      payload
    );

    const resData = response?.data || {};
    const resMsg = (resData?.message || "").toString();
    const resStatusCode =
      resData?.statusCode || resData?.code || response?.status;

    // 🚫 Stop immediately if backend message looks like an error
    if (
      resStatusCode >= 400 ||
      /exist|already|expired|required|invalid|fail/i.test(resMsg)
    ) {
      toast.error(resMsg || "Something went wrong. Please try again.");
      return; // ✅ stop here
    }

    const { emailOtp, mobileOtp } = resData.data || {};

    if (!emailOtp || !mobileOtp) {
      toast.error("Failed to send OTP. Please try again.");
      return; // ✅ stop here
    }

    // ✅ Only success path below
    toast.success("OTP sent successfully to your email and mobile!");

    localStorage.setItem("signupEmail", payload.email);
    localStorage.setItem("signupMobile", payload.mobileNumber);
    localStorage.setItem("signupName", payload.fullName);
    localStorage.setItem("emailOtp", emailOtp);
    localStorage.setItem("mobileOtp", mobileOtp);

    // ✅ Move navigate here — only runs when OTPs are valid
    navigate("/twoVerify");
  } catch (error) {
    console.error("Sign Up Failed:", error);
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Sign Up failed. Please try again.";

    toast.error(errMsg);
    // 🚫 DO NOT navigate here
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xl rounded-lg border p-4 sm:p-6 md:p-10 lg:p-14 text-gray-500 shadow-sm bg-white">

        <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block font-medium text-gray-700 text-sm sm:text-base">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 text-sm sm:text-base">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 text-sm sm:text-base mb-2">Mobile Number</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="sm:mr-2 rounded-lg border p-2.5 sm:p-2 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9] w-full sm:w-auto sm:min-w-[140px]"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.country})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-lg border p-2.5 sm:p-3 text-sm sm:text-base focus:border-[#0095D9] focus:ring-[#0095D9]"
                required
              />
            </div>
          </div>



          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="offers"
              checked={receiveOffers}
              onChange={() => setReceiveOffers(!receiveOffers)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0095D9] focus:ring-[#0095D9] flex-shrink-0"
            />
            <p className="text-gray-700 text-xs sm:text-sm">
              Receive relevant offers and promotional communication from Avijo
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={() => setAgreeToTerms(!agreeToTerms)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0095D9] focus:ring-[#0095D9] flex-shrink-0"
              required
            />
            <p className="text-gray-700 text-xs sm:text-sm">
              By signing up, I agree to the{' '}
              <a href="/terms" className="text-[#0095D9] hover:underline">
                Terms & Conditions
              </a>
            </p>
          </div>

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#0095D9] py-2.5 sm:py-3 font-semibold text-white hover:bg-[#007bbd] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-[#0095D9] font-semibold hover:underline">
            Login
          </Link>
        </p> */}
      </div>
    </section>
  );
};

export default DoctorSignUp;