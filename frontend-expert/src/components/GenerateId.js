import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
import axios from "axios";
// import { abdUrl, process.env.REACT_APP_SERVER_BASE_URL, encryptAadhaar, encryptData, generateSessionToken, getPublicKey, importPublicKey } from "../Routes/process.env.REACT_APP_SERVER_BASE_URL";
import { BiFingerprint, BiShield, BiSolidFileDoc } from "react-icons/bi";
import { FaRegNewspaper } from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";
import OTPInput from "react-otp-input";

const GenerateId = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    aadhaarId: "",
    password: "",
    mobile: "",
    countryCode: "+91(IND)",
  });

  const [loading, setLoading] = useState(false); // State variable to track loading state
  const [txnId, setTxnId] = useState("a1b2");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value); // Update state with input value
  };

  // const handleCountryCodeChange = (code) => {
  //     setFormData({
  //         ...formData,
  //         countryCode: code,
  //     });
  // };

  // scope:[
  //   "abha-enrol"

  //   ],
  //   loginHint: "{{encrypted aadhaar}}",
  //   otpSystem: "aadhaar"

  // Function to send Aadhaar OTP
  // const sendAadhaarOtp = async () => {
  //     const authToken = await generateSessionToken();
  //     if (!authToken) return;

  //     const publicKeyPem = await getPublicKey();
  //     const publicKey = await importPublicKey(publicKeyPem);

  //     const encryptedAadhaar = await encryptAadhaar(formData.aadhaarId, publicKey);

  //     try {
  //         const response = await axios.post(
  //             "https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/request/otp",
  //             {
  //                 txnId: txnId,
  //                 scope: ["abha-enrol"],
  //                 loginHint: "aadhaar",
  //                 loginId: encryptedAadhaar,
  //                 otpSystem: "aadhaar",
  //             },
  //             {
  //                 headers: {
  //                     Authorization: `Bearer ${authToken}`,
  //                     "Content-Type": "application/json",
  //                 },
  //             }
  //         );

  //         console.log("OTP sent successfully:", response.data);
  //         Swal.fire("Success", "OTP Sent Successfully!", "success");
  //         return response.data.txnId;
  //     } catch (error) {
  //         console.error("Error sending Aadhaar OTP:", error);
  //         alert('not sent');
  //         return null;
  //     }
  // };

  // Handle Aadhaar form submission
  // const handleSubmit = async (event) => {
  //     // event.preventDefault();
  //     // alert('not sent');
  //     if (formData.aadhaarId.length !== 12) {
  //         setError("Please enter a valid 12-digit Aadhaar number.");
  //     } else {
  //         setError("");
  //         const publicKey = await getPublicKey(); // Step 1: Get public key
  //         if (!publicKey) {
  //             setError("Failed to fetch public key.");
  //             return;
  //         }

  //         const encryptedAadhaar = encryptData(formData.aadhaarId, publicKey); // Step 2: Encrypt Aadhaar number
  //         if (!encryptedAadhaar) {
  //             setError("Failed to encrypt Aadhaar number.");
  //             return;
  //         }

  //         const newTxnId = await sendAadhaarOtp(); // Step 3: Send OTP
  //         if (newTxnId) {
  //             setTxnId(newTxnId); // Save txnId for OTP verification
  //             setOtpSent(true); // Update UI to show OTP sent status
  //             // navigate("/otp-verify", { state: { txnId: newTxnId } }); // Navigate to OTP verification page
  //         } else {
  //             setError("Failed to send OTP.");
  //         }
  //     }
  // };

  //   const handleVerify = async () => {
  //     const authToken = await generateSessionToken(); // Step 1: Generate session token
  //     if (!authToken) {
  //       return; // Handle error case
  //     }

  //     try {
  //       const response = await axios.post(
  //         "https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/verify/otp",
  //         {
  //           txnId: txnId,       // Transaction ID received from the OTP request
  //           otp: otp           // OTP entered by the user
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${authToken}`, // Add session token here
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       console.log("OTP verified successfully:", response.data);
  //       Swal.fire("Success", "OTP Verified Successfully!", "success");
  //     //   navigate("/doctor/profile");
  //       return response.data; // Return the response data for further handling if needed
  //     } catch (error) {
  //       console.error("Error verifying OTP:", error);
  //       Swal.fire("Error", "Failed to Verify OTP. Please try again.", "error");
  //       return null;
  //     }
  //   };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true); // Set loading to true when form is submitted
  //   const { fullName, email, password, mobile, countryCode, aadhaarId } = formData;

  //   if (aadhaarId === "") {
  //     Swal.fire("aadhaar id field is mendatory");
  //     return;
  //   }

  //   const payload = {
  //     txnId: aadhaarId,
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${abdUrl}/request/otp`,
  //       payload
  //     );
  //     if (response.status === 200) {
  //       Swal.fire("Success", "OTP Sent Successfully!", "success");
  //       navigate("/doctor/otp-verify", {
  //         state: {
  //           emailId: email,
  //           mobileNumber: `${mobile}`,
  //           fullName: fullName,
  //           password: password,
  //         },
  //       });
  //     } else {
  //       Swal.fire(
  //         "Error",
  //         response.data.message || "Something went wrong!",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     Swal.fire(
  //       "Error",
  //       error.response?.data?.message ||
  //       "Network error. Please try again later.",
  //       "error"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className='rounded'>
      <div>
        <h3 className='text-[grey]'>Create your Healthcare Professional ID</h3>
        <h6 className='text-[grey]'>
          The Healthcare Professional ID will connect you to the India’s Digital
          Health ecosystem
        </h6>
        <div className='mt-12' />
        <span className='pl-2 text-sm font-semibold text-[grey]'>
          Generate Healthcare Professional ID via
        </span>
        <div className='mt-2 flex w-full flex-row items-center justify-between pb-12'>
          <div
            className='flex h-[50px] w-[48%] flex-row items-center justify-center rounded-md'
            style={{ borderWidth: 1, borderColor: "#0095D9" }}
          >
            <BiFingerprint className='h-6 w-6 text-[#0095D9]' />
            <span className='pl-2 text-lg text-[grey]'>Aadhar</span>
          </div>
          <div
            className='flex h-[50px] w-[48%] flex-row items-center justify-center rounded-md'
            style={{ borderWidth: 1, borderColor: "grey" }}
          >
            <FaRegNewspaper className='h-6 w-6 text-[grey]' />
            <span className='pl-2 text-lg text-[grey]'>Driving License</span>
          </div>
        </div>
        <span className='pl-2 pt-8 text-sm font-semibold text-[grey]'>
          Generate Healthcare Professional ID via
        </span>
        <form>
          <div>
            <div className='d-flex flex-column w-full'>
              <input
                type='password'
                name='aadhaarId'
                className='mt-2 h-[50px] w-[70%] rounded-md border border-[grey] pl-2 outline-none focus:border focus:border-[#0095D9]'
                placeholder='Aaadhar Id'
                value={formData.aadhaarId}
                onChange={handleInputChange}
                required
              />
            </div>
            {otpSent && (
              <div>
                <div className='mt-8' />
                <span className='pt-8 text-xs text-[grey]'>
                  We have sent an OTP to the Aadhar linked mobile number
                  ********1122
                </span>
                <div className='mt-2' />
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderSeparator={<span className='m-2'></span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className='box-border h-[40px] rounded-sm border bg-white text-center'
                      style={{ width: 60 }}
                    />
                  )}
                />
                <div className='d-flex w-full flex-row items-center pt-2'>
                  <span className='text-xs text-[#0095D9]'>
                    Didn’t receive OTP?{" "}
                  </span>
                  <span className='text-xs font-semibold text-[grey]'>
                    &nbsp; Resend OTP in 90 seconds
                  </span>
                </div>
              </div>
            )}
            {!otpSent && (
              <div className='mt-8 flex w-[20%] flex-row items-center justify-between pb-4'>
                <button className='flex h-[50px] w-[48%] flex-row items-center justify-center rounded-sm bg-[#0095D9]'>
                  <span className='text-sm text-[white]'>ENG</span>
                </button>
                <button
                  className='flex h-[50px] w-[48%] flex-row items-center justify-center rounded-sm bg-white'
                  style={{ borderWidth: 1, borderColor: "#0095D9" }}
                >
                  <span className='text-sm text-[#0095D9]'>Hindi</span>
                </button>
              </div>
            )}
            {!otpSent && (
              <div className='pt-2'>
                <span className='text-sm text-[grey]'>
                  I, hereby declare that I am voluntarily sharing my Aadhaar
                  Number / Virtual ID and demographic information issued by
                  UIDAI, with National Health Authority (NHA) for the sole
                  purpose of creation of Healthcare Professional ID. I
                  understand that my Healthcare Professional ID can be used and
                  shared for purposes as may be notified by Ayushman Bharat
                  Digital Mission (ABDM) from time to time
                </span>
                <div className='d-flex align-items-center mt-6'>
                  <input type='checkbox' />
                  <label className='pl-2 text-sm font-[500] text-[#0097DB]'>
                    I currently work here
                  </label>
                </div>
                <div className='d-flex align-items-center mt-8'>
                  <span className='text-xl font-bold italic'>2 - 1 = ?</span>
                  <input
                    type='text'
                    className='ml-12 h-[50px] w-20 rounded-sm border border-[grey] text-center text-xl font-bold'
                  />
                  <FaRepeat className='ml-4 h-6 w-6' />
                </div>
              </div>
            )}
          </div>
          {/* <button type="submit" className="text-white">
                        {loading ? (
                            <span
                                className="spinner-border spinner-border-sm text-white"
                                role="status"
                                aria-hidden="true"
                            ></span>
                        ) : (
                            "Register"
                        )}
                    </button> */}
        </form>
        <span className='text-sm text-[red]'>{error}</span>
        <div className='mt-8 flex w-full flex-row items-center justify-between pb-4'>
          <button className='flex h-[50px] w-[48%] flex-row items-center justify-center rounded-md bg-[#B8B8B8]'>
            <span className='pl-2 text-lg text-[white]'>Reset</span>
          </button>
          <button
            onClick={() => {
              // if(otpSent){
              //     handleVerify();
              // }else{
              //     handleSubmit();
              // }
            }}
            className='flex h-[50px] w-[48%] flex-row items-center justify-center rounded-md bg-[#0095D9]'
          >
            <span className='pl-2 text-lg text-[white]'>Submit</span>
          </button>
        </div>
        <div className='d-flex w-full flex-row items-center justify-center pb-6'>
          <span className='text-sm text-[grey]'>Already have an account? </span>
          <span className='text-sm font-semibold text-[#0095D9]'>
            &nbsp;Login Here
          </span>
        </div>
      </div>
    </div>
  );
};

export default GenerateId;
