import React, { useMemo, useState, useEffect, useRef } from "react";
import { ProfileSelect } from "../components/Form";
import { useNavigate, useLocation } from "react-router-dom";
import { PiBell } from "react-icons/pi";
import MenuDrawer from "../components/Drawer/MenuDrawer";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";
import NotificationComp from "../components/NotificationComp";
import Feedback from "./feedback";
import { Link } from "react-router-dom";
import { getHprRegistrationPercentage, getCurrentStep, getProgressPercentage } from "../utils/hprUtils";
import { PiChatCenteredText } from "react-icons/pi";
import { RxPerson } from "react-icons/rx";
import { CiChat1 } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { IoInformationOutline } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";

function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackRef = useRef(null);
  const { doctorLogout, doctor } = useDoctorAuthStore();
  const location = useLocation();

  // Track the current registration step from localStorage to trigger recalculation
  const [currentStep, setCurrentStep] = useState(() => {
    return Number(localStorage.getItem("formStep")) || 0;
  });

  // Listen for storage changes and update state
  useEffect(() => {
    const handleStorageChange = () => {
      const step = Number(localStorage.getItem("formStep")) || 0;
      setCurrentStep(step);
    };

    // Listen for storage events (when localStorage is updated from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom step change event
    const handleStepChange = () => {
      const step = Number(localStorage.getItem("formStep")) || 0;
      setCurrentStep(step);
    };
    window.addEventListener('registrationStepChanged', handleStepChange);

    // Also check periodically for changes (since same-tab updates don't trigger storage event)
    const interval = setInterval(() => {
      const step = Number(localStorage.getItem("formStep")) || 0;
      if (step !== currentStep) {
        setCurrentStep(step);
      }
    }, 50); // Reduced to 50ms for faster updates

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('registrationStepChanged', handleStepChange);
      clearInterval(interval);
    };
  }, [currentStep]);

  // Also update when doctor changes (after Save & Next)
  useEffect(() => {
    const step = Number(localStorage.getItem("formStep")) || 0;
    setCurrentStep(step);
  }, [doctor]);

  // Use useMemo to ensure percentage recalculates when doctor or step changes
  // This ensures the percentage updates reactively when doctor data changes in the store
  const percentage = useMemo(() => {
    // If we're on the registration screen, use the current step from localStorage
    // This ensures progress reflects the current step, not old database data
    const isRegistrationScreen = location.pathname === '/registerPersonalDetail' ||
      location.pathname.startsWith('/profile/');

    if (isRegistrationScreen) {
      const currentUIStep = currentStep; // Use state value
      console.log("Header - Registration screen, currentUIStep:", currentUIStep);

      // Map UI step (0-3) to progress percentage
      // Step 0 (PersonalDetails) → 0% or 25% if Step 1 complete
      // Step 1 (Qualification) → 25% (Step 1 done)
      // Step 2 (WorkDetail) → 50% (Steps 1-2 done)
      // Step 3 (Preview) → 75% (Steps 1-3 done)

      // If on step 0, check if Step 1 is complete in database
      if (currentUIStep === 0) {
        const dbStep = getCurrentStep(doctor);
        // If Step 1 is complete in DB, show 25%, otherwise 0%
        const percent = dbStep >= 0 ? 25 : 0;
        console.log("Header - Step 0, dbStep:", dbStep, "percent:", percent);
        return percent;
      }

      // For step 3 (Preview), use the same calculation as Profile.js
      if (currentUIStep === 3) {
        // Use getHprRegistrationPercentage to ensure consistency with Profile.js
        const calculatedPercentage = getHprRegistrationPercentage(doctor);
        console.log("Header - Step 3 (Preview), calculatedPercentage:", calculatedPercentage);
        return calculatedPercentage;
      }

      // For other steps, show progress based on UI step
      // Step 1 → 25%, Step 2 → 50%
      const progressStep = currentUIStep - 1; // Convert UI step to progress step
      const percent = getProgressPercentage(progressStep);
      console.log("Header - Step", currentUIStep, "→ progressStep", progressStep, "→ percent", percent);
      return percent;
    }

    // Not on registration screen - use getHprRegistrationPercentage for consistency
    // This ensures Header and Profile.js always show the same percentage
    const calculatedPercentage = getHprRegistrationPercentage(doctor);
    console.log("Header - Not registration screen, Progress %:", calculatedPercentage);
    return calculatedPercentage;
  }, [doctor, location.pathname, currentStep]);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const navigate = useNavigate();

  // Close feedback on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (showFeedback) {
        setShowFeedback(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showFeedback]);

  // Close feedback when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feedbackRef.current && !feedbackRef.current.contains(event.target)) {
        setShowFeedback(false);
      }
    };

    if (showFeedback) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFeedback]);

  const DropDown1 = [
    {
      title: "HPR Profile",
      icon: RxPerson,
      onClick: () => {
        // Navigate to edit form
        navigate("/registerPersonalDetail");
      },
    },
    {
      title: "Chats",
      icon: CiChat1,
      onClick: () => navigate("/chat"),
    },
    {
      title: "Settings",
      icon: IoSettingsOutline,
      onClick: () => navigate("/editprofile", { state: { activeSection: "Account" } }),
    },
    {
      title: "Help & Support",
      icon: IoInformationOutline,
      onClick: () => window.open("https://avijo.in/contact", "_blank"),
    },
    {
      title: "Logout",
      icon: CiLogout,
      onClick: async () => {
        const isLogout = await doctorLogout();
        if (isLogout) {
          navigate("/");
        }
      },
    },
  ];


  return (
    <>
      {isOpen && <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />}

      {/* HEADER */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-[64px] items-center justify-between bg-white px-3 sm:px-6 shadow-sm">

        {/* LEFT – LOGO */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col sm:flex-row sm:items-end">
            <h1 className="text-[24px] sm:text-[26px] font-semibold leading-none text-black">
              <Link to={doctor ? "/dashboard" : "/"}>avijo</Link>
            </h1>
            <h6 className="text-[14px] sm:text-[16px] italic text-[#FD7979] sm:ml-1">
              <Link to={doctor ? "/dashboard" : "/"}>Expert</Link>
            </h6>
          </div>
        </div>

        {/* RIGHT – ICONS */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Feedback – desktop only */}
          {doctor && (
            <button
              onClick={() => setShowFeedback((p) => !p)}
              className="hidden md:inline rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50"
            >
              Feedback
            </button>
          )}

          {/* Premium Icon */}
          <div
            className="relative cursor-pointer group"
            onClick={() => window.location.href = "https://avijo.in/pricing"}
          >
            <span className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-1 py-0.5 text-[9px] font-semibold text-white">
              PRO
            </span>

            <div className="flex items-center justify-center rounded-full border border-yellow-400/50 bg-yellow-50 p-2">
              <PiChatCenteredText className="text-base text-yellow-600" />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
              Premium feature
            </div>
          </div>

          {/* Notifications */}
          {doctor && (
            <NotificationComp
              renderButton={(count) => (
                <div className="relative cursor-pointer">
                  <PiBell className="text-lg" />
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white">
                      {count}
                    </span>
                  )}
                </div>
              )}
            />
          )}

          {/* Profile */}
          {doctor ? (
            <ProfileSelect datas={DropDown1} progressPercentage={percentage}>
              <div className="flex items-center cursor-pointer">
                <img
                  src={
                    doctor?.doctorImage ||
                    doctor?.personalDetails?.doctorImage ||
                    doctor?.image ||
                    require("../Assets/images/profile3.png")
                  }
                  alt="profile"
                  className="h-8 w-8 rounded-full object-cover border"
                  onError={(e) =>
                    (e.target.src = require("../Assets/images/profile3.png"))
                  }
                />
                <p className="ml-2 hidden lg:block text-sm font-medium text-textGray">
                  Dr. {doctor?.fullName}
                </p>
              </div>
            </ProfileSelect>
          ) : (
            <Link
              to="/"
              className="hidden sm:block rounded-md border-2 border-[#0095D9] px-4 py-2 text-sm font-medium text-[#0095D9] hover:bg-[#eef9ff]"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu */}
          {/* <button
            onClick={toggleDrawer}
            className="md:hidden text-xl font-semibold"
          >
            ☰
          </button> */}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />

      {/* Feedback Dropdown */}
      {showFeedback && (
        <div
          ref={feedbackRef}
          className="absolute right-4 z-50 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border"
        >
          <div className="p-5">
            <Feedback />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;