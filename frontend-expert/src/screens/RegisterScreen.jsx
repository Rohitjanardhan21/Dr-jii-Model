import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import CustomStepper from "../components/CustomStepper";
import PersonalDetails from "./RegisterScreen/PersonalDetails";
import QualificationDetails from './RegisterScreen/Qualification.js';
import  WorkDetail  from "./RegisterScreen/WorkDetail";
import PreviewProfile from "./RegisterScreen/PreviewProfile";
import { RegisterHeader } from "./Register";
import toast from "react-hot-toast";
import axios from "axios";
import { toastHandler } from "../utils/toastHandler";
import Layout from "../Layout/index";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import AadharVerification from "./RegisterScreen/AadharVerification.js";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";
import { getCurrentStep } from "../utils/hprUtils";

const RegisterScreen = () => {
  const { doctor } = useDoctorAuthStore();
  const navigate = useNavigate();
  // Calculate the actual step based on doctor's profile completion status
  // getCurrentStep returns: -1 (step 0 incomplete), 0 (step 1 complete), 1 (step 2 complete), 2 (step 3 complete), 3 (all complete)
  // Registration steps are: 0 (Personal), 1 (Qualification), 2 (Work), 3 (Preview)
  const getCurrentRegistrationStep = () => {
    const currentStep = getCurrentStep(doctor);
    if (currentStep === -1) return 0; // Show Personal Details
    if (currentStep === 0) return 1; // Show Qualification
    if (currentStep === 1) return 2; // Show Work Details
    if (currentStep === 2) return 3; // Show Preview
    return 3; // All complete, show Preview
  };
  
  const [step, setStep] = useState(getCurrentRegistrationStep());
  const [registrationCertificate, setRegistrationCertificate] = useState(null);
  const [degreeDiploma, setDegreeDiploma] = useState(null);
  const [allData, setAllData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [districts, setDistricts] = useState([]);
  const[isAdharPageVarified, setIsAdharPageVerified] = useState(true);
  const isNavigatingRef = useRef(false);
  

  const methods = useForm({
    defaultValues: JSON.parse(localStorage.getItem("formData")) || {},
  });

  // Update step based on doctor's completion status
  // Only update step if it's the initial load or if the calculated step is not ahead of current step
  // This prevents jumping forward when user is actively navigating
  useEffect(() => {
    // Skip if user is actively navigating
    if (isNavigatingRef.current) return;
    
    const currentStep = getCurrentStep(doctor);
    let calculatedStep;
    if (currentStep === -1) calculatedStep = 0; // Show Personal Details
    else if (currentStep === 0) calculatedStep = 1; // Show Qualification
    else if (currentStep === 1) calculatedStep = 2; // Show Work Details
    else if (currentStep === 2) calculatedStep = 3; // Show Preview
    else calculatedStep = 3; // All complete, show Preview
    
    // Only update step if the calculated step is not ahead of current step
    // This prevents jumping forward when user is on an earlier step
    // Allow update only if: calculated step is less than or equal to current step, or it's the initial step 0
    if (calculatedStep <= step || (step === 0 && calculatedStep === 0)) {
      setStep(calculatedStep);
    }
  }, [doctor, step]);

  useEffect(() => {
    const subscription = methods.watch((data) => {
      localStorage.setItem("formData", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  const nextStep = () => {
    isNavigatingRef.current = true;
    setStep((prev) => {
      const newStep = prev + 1;
      localStorage.setItem("formStep", newStep);
      // Dispatch custom event to notify Header component
      window.dispatchEvent(new Event('registrationStepChanged'));
      // Reset navigation flag after a delay to allow async getDoctorData() to complete
      // This prevents useEffect from overriding the step navigation
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1500);
      return newStep;
    });
  };

  const prevStep = () => {
    isNavigatingRef.current = true;
    setStep((prev) => {
      const newStep = prev - 1;
      localStorage.setItem("formStep", newStep);
      // Dispatch custom event to notify Header component
      window.dispatchEvent(new Event('registrationStepChanged'));
      // Reset navigation flag after a delay to allow async operations to complete
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1500);
      return newStep;
    });
  };

  const onSubmit = async (data) => {
    if (!registrationCertificate || !degreeDiploma) {
      toast.error("Please upload both registration certificate and degree/diploma.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      formData.append("registrationCertificate", registrationCertificate);
      formData.append("degreeDiploma", degreeDiploma);

      const res = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/register`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
 
      await toastHandler(res, "Submitting Registration", "Registration Successful", "Registration Failed");
      localStorage.removeItem("formData");
      localStorage.removeItem("formStep");
      
      // // Check if TOTP setup is required
      // // Response structure: { statusCode: 200, message: "...", data: { userId: "...", requiresTotpSetup: true } }
      // console.log("Registration response:", res.data);
      
      // // Handle both possible response structures
      // const responseData = res.data?.data || res.data;
      // const requiresTotpSetup = responseData?.requiresTotpSetup;
      // const userId = responseData?.userId;
      
      // if (requiresTotpSetup && userId) {
      //   console.log("TOTP setup required, navigating to TOTP setup page");
      //   localStorage.setItem("totpSetupUserId", userId);
      //   navigate("/totp-setup", { state: { userId: userId } });
      // } else {
      //   console.log("TOTP setup not required, navigating to login");
      //   // Navigate to success page or reset form
      //   navigate("/login");
      // }
    } catch (error) {
      toast.error("Failed to submit registration. Please try again.");
      console.error("Submission Error:", error);
    }finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  const fetchInitialData = async () => {
    setIsLoading(true);

    const userId = localStorage.getItem("userId"); 

    if (!userId) {
      toast.error("User ID not found. Please login again.");
      setIsLoading(false);
      return;
    }


    const savedData = JSON.parse(localStorage.getItem("formData"));
    if (savedData?.isAadhaarVerified) {
      setIsLoading(false);
      return;
    }

    try {
      const [phasesRes, countriesRes, statesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/get-phases`,
          { withCredentials:true },
        ),
        axios.get(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/countries` 
        ),
        axios.get(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/states`
        ),
      ])

      setAllData(phasesRes.data.data);
      setCountries(countriesRes.data.data);
      setStates(statesRes.data.data);

    } catch (error) {
      toast.error("Failed to fetch initial data.");
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchInitialData();
}, []);

console.log("All Data:", allData);
console.log("Qual", allData?.qualificationDetails);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-subMain" />
      </div>
    );
  }

  return (
    <Layout>
      {!isAdharPageVarified ? (
        <AadharVerification setAllData={setAllData} allData={allData} setIsAdharPageVerified={setIsAdharPageVerified}/>
      ) : (
        <>
          <RegisterHeader />
          <section className="bg-white p-1 shadow-lg">
            <div className="mx-auto my-5 w-9/12">
              <CustomStepper ActiveStep={step} />
            </div>

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {step === 0 && (
                  <PersonalDetails
                    step={step}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    personalDetails={allData?.personalDetails}
                    addressPerKyc={allData?.addressPerKyc}
                    setAllData={setAllData}
                    states={states}
                    countries={countries}
                    districts={districts}
                    setDistricts={setDistricts}
                  />
                )}
                {step === 1 && (
                  <QualificationDetails
                    setRegistrationCertificate={setRegistrationCertificate}
                    setDegreeDiploma={setDegreeDiploma}
                    step={step}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    systemOfMedicine={allData?.systemOfMedicine}
                    qualificationDetails={allData?.qualificationDetails}
                    registrationDetails={allData?.registrationDetails}
                    setAllData={setAllData}
                  />
                )}
                {step === 2 && (
                  <WorkDetail
                    step={step}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    currentWorkDetails={allData?.currentWorkDetails}
                    placeOfWork={allData?.placeOfWork}
                    setAllData={setAllData}
                    states={states}
                    districts={districts}
                    setDistricts={setDistricts}
                  />
                )}
                {step === 3 && (
                  <PreviewProfile
                    step={step}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    allData={allData}
                    setIsAdharPageVerified={setIsAdharPageVerified}
                  />
                )}
                {/* {step === 3 && (
                  <button type="submit" className="m-4 btn btn-primary">
                    Final Save
                  </button>
                )} */}
              </form>
            </FormProvider>
          </section>
        </>
      )}
    </Layout>
  );
};

export default RegisterScreen;