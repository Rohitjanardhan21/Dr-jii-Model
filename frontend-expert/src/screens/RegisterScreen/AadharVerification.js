import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash";

const AadharMobileVerification = ({ setAllData, allData, setIsAdharPageVerified }) => {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showAadhar, setShowAadhar] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [resendTime, setResendTime] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [consentAccepted, setConsentAccepted] = useState(false);

    // --- Captcha states ---
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // exclude confusing chars
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setCaptchaInput("");
    setCaptchaValid(false);
  
    drawCaptcha(text);
  };
  
  // --- Draw distorted text on canvas ---
  const drawCaptcha = (text) => {
    const canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Background
    ctx.fillStyle = "#f3f3f3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
   
    // Random text styles
    ctx.font = "28px Arial";
    ctx.textBaseline = "middle";
    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 20;
      const y = 25 + Math.random() * 5;
      const angle = (Math.random() - 0.5) * 0.5;
  
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgb(${Math.random()*150}, ${Math.random()*150}, ${Math.random()*150})`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  
    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.7)`;
      ctx.beginPath();
      ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
      ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
      ctx.stroke();
    }
  };
  
  // Generate captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (resendTime > 0 && otpSent) {
      const timer = setTimeout(() => setResendTime(resendTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTime, otpSent]);

  const sendOtpAadhar = useCallback(
    debounce(async () => {
      const aadhaarNumber = getValues("aadhar");

      if (!/^\d{12}$/.test(aadhaarNumber)) {
        toast.error("Please enter a valid 12-digit Aadhar number");
        return;
      }

      setOtpSent(true);
      setResendTime(30);
      setCanResend(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/AadharOTP-Generate`,
        { aadhaarNumber },
        { withCredentials: true }
      );

        if (response.status === 200) {
          toast.success("OTP sent successfully!");

          // Save txnId to localStorage
          const txnId = response?.data?.data?.txnId;
          if (txnId) {
            localStorage.setItem("aadhaar_txnId", txnId);
            console.log("txnId saved:", txnId);
          } else {
            console.warn("txnId not found in response");
          }
        }
      } catch (error) {
        console.error("OTP Sending Failed:", error);
        toast.error("Failed to send OTP. Please try again.");
        setOtpSent(false);
      }
    }, 1000),
    [getValues]
  );

  const sendOtpMobile = useCallback(
    debounce(async () => {
      const mobile = getValues("mobile");

      if (!/^\d{10}$/.test(mobile)) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }

      setOtpSent(true);
      setResendTime(30);
      setCanResend(false);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/generate-mobile-otp`,
          { mobile },
          { withCredentials: true }
        );

        console.log("Mobile OTP Response:", response);

        if (response.status === 200) {
          // Check if backend says already verified
          if (
            response.data?.message === "Mobile number is already verified" &&
            response.data?.data?.verified === true
          ) {
            setAllData({ ...allData, ...response.data.data });
            setOtpSent(false);
            toast.success("Mobile number verified!");
            // Navigate to doctor profile page after successful verification
            const doctorSlug = localStorage.getItem("userId");
            if (doctorSlug) {
              navigate(`/docprofile/${doctorSlug}`);
            } else {
              navigate("/editprofile");
            }
          } else {
            toast.success("OTP sent successfully!");
          }
        }
      } catch (error) {
        console.error("Mobile OTP Sending Failed:", error);
        toast.error("Failed to send OTP. Please try again.");
        setOtpSent(false);
      }
    }, 1000),
    [getValues]
  );

  const verifyOtpAadhar = async () => {
    const aadhar = getValues("aadhar");
    const enteredOtp = otp.join("");

    if (!/^\d{6}$/.test(enteredOtp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!captchaValid) {
        toast.error("Captcha verification failed : please enter valid Captcha");
        return;
      }

    setLoading(true);
    toast.loading("Verifying OTP...", { id: "otp" });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-aadhaar-otp-verify`,
        { aadhar, otp: enteredOtp },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setLoading(false);
        toast.success("Aadhar verified successfully!", { id: "otp" });
        setIsAadharVerified(true);
        setAllData({ ...allData, ...response.data.data });
        setOtp(["", "", "", "", "", ""]);
        setOtpSent(false);
        setResendTime(30);
        setCanResend(false);
      } else {
        toast.error("Invalid OTP. Please try again.", { id: "otp" });
      }
    } catch (error) {
      console.error("Aadhar OTP Verification Failed:", error);
      toast.error("Invalid OTP. Please try again.", { id: "otp" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpMobile = async () => {
    const mobile = getValues("mobile");
    const enteredOtp = otp.join("");

    if (!/^\d{6}$/.test(enteredOtp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    toast.loading("Verifying OTP...", { id: "otp" });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/verify-mobile-otp`,
        { mobile, otp: enteredOtp },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Mobile number verified successfully!", { id: "otp" });
        setAllData({ ...allData, ...response.data.data });
        setOtp(["", "", "", "", "", ""]);
        setOtpSent(false);
        setResendTime(30);
        setCanResend(false);
        // Navigate to doctor profile page after successful verification
        const doctorSlug = localStorage.getItem("userId");
        if (doctorSlug) {
          navigate(`/docprofile/${doctorSlug}`);
        } else {
          navigate("/editprofile");
        }
      } else {
        toast.error("Invalid OTP. Please try again.", { id: "otp" });
      }
    } catch (error) {
      console.error("Mobile OTP Verification Failed:", error);
      toast.error("Invalid OTP. Please try again.", { id: "otp" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleConsentSubmit = () => {
    if (consentAccepted) {
      setShowConsentDialog(false);
      toast.success("Consent accepted successfully!");
    } else {
      toast.error("Please accept the consent declaration to continue");
    }
  };

  const consentTexts = {
    english: `I, hereby declare that I am voluntarily sharing my Aadhaar Number / Virtual ID and demographic information issued by UIDAI, with National Health Authority (NHA) for the sole purpose of creation of Healthcare Professional ID. I understand that my Healthcare Professional ID can be used and shared for purposes as may be notified by Ayushman Bharat Digital Mission (ABDM) from time to time including provision of healthcare services. Further, I am aware that my personal identifiable information (Name, Address, Age, Date of Birth, Gender and Photograph) may be made available to the entities working in the National Digital Health Ecosystem (NDHE) which inter alia includes stakeholders and entities such as healthcare professional (e.g. doctors), facilities (e.g. hospitals, laboratories) and data fiduciaries (e.g. health programmes), which are registered with or linked to the Ayushman Bharat Digital Mission (ABDM), and various processes there under. I authorize NHA to use my Aadhaar number / Virtual ID for performing Aadhaar based authentication with UIDAI as per the provisions of the Aadhaar (Targeted Delivery of Financial and other Subsidies, Benefits and Services) Act, 2016 for the aforesaid purpose. I understand that UIDAI will share my e-KYC details, or response of "Yes" with NHA upon successful authentication. I consciously choose to use Aadhaar number / Virtual ID for the purpose of availing benefits across the NDHE. I am aware that my personal identifiable information excluding Aadhaar number / VID number can be used and shared for purposes as mentioned above. I reserve the right to revoke the given consent at any point of time as per provisions of Aadhar Act and Regulations and other laws, rules and regulations.`,
    hindi: `इसके द्वारा मैं यह स्पष्ट करता हूं कि मैं स्वैच्छिक रूप से हेल्थकेयर प्रोफेशनल आईडी बनाने के एकमात्र उद्देश्य के लिए राष्ट्रीय स्वास्थ्य प्राधिकरण (एनएचए) के साथ यूआईडीएआई (UIDAI) द्वारा जारी अपना आधार नंबर/ वर्चुअल आईडी और जनसांख्यिकीय जानकारी साझा कर रहा हूं। मैं भली भांति जानता हूं कि मेरी हेल्थकेयर प्रोफेशनल आईडी को आयुष्मान भारत डिजिटल मिशन (एबीडीएम) द्वारा समय-समय पर स्वास्थ्य सेवाओं के प्रावधान सहित अधिसूचित उद्देश्यों के लिए उपयोग और साझा किया जा सकता है। और इसके अलावा, मैं इस बात से भी अवगत हूँ कि मेरी व्यक्तिगत पहचान स्थापित करने योग्य जानकारी (नाम, पता, आयु, जन्म तिथि, लिंग और फोटोग्राफ) राष्ट्रीय डिजिटल स्वास्थ्य इकोसिस्टम (एनडीएचई) में काम करने वाली संस्थाओं को उपलब्ध कराई जा सकती है, जिसमें अन्य बातों के साथ-साथ हितधारक और संस्थाएं शामिल हैं जैसे कि आयुष्मान भारत डिजिटल मिशन (एबीडीएम) के साथ पंजीकृत या उससे जुड़े हुए स्वास्थ्य पेशेवर (जैसे डॉक्टर), सुविधाएं (जैसे अस्पताल, प्रयोगशालाएं) और डेटा प्रत्ययी (data fiduciaries) (जैसे स्वास्थ्य कार्यक्रम) और उसके तहत आने वाली विभिन्न प्रक्रियाएं। मैं उपरोक्त उद्देश्य के लिए आधार (वित्तीय और अन्य सब्सिडी, लाभ और सेवाओं की लक्षित डिलीवरी) अधिनियम, 2016 के प्रावधानों के अनुसार यूआईडीएआई (UIDAI) के साथ आधार आधारित प्रमाणीकरण करने के लिए एनएचए को मेरे आधार नंबर/ वर्चुअल आईडी का उपयोग करने के लिए अधिकृत करता हूं। मैं जनता हूं कि यूआईडीएआई (UIDAI) मेरे ई-केवाईसी विवरण या सफल प्रमाणीकरण पर 'हां' की प्रतिक्रिया के बाद एनएचए के साथ साझा करेगा।`
  };

  return (
    <div className="flex items-center justify-center px-4">
      <Toaster position="top-center" />
      
      {/* Consent Dialog */}
      {showConsentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[95vh] w-full max-w-3xl mx-4 bg-white rounded-lg shadow-xl">
            {/* Dialog Header */}
            <div className="flex items-center justify-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedLanguage === 'english' ? 'Consent Declaration' : 'सहमति घोषणा'}
              </h3>
            </div>

            {/* Language Selection */}
            <div className="px-4 py-2 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedLanguage === 'english' ? 'Select Language:' : 'भाषा चुनें:'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="language"
                    value="english"
                    checked={selectedLanguage === 'english'}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="mr-2"
                  />
                  English
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="language"
                    value="hindi"
                    checked={selectedLanguage === 'hindi'}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="mr-2"
                  />
                  हिंदी (Hindi)
                </label>
              </div>
            </div>

            {/* Consent Text */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="text-sm text-gray-700 leading-relaxed">
                {consentTexts[selectedLanguage]}
              </div>
            </div>

            {/* Consent Checkbox and Submit */}
            <div className="p-4 border-t space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  {selectedLanguage === 'english' 
                    ? 'I agree to the above consent declaration and terms.' 
                    : 'मैं उपरोक्त सहमति घोषणा और शर्तों से सहमत हूं।'
                  }
                </span>
              </label>
              
              <div className="flex gap-3">
                <button
                  onClick={handleConsentSubmit}
                  disabled={!consentAccepted}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedLanguage === 'english' ? 'I Agree & Submit' : 'मैं सहमत हूं और जमा करता हूं'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {selectedLanguage === 'english' ? 'Cancel' : 'रद्द करें'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Component */}
      <div className={`my-5 w-full max-w-6xl rounded-lg ${showConsentDialog ? 'opacity-50' : ''}`}>
        <h2 className="mb-6 text-3xl font-semibold">
          Create Your Healthcare Professional ID
        </h2>
        <form className="space-y-6">
          {!isAadharVerified && (
            <div className="relative">
              <p className="mt-2 text-lg font-medium text-gray-600">
                Enter Your Aadhar Number/Virtual ID
              </p>
              <div className="relative mt-1">
                <input
                  type={showAadhar ? "text" : "password"}
                  className="w-full rounded-lg border px-4 py-3 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  {...register("aadhar", {
                    required: "Aadhar number is required",
                    pattern: {
                      value: /^\d{12}$/,
                      message: "Aadhar number must be 12 digits",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
                  onClick={() => setShowAadhar(!showAadhar)}
                >
                  {showAadhar ? <EyeOffIcon size={24} /> : <EyeIcon size={24} />}
                </button>
              </div>
              {errors.aadhar && (
                <p className="mt-1 text-sm text-red-500">{errors.aadhar.message}</p>
              )}
            </div>
          )}

          {isAadharVerified && (
            <div className="relative">
              <p className="mt-2 text-lg font-medium text-gray-600">
                Enter Your Mobile Number
              </p>
              <div className="relative mt-1">
                <input
                  type={showMobile ? "text" : "password"}
                  className="w-full rounded-lg border px-4 py-3 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
                  onClick={() => setShowMobile(!showMobile)}
                >
                  {showMobile ? <EyeOffIcon size={24} /> : <EyeIcon size={24} />}
                </button>
              </div>
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-500">{errors.mobile.message}</p>
              )}
            </div>
          )}
          
          {/* --- CAPTCHA --- */}
          <div>
  <label className="block font-medium text-gray-700">Enter Captcha</label>
  <div className="flex items-center space-x-4">
    <canvas id="captchaCanvas" width="150" height="50" className="border rounded" />
    <button
      type="button"
      onClick={generateCaptcha}
      className="text-sm text-[#0095D9] underline"
    >
      Refresh
    </button>
  </div>
  <input
    type="text"
    placeholder="Enter the text above"
    value={captchaInput}
    onChange={(e) => {
      setCaptchaInput(e.target.value.toUpperCase());
      if (e.target.value.toUpperCase() === captchaText) {
        setCaptchaValid(true);
      } else {
        setCaptchaValid(false);
      }
    }}
    className="mt-2 w-full rounded-lg border p-2 focus:border-[#0095D9] focus:ring-[#0095D9]"
    required
  />
</div>

          {!otpSent && (
            <div className="mt-4 flex">
              <button
                type="button"
                className="w-1/2 rounded-lg bg-blue-500 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-600"
                onClick={isAadharVerified ? sendOtpMobile : sendOtpAadhar}
              >
                Send OTP
              </button>
            </div>
          )}

          {otpSent && (
            <>
              <p className="font-small mt-2 text-lg text-gray-600">
                We have sent an OTP to your {isAadharVerified ? "mobile number" : "Aadhaar-linked mobile"}.
              </p>

              <div className="mt-1 flex space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    className="h-12 w-16 rounded-lg border text-center text-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <div className="mt-1 text-lg text-gray-600">
                Didn't receive OTP?{" "}
                {canResend ? (
                  <span
                    className="cursor-pointer text-blue-500"
                    onClick={isAadharVerified ? sendOtpMobile : sendOtpAadhar}
                  >
                    Resend OTP
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Resend OTP in {resendTime}s
                  </span>
                )}
              </div>

              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  disabled={loading}
                  className="w-1/2 rounded-lg bg-blue-500 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-600 disabled:bg-blue-300"
                  onClick={isAadharVerified ? verifyOtpMobile : verifyOtpAadhar}
                >
                  {loading ? "Verifying..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AadharMobileVerification;