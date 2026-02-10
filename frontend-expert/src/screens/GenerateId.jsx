import React, { useCallback, useEffect, useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
import axios from "axios";
// import { encryptAadhaar, encryptData, generateAadhaarOtp, generateSessionToken, getAccessToken, getPublicKey, importPublicKey } from "./Routes/process.env.REACT_APP_SERVER_BASE_URL";
import { BiFingerprint, BiShield, BiSolidFileDoc } from "react-icons/bi";
import { PiCertificate } from "react-icons/pi";
import { FaRegNewspaper } from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";
import OTPInput from "react-otp-input";
import forge from "node-forge";

const GenerateId = () => {
  const publicKeyPem = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAstWB95C5pHLXiYW59qyO
4Xb+59KYVm9Hywbo77qETZVAyc6VIsxU+UWhd/k/YtjZibCznB+HaXWX9TVTFs9N
wgv7LRGq5uLczpZQDrU7dnGkl/urRA8p0Jv/f8T0MZdFWQgks91uFffeBmJOb58u
68ZRxSYGMPe4hb9XXKDVsgoSJaRNYviH7RgAI2QhTCwLEiMqIaUX3p1SAc178ZlN
8qHXSSGXvhDR1GKM+y2DIyJqlzfik7lD14mDY/I4lcbftib8cv7llkybtjX1Aayf
Zp4XpmIXKWv8nRM488/jOAF81Bi13paKgpjQUUuwq9tb5Qd/DChytYgBTBTJFe7i
rDFCmTIcqPr8+IMB7tXA3YXPp3z605Z6cGoYxezUm2Nz2o6oUmarDUntDhq/PnkN
ergmSeSvS8gD9DHBuJkJWZweG3xOPXiKQAUBr92mdFhJGm6fitO5jsBxgpmulxpG
0oKDy9lAOLWSqK92JMcbMNHn4wRikdI9HSiXrrI7fLhJYTbyU3I4v5ESdEsayHXu
iwO/1C8y56egzKSw44GAtEpbAkTNEEfK5H5R0QnVBIXOvfeF4tzGvmkfOO6nNXU3
o/WAdOyV3xSQ9dqLY5MEL4sJCGY1iJBIAQ452s8v0ynJG5Yq+8hNhsCVnklCzAls
IzQpnSVDUVEzv17grVAw078CAwEAAQ==
-----END PUBLIC KEY-----
`;

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
  const [accessToken, setAccessToken] = useState("");
  const [otpTxnId, setOtpTxnId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [toggleLang, setToggleLang] = useState("ENG");
  const [resetTime, setResetTime] = useState(0);
  const [isDisable, setIsDisable] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOtpChange = (e) => {
    setOtp(e);
  };

  const handleCountryCodeChange = (code) => {
    setFormData({
      ...formData,
      countryCode: code,
    });
  };

  const handleResendOtp = (e) => {
    e.preventDefault();
    if (isDisable) return;
    setIsDisable(true);
    setResetTime(10);
    generateAadhaarOtp(e);
  };

  // const getAccessToken = async () => {

  //     try {
  //         const response = await axios.post(
  //             "https://dev.abdm.gov.in/gateway/v0.5/sessions",
  //             {
  //                 clientId: "SBXID_008175",
  //                 clientSecret: "1fa1cd7f-a2bb-468b-b6c2-cc16d725cbdf",
  //                 grantType: "client_credentials",
  //             },
  //             {
  //                 headers: {
  //                     "Content-Type": "application/json",
  //                     "REQUEST-ID": uuidv4(),
  //                     TIMESTAMP: new Date().toISOString(),
  //                     "X-CM-ID": "sbx",
  //                 },
  //             }
  //         );
  //         if (!response || !response.data || !response.data.accessToken) {
  //             throw new Error("Invalid token response");
  //         }
  //         return response.data.accessToken;
  //     } catch (error) {
  //         console.error("Error generating session token:", error.message);

  //         if (error.response) {
  //             console.error("Response data:", error.response.data);
  //             console.error("Response status:", error.response.status);
  //             console.error("Response headers:", error.response.headers);
  //         } else if (error.request) {
  //             console.error("Request made but no response received:", error.request);
  //         } else {
  //             console.error("Error in setting up the request:", error.message);
  //         }
  //         throw new Error("Failed to generate session token");
  //     }
  // };

  // Function to generate Aadhaar OTP
  const generateAadhaarOtp = async (e) => {
    e.preventDefault();
    if (isDisable === true) return;

    setIsDisable(true);

    // setLoading(true);
    // const accessToken = await getAccessToken();

    // if (!accessToken) {
    //     alert('Access token is required. Please generate it first.');
    //     return;
    // }

    const url =
      "https://hpridsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp";
    const payload = {
      aadhaar: formData.aadhaarId,
    };
    console.log("This is aadhar id = ", formData.aadhaarId);
    console.log("This is the selected language = ", toggleLang);
    alert(
      "need to work for backend call first. as the code is commented for frontend developement"
    );
    setOtpSent(true); // set this when the otp is successfully sent

    // try {
    //     const response = await axios.post(url, payload, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${accessToken}`,
    //         },
    //     });
    //     // setTransactionId(response.data.txnId);
    //     console.log('response data:', response.data);
    //     alert('Aadhaar OTP generated successfully!');
    // } catch (error) {
    //     console.error('Error generating Aadhaar OTP:', error);
    //     alert('Failed to generate Aadhaar OTP.');
    // } finally {
    //     setLoading(false);
    // }
  };

  // const encryptData1 = (data) => {
  //     try {
  //         // Convert PEM-formatted public key to forge public key
  //         const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  //         // Encrypt the data using the public key
  //         const encrypted = publicKey.encrypt(data, 'RSA-OAEP');

  //         // Encode the encrypted data in Base64
  //         const encryptedBase64 = forge.util.encode64(encrypted);

  //         console.log('Encrypted Data (Base64):', encryptedBase64);
  //         return encryptedBase64;
  //     } catch (error) {
  //         console.error('Encryption Error:', error);
  //     }
  // };

  // const postData = async () => {

  //     setLoading(true);
  //     // const url = "https://hpridsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp";
  //     const url = `https://avijobackend-production.up.railway.app/doctor/doctorCreate`;
  //     const data1 = {
  //         aadhaarNumber: formData.aadhaarId,
  //     }

  //     try {
  //         const response = await fetch(url, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //                 // Authorization: `Bearer ${authToken}`,
  //             },
  //             body: JSON.stringify(data1),
  //         });

  //         if (!response.ok) {
  //             alert('error aadhaarId');
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //         }

  //         const data = await response.json();
  //         alert('success...');
  //         console.log('Response Data:', data);

  //     } catch (error) {
  //         console.error('Error:', error);
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  // const handleGetAccessToken = async () => {
  //     try {
  //         setLoading(true);
  //         const clientId = "SBXID_008175";
  //         const clientSecret = "1fa1cd7f-a2bb-468b-b6c2-cc16d725cbdf";
  //         const accessToken = await getAccessToken(clientId, clientSecret);
  //         console.log("Access Token:", accessToken);
  //         setErrorMessage('');

  //         // Generate OTP with the access token
  //         console.log('aadhaarId:', formData.aadhaarId);
  //         const txnId = await generateAadhaarOtp(accessToken, formData.aadhaarId);
  //         console.log('txnId:', txnId);
  //         setOtpTxnId(txnId);
  //     } catch (error) {
  //         setErrorMessage('Error generating the access token or OTP.');
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  // const requestToken = async () => {
  //     try {

  //         if (!formData.aadhaarId) {
  //             return;
  //         }

  //         const data = {
  //             aadhaar: formData.aadhaarId
  //         }
  //         const response = await fetch(`https://hpridsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp`, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(data),
  //         });
  //         if (!response.ok) {
  //             throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //     } catch (e) {
  //         console.log('error registering with aadhaar', e);
  //     }
  // }

  // const requestBody = {
  //     clientId: 'SBXID_008175',
  //     clientSecret: '1fa1cd7f-a2bb-468b-b6c2-cc16d725cbdf',
  //     grantType: 'client_credentials',
  // };

  // const requestToken = async () => {

  //     const url = 'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions';
  //     const requestBody = {
  //         clientId: 'SBXID_008175',
  //         clientSecret: '1fa1cd7f-a2bb-468b-b6c2-cc16d725cbdf',
  //         grantType: 'client_credentials',
  //     };

  //     try {
  //         const response = await fetch(url, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(requestBody),
  //         });

  //         if (!response.ok) {
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //         }

  //         const data = await response.json();
  //         console.log('Token Response:', data.accessToken);
  //         await postData(formData.aadhaarId, data.accessToken);
  //         return data.accessToken; // Make sure to return the token
  //     } catch (error) {
  //         console.error('Error fetching token:', error);
  //         alert(`Error: ${error.message}`); // Display error message to user
  //     }
  // };

  // useEffect(() => {
  //     const encrypt = encryptData1(372131203311);
  //     console.log('encrypt:', encrypt);
  // }, [])

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
  //         // Swal.fire("Success", "OTP Sent Successfully!", "success");
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

  const handleVerify = async (e) => {
    e.preventDefault();
    console.log("This is the otp = ", otp);
    // setOtp("");

    // setOtpSent(false); // Remove this if makeing a backend call.
    alert("Code is commented need to work for backend call first.");

    // const authToken = await generateSessionToken(); // Step 1: Generate session token
    // if (!authToken) {
    //     return; // Handle error case
    // }

    // try {
    //     const response = await axios.post(
    //         "https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/verify/otp",
    //         {
    //             txnId: txnId,       // Transaction ID received from the OTP request
    //             otp: otp           // OTP entered by the user
    //         },
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${authToken}`, // Add session token here
    //                 "Content-Type": "application/json",
    //             },
    //         }
    //     );

    //     console.log("OTP verified successfully:", response.data);
    //     // Swal.fire("Success", "OTP Verified Successfully!", "success");
    //     //   navigate("/doctor/profile");
    //     return response.data; // Return the response data for further handling if needed
    // } catch (error) {
    //     console.error("Error verifying OTP:", error);
    //     // Swal.fire("Error", "Failed to Verify OTP. Please try again.", "error");
    //     return null;
    // }
  };

  useEffect(() => {
    let interval;
    if (resetTime > 0) {
      interval = setTimeout(() => {
        setResetTime(resetTime - 1);
      }, 1000);
    } else setIsDisable(false);
    return () => clearInterval(interval);
  }, [resetTime]);

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
    <section className='mt-4 sm:mt-[2rem] rounded border bg-white p-3 sm:p-4 md:p-6 shadow-sm'>
      <div>
        <h3 className='text-[grey] text-base sm:text-lg md:text-xl'>
          Create your Healthcare Professional ID Via
        </h3>
        <div className='mt-6 sm:mt-12' />
        <span className='pl-2 text-xs sm:text-sm font-semibold text-[grey]'>
          Generate Healthcare Professional ID via
        </span>
        <div className='mt-2 flex w-full flex-row items-center justify-between gap-2 sm:gap-0 pb-4 sm:pb-6'>
          <div
            className={`border-1 flex h-[45px] sm:h-[50px] w-[48%] cursor-pointer flex-row items-center justify-center rounded-md border-[#0095D9] text-[#0095D9]`}
          >
            <BiFingerprint className='h-5 w-5 sm:h-6 sm:w-6' />
            <span className='pl-2 text-sm sm:text-lg'>Aadhar</span>
          </div>
          {/* <div className={`flex flex-row items-center w-[48%] h-[50px] rounded-md justify-center cursor-pointer border-1 ${viaAadharDriving === true ? 'text-[#0095D9] border-[#0095D9]' : 'text-[gray] border-[gray]'}`} onClick={() => setViaAadharDriving(true)}>
                        <PiCertificate className="h-6 w-6 " />
                        <span className="text-lg pl-2">Driving License</span>
                    </div> */}
        </div>
        <span className='pl-2 pt-4 sm:pt-6 text-xs sm:text-sm font-semibold text-[grey]'>
          Generate Healthcare Professional ID via
        </span>
        <form
          id='submitData'
          onSubmit={(e) => {
            if (!otpSent) {
              setResetTime(10);
              generateAadhaarOtp(e);
              setIsDisable(true);
            } else handleVerify(e);
          }}
        >
          <div>
            <div className='d-flex flex-column w-full'>
              <input
                type='password'
                name='aadhaarId'
                className='mt-2 h-[45px] sm:h-[50px] w-full sm:w-[70%] rounded-md border border-[grey] pl-3 sm:pl-2 text-sm sm:text-base outline-none focus:border focus:border-[#0095D9]'
                placeholder='Enter 12-digit Aadhar Id'
                value={formData.aadhaarId}
                maxLength={12}
                minLength={12}
                onChange={handleInputChange}
                pattern='^[0-9]{12}$'
                title='Aadhaar ID must be exactly 12 digits long'
                required
              />
            </div>
            {otpSent === true && (
              <div>
                <div className='mt-6 sm:mt-8' />
                <span className='pt-4 sm:pt-8 text-xs text-[grey]'>
                  We have sent an OTP to the Aadhar linked mobile number
                  ********1122
                </span>
                <div className='mt-3 sm:mt-4 flex justify-center sm:justify-start'>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2">
                    <OTPInput
                      value={otp}
                      onChange={handleOtpChange}
                      numInputs={6}
                      renderSeparator={<span className='m-1 sm:m-2'></span>}
                      renderInput={(props) => (
                        <input
                          {...props}
                          className='box-border h-[40px] sm:h-[45px] rounded-sm border bg-white text-center text-sm sm:text-base'
                          style={{ width: 'clamp(35px, 8vw, 60px)' }}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className='d-flex w-full flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-0 pt-3 sm:pt-2'>
                  <button
                    className='text-xs text-[#0095D9] hover:underline'
                    onClick={handleResendOtp}
                    disabled={isDisable}
                  >
                    Didn't receive OTP?
                  </button>
                  <span className='text-xs font-semibold text-[grey]'>
                    {resetTime > 0
                      ? `Resend OTP in ${resetTime} seconds`
                      : "< Click here"}
                  </span>
                </div>
              </div>
            )}
            {!otpSent && (
              <div className='mt-6 sm:mt-8 flex w-full sm:w-[20%] flex-row items-center justify-between gap-2 sm:gap-0 pb-4'>
                <div
                  onClick={() => setToggleLang("ENG")}
                  className={`flex h-[45px] sm:h-[50px] w-[48%] cursor-pointer flex-row items-center justify-center rounded-sm ${toggleLang === "ENG" ? "bg-[#0095D9]" : "border-2 border-[#0095D9] bg-white"}`}
                >
                  <span
                    className={`text-xs sm:text-sm ${toggleLang === "ENG" ? "text-white" : "text-[#0095D9]"}`}
                  >
                    ENG
                  </span>
                </div>
                <div
                  onClick={() => setToggleLang("Hindi")}
                  className={`flex h-[45px] sm:h-[50px] w-[48%] cursor-pointer flex-row items-center justify-center rounded-sm ${toggleLang === "Hindi" ? "bg-[#0095D9]" : "border-2 border-[#0095D9] bg-white"}`}
                >
                  <span
                    className={`text-xs sm:text-sm ${toggleLang === "Hindi" ? "text-white" : "text-[#0095D9]"}`}
                  >
                    Hindi
                  </span>
                </div>
              </div>
            )}
            {!otpSent && (
              <div className='pt-2'>
                <span className='text-xs sm:text-sm text-[grey] leading-relaxed'>
                  I, hereby declare that I am voluntarily sharing my Aadhaar
                  Number / Virtual ID and demographic information issued by
                  UIDAI, with National Health Authority (NHA) for the sole
                  purpose of creation of Healthcare Professional ID. I
                  understand that my Healthcare Professional ID can be used and
                  shared for purposes as may be notified by Ayushman Bharat
                  Digital Mission (ABDM) from time to time
                </span>
                <div className='d-flex align-items-center mt-4 sm:mt-6'>
                  <label className='flex cursor-pointer items-center gap-1 pl-2 text-xs sm:text-sm font-[500] text-[#0097DB]'>
                    <input type='checkbox' className='h-4 w-4' />
                    <span>I currently work here</span>
                  </label>
                </div>
                <div className='d-flex flex-col sm:flex-row align-items-center mt-6 sm:mt-8 gap-3 sm:gap-0'>
                  <span className='text-lg sm:text-xl font-bold italic'>2 - 1 = ?</span>
                  <div className='flex items-center gap-2 sm:gap-0 sm:ml-12'>
                    <input
                      type='text'
                      className='h-[45px] sm:h-[50px] w-20 rounded-sm border border-[grey] text-center text-lg sm:text-xl font-bold'
                    />
                    <FaRepeat className='h-5 w-5 sm:h-6 sm:w-6 cursor-pointer' />
                  </div>
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
        <span className='text-xs sm:text-sm text-[red]'>{error}</span>
        <div className='mt-6 sm:mt-8 flex w-full flex-row items-center justify-between gap-2 sm:gap-0 pb-4'>
          <button
            className='flex h-[45px] sm:h-[50px] w-[48%] flex-row items-center justify-center rounded-md bg-[#B8B8B8] hover:bg-[#A0A0A0] transition-colors'
            onClick={() => {
              setOtp("");
              setToggleLang("ENG");
              setOtpSent(false);
              setError("");
              setFormData({
                fullName: "",
                email: "",
                aadhaarId: "",
                password: "",
                mobile: "",
                countryCode: "+91(IND)",
              });
              setResetTime(0);
              setIsDisable(true);
            }}
          >
            <span className='pl-2 text-sm sm:text-lg text-[white]'>Reset</span>
          </button>
          {loading ? (
            <div className='flex w-[48%] flex-col items-center justify-center'>
              <div className='spinner'></div>
            </div>
          ) : (
            <button
              form='submitData'
              className='flex h-[45px] sm:h-[50px] w-[48%] flex-row items-center justify-center rounded-md bg-[#0095D9] hover:bg-[#007bbd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              <span className='pl-2 text-sm sm:text-lg text-[white]'>Submit</span>
            </button>
          )}
        </div>
        <div className='d-flex w-full flex-row items-center justify-center pb-4 sm:pb-6'>
          <span className='text-xs sm:text-sm text-[grey]'>Already have an account? </span>
          <span className='text-xs sm:text-sm font-semibold text-[#0095D9] cursor-pointer hover:underline'>
            &nbsp;Login Here
          </span>
        </div>
      </div>
    </section>
  );
};

export default GenerateId;

// src/App.js
// import React, { useState } from 'react';
// import { getAccessToken, generateAadhaarOtp } from './apiService';

// function GenerateId() {
//     const [clientId, setClientId] = useState('');
//   const [clientSecret, setClientSecret] = useState('');
//   const [aadhaarNumber, setAadhaarNumber] = useState('');
//   const [otpTxnId, setOtpTxnId] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   // Function to handle generating the access token
//   const handleGetAccessToken = async () => {
//     try {
//       const accessToken = await getAccessToken(clientId, clientSecret);
//       console.log("Access Token:", accessToken);
//       setErrorMessage('');

//       // Generate OTP with the access token
//       const txnId = await generateAadhaarOtp(accessToken, aadhaarNumber);
//       setOtpTxnId(txnId);
//     } catch (error) {
//       setErrorMessage('Error generating the access token or OTP.');
//     }
//   };

//   return (
//     <div className="App">
//       <h1>NHPR API Integration</h1>

//       {/* Client ID and Secret Input */}
//       <div>
//         <input
//           type="text"
//           placeholder="Client ID"
//           value={clientId}
//           onChange={(e) => setClientId(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Client Secret"
//           value={clientSecret}
//           onChange={(e) => setClientSecret(e.target.value)}
//         />
//       </div>

//       {/* Aadhaar Number Input */}
//       <div>
//         <input
//           type="text"
//           placeholder="Aadhaar Number"
//           value={aadhaarNumber}
//           onChange={(e) => setAadhaarNumber(e.target.value)}
//         />
//       </div>

//       {/* Generate Access Token and OTP */}
//       <button onClick={handleGetAccessToken}>Generate OTP</button>

//       {/* Display Results */}
//       {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
//       {otpTxnId && <p>Transaction ID: {otpTxnId}</p>}
//     </div>
//   );
// }

// export default GenerateId;
