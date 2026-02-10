import React, { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";
import axios from "axios";
import toast from "react-hot-toast";
import { normalizeProfilePayload } from "../utils/profilePayloadNormalizer";
import { logger } from "../utils/logger";
import AccountSettings from "./ProfileSettings/AccountSettings";
import PrivacySettings from "./ProfileSettings/PrivacySettings";
import DisplaySettings from "./ProfileSettings/DisplaySettings";
import EmailNotificationsSettings from "./ProfileSettings/EmailNotificationsSettings";
import LanguagesSettings from "./ProfileSettings/LanguagesSettings";
import SubscriptionsBillingSettings from "./ProfileSettings/SubscriptionsBillingSettings";

export default function EditProfile() {
  const { doctor, setDoctor } = useDoctorAuthStore();

  // Initialize state with empty values first
  const [profileImage, setProfileImage] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [mobile, setMobile] = useState("");
  const [about, setAbout] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [clinicDetails, setClinicDetails] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [activeSection, setActiveSection] = useState("Edit Profile");
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    allowSearchEngineIndex: true,
    allowAdultContent: false,
    allowProfileDiscoveryByEmail: true,
    allowLLMTraining: true,
    whoCanSendMessage: "followed",
    allowComments: true,
    allowGifsAutoPlay: true,
    allowAdvertisersPromote: true,
    notifySubscribers: false,
  });
  const [displaySettings, setDisplaySettings] = useState({
    theme: "auto",
    fontSize: "",
  });
  const [emailNotifications, setEmailNotifications] = useState({
    // Content Channels - General questions and answers
    newAnswers: true,
    requests: true,
    // Content Channels - Messages, comments and mentions
    messages: true,
    commentsAndReplies: true,
    mentions: true,
    // Content Channels - Spaces
    spaceInvites: true,
    spaceUpdates: true,
    spacesForYou: true,
    // Your network
    newFollowers: true,
    // Activity on your content
    upvotes: true,
    shares: true,
    moderation: true,
    // From Docare
    docareDigest: true,
    digestFrequency: "asAvailable",
    popularAnswers: true,
    storiesBasedOnActivity: true,
    recommendedQuestions: true,
  });
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we should navigate to a specific section from location state or search params
  useEffect(() => {
    const sectionFromState = location.state?.activeSection;
    const searchParams = new URLSearchParams(location.search);
    const sectionFromQuery = searchParams.get("section");
    
    if (sectionFromState) {
      setActiveSection(sectionFromState);
    } else if (sectionFromQuery) {
      setActiveSection(sectionFromQuery);
    }
  }, [location]);

  const handleBackClick = () => {
    navigate(-1);
  };

  // Helper function to get doctor image from multiple possible paths
  const getDoctorImage = (doc) => {
    if (!doc) return null;
    
    const imagePaths = [
      doc.doctorImage,
      doc.personalDetails?.doctorImage,
      doc.image,
      doc.personalDetails?.image,
      doc.profileImage,
      doc.avatar,
      doc.profilePicture,
      doc.userId?.doctorImage,
      doc.userId?.image,
      doc.docRefId?.doctorImage,
      doc.docRefId?.image
    ];
    
    for (const imgPath of imagePaths) {
      if (imgPath && typeof imgPath === 'string' && imgPath.trim() !== '' && imgPath !== 'undefined') {
        return imgPath;
      }
    }
    
    return null;
  };

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'DR';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    } else if (words[0].length === 1) {
      return words[0].toUpperCase() + 'D';
    }
    return 'DR';
  };

  // Function to update local state from doctor data with fallbacks
  const updateLocalState = useCallback((profile) => {
    if (!profile) return;
    
    // Try multiple possible data paths for each field
    const fullName = profile.personalDetails?.fullName || profile.fullName || "";
    const mobileNum = profile.docRefId?.mobileNumber || profile.mobileNumber || profile.contactDetails?.mobile || "";
    const aboutText = profile.about || profile.bio || "";
    const spec = profile.systemOfMedicine?.systemOfMedicine || profile.specialization || profile.specializations || "";
    const exp = [ profile.currentWorkDetails?.workStatus, profile.currentWorkDetails?.natureOfWork ].filter(Boolean).join(" - ");
    const edu = profile.qualificationDetails?.degreeName || profile.education || profile.qualifications || "";
    const clinic = profile.placeOfWork?.facilityName || profile.clinicDetails || profile.facilityName || "";
    
    // Always update text fields
    setDisplayName(fullName);
    setMobile(mobileNum);
    setAbout(aboutText);
    setSpecialization(spec);
    setExperience(exp);
    setEducation(edu);
    setClinicDetails(clinic);
    
    // Update profileImage only if we don't have a File or preview URL
    // Use functional updates to check current state
    setProfileImage((currentImage) => {
      // If we have a File, don't override
      if (currentImage instanceof File) {
        return currentImage;
      }
      // Otherwise, update with the profile image
      const imageUrl = getDoctorImage(profile);
      if (imageUrl) {
        const finalImageUrl = imageUrl.includes('?') 
          ? imageUrl 
          : `${imageUrl}?t=${Date.now()}`;
        return finalImageUrl;
      }
      return null; // Show initials if no image
    });
    
    // Only update preview URL if we don't have one
    setImagePreviewUrl((currentPreview) => {
      return currentPreview || null; // Keep existing preview if any
    });
  }, []); // Setters are stable, no dependencies needed

  // Use ref to track doctor for condition checks without causing re-renders
  const doctorRef = useRef(doctor);
  useEffect(() => {
    doctorRef.current = doctor;
  }, [doctor]);

  // Fetch doctor details from backend
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setIsLoading(true);
        const doctorId = doctorRef.current?._id;
        
        const res = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getDoctorProfile/${doctorId}`, {
          withCredentials: true
        });
        
        if (res.data && res.data.data) {
          const profile = res.data.data;
          
          // Update global store - merge with existing doctor data to preserve all fields
          setDoctor((currentDoctor) => {
            if (!currentDoctor) return profile;
            // Deep merge to preserve nested structures
            return {
              ...currentDoctor,
              ...profile,
              // Preserve important nested structures
              personalDetails: {
                ...currentDoctor.personalDetails,
                ...profile.personalDetails,
              },
              docRefId: {
                ...currentDoctor.docRefId,
                ...profile.docRefId,
              },
            };
          });
          
          // Update local states from the merged profile
          updateLocalState(profile);
        } else {
          logger.warn("No data in response or unexpected response structure");
          // If no data, try to use store data
          if (doctorRef.current) {
            updateLocalState(doctorRef.current);
          }
        }
      } catch (error) {
        logger.error("Error fetching doctor details:", error);
        
        // If backend call fails, use store data without modifying it
        if (doctorRef.current) {
          updateLocalState(doctorRef.current);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const currentDoctor = doctorRef.current;
    if (currentDoctor?._id) {
      // If we have a doctor ID, fetch fresh data from backend
      fetchDoctorDetails();
    } else if (currentDoctor) {
      // If we have doctor data in store but no ID, use store data directly
      updateLocalState(currentDoctor);
      setIsLoading(false);
    } else {
      // No doctor data at all - this shouldn't happen if user is authenticated
      logger.warn("No doctor data found in store");
      setIsLoading(false);
    }
    // Only depend on doctor ID to avoid infinite loops when doctor object changes
    // setDoctor from Zustand is stable, updateLocalState is memoized
  }, [doctor?._id, updateLocalState, setDoctor]);

  // Update local state when doctor data changes in store (but only if we're not currently loading)
  // This helps sync the UI if the doctor data in the store is updated from elsewhere
  useEffect(() => {
    // Only update if:
    // 1. We have doctor data
    // 2. We're not currently loading (to avoid conflicts with fetchDoctorDetails)
    // 3. We don't have a preview or file selected (to preserve user's image selection)
    if (doctor && !isLoading && !imagePreviewUrl) {
      setProfileImage((currentImage) => {
        // Don't override if user has selected a file
        if (currentImage instanceof File) {
          return currentImage;
        }
        // Otherwise, update from doctor data
        return currentImage; // Will be updated by updateLocalState
      });
      updateLocalState(doctor);
    }
  }, [doctor?._id, isLoading, updateLocalState]); // Only depend on doctor ID to avoid unnecessary updates

  // Handle Image Upload & Preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Cleanup previous object URL if exists
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    // Create new object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setProfileImage(file);
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle image upload separately
  const handleImageSave = async () => {
    if (!(profileImage instanceof File)) {
      toast.error("Please select an image first");
      return;
    }

    const doctorId = doctor?._id;
    if (!doctorId) {
      toast.error("Doctor ID not found. Please refresh the page.");
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("doctorImage", profileImage);

      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorProfile/update/${doctorId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      );

      if (res.status === 200 && res.data.data) {
        const updatedDoctor = { ...doctor, ...res.data.data };
        setDoctor(updatedDoctor);
        
        // Cleanup object URL
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
          setImagePreviewUrl(null);
        }
        
        // Update profileImage to the new URL from response
        const uploadedImageUrl = getDoctorImage(res.data.data);
        if (uploadedImageUrl) {
          const imageUrl = uploadedImageUrl.includes('?') 
            ? uploadedImageUrl 
            : `${uploadedImageUrl}?t=${Date.now()}`;
          setProfileImage(imageUrl);
        } else {
          setProfileImage(null);
        }
        // Update other local state fields (but not profileImage since we just set it)
        const profile = res.data.data;
        const fullName = profile.personalDetails?.fullName || profile.fullName || "";
        const mobileNum = profile.docRefId?.mobileNumber || profile.mobileNumber || profile.contactDetails?.mobile || "";
        const aboutText = profile.about || profile.bio || "";
        const spec = profile.systemOfMedicine?.systemOfMedicine || profile.specialization || profile.specializations || "";
        const exp = [ profile.currentWorkDetails?.workStatus, profile.currentWorkDetails?.natureOfWork ].filter(Boolean).join(" - ");
        const edu = profile.qualificationDetails?.degreeName || profile.education || profile.qualifications || "";
        const clinic = profile.placeOfWork?.facilityName || profile.clinicDetails || profile.facilityName || "";
        setDisplayName(fullName);
        setMobile(mobileNum);
        setAbout(aboutText);
        setSpecialization(spec);
        setExperience(exp);
        setEducation(edu);
        setClinicDetails(clinic);
        
        toast.success("Profile image updated successfully!");
      } else {
        toast.error(res.data.message || "Failed to update profile image");
      }
    } catch (error) {
      logger.error("Error updating profile image:", error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || "Failed to update profile image"}`);
      } else {
        toast.error("Something went wrong while uploading the image.");
      }
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!displayName.trim()) {
        toast.error("Display name is required");
        return;
      }
      if (mobile && !/^\d{10}$/.test(mobile.trim())) {
        toast.error("Mobile number must be 10 digits");
        return;
      }
      if (specialization.trim() === "" || education.trim() === "" || clinicDetails.trim() === "") {
        toast.error("Specialization, Education, and Clinic Details are required");
        return;
      }

      const doctorId = doctor?._id;
      
      if (!doctorId) {
        toast.error("Doctor ID not found. Please refresh the page.");
        return;
      }

      // Use normalized payload structure for JSON updates
      const requestData = normalizeProfilePayload({
        fullName: displayName.trim(),
        mobile: mobile.trim(),
        about: about.trim(),
        specialization: specialization.trim(),
        experience: experience.trim(),
        degree: education.trim(),
        clinicDetails: clinicDetails.trim()
      });

      const headers = { "Content-Type": "application/json" };
      const endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorProfile/update/${doctorId}`;

      const res = await axios.put(
        endpoint,
        requestData,
        {
          headers,
          withCredentials: true
        }
      );

      if (res.status === 200 && res.data.data) {
        const updatedDoctor = { ...doctor, ...res.data.data };
        setDoctor(updatedDoctor);
        updateLocalState(res.data.data);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (error) {
      logger.error("Error saving profile:", error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.message || "Failed to update profile"}`);
      } else {
        toast.error("Something went wrong while saving your profile.");
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-white min-h-screen p-8 flex items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="flex">
          {/* Left Sidebar - Profile Settings */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
            <button
              onClick={handleBackClick}
              className="mb-6 text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2"
            >
              ← Back
            </button>
            
            {/* Profile Settings Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
                Profile Settings
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection("Edit Profile")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Edit Profile"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
                Settings
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection("Account")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Account"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Account
                </button>
                <button
                  onClick={() => setActiveSection("Privacy")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Privacy"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSection("Display")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Display"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Display
                </button>
                <button
                  onClick={() => setActiveSection("Email & Notifications")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Email & Notifications"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Email & Notifications
                </button>
                <button
                  onClick={() => setActiveSection("Languages")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Languages"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Languages
                </button>
                <button
                  onClick={() => setActiveSection("Subscriptions & Billing")}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition ${
                    activeSection === "Subscriptions & Billing"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Subscriptions & Billing
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-8">
            {/* Conditionally render content based on active section */}
            {activeSection === "Edit Profile" && (
              <>
                {/* Top bar */}
                <div className="flex justify-end items-center mb-6">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 border-[2px] border-[#0097DB] text-[#0097DB] rounded bg-white hover:bg-[#E6F5FB] transition"
                  >
                    Save Changes
                  </button>
                </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row border-b pb-6 mt-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                {imagePreviewUrl || profileImage ? (
                  <img
                    id="profile-preview"
                    src={imagePreviewUrl || profileImage}
                    alt="Profile"
                    className="h-[156px] w-[156px] rounded-full object-cover border border-gray-200"
                    onError={(e) => {
                      // If image fails to load, hide img and show initials instead
                      e.target.style.display = 'none';
                      const initialsDiv = e.target.nextElementSibling;
                      if (initialsDiv) {
                        initialsDiv.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`h-[156px] w-[156px] rounded-full border border-gray-200 flex items-center justify-center bg-gradient-to-br from-[#0097DB] to-[#0075a9] text-white text-4xl font-semibold ${imagePreviewUrl || profileImage ? 'hidden' : ''}`}
                >
                  {getInitials(displayName || doctor?.fullName || doctor?.personalDetails?.fullName || "Doctor")}
                </div>
                <label
                  htmlFor="profile-image-upload"
                  className="absolute bottom-0 right-0 bg-[#0097DB] text-white rounded-full p-2 cursor-pointer hover:bg-[#0075a9] transition shadow-lg z-10"
                  title="Change profile image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
                <input
                  ref={fileInputRef}
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <div className="text-2xl font-semibold">
                  Dr. {displayName || doctor?.fullName || "Doctor Name"}
                </div>
                {profileImage instanceof File && (
                  <button
                    onClick={handleImageSave}
                    disabled={isUploadingImage}
                    className="mt-2 px-3 py-1 text-sm bg-[#0097DB] text-white rounded hover:bg-[#0075a9] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isUploadingImage ? "Uploading..." : "Save Image"}
                  </button>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div className="mt-4 w-full">
              <label className="text-sm text-gray-500">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div className="mt-4 w-full">
              <label className="text-sm text-gray-500">Mobile number </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number "
                className="mt-1 w-full border rounded px-3 py-2 text-sm "
              />
            </div>
          </div>
        </div>

                {/* Editable Sections */}
                <EditableSection title="About" value={about} onChange={setAbout} />
                <EditableSection title="Specialization" value={specialization} onChange={setSpecialization} />
                <EditableSection title="Experience" value={experience} onChange={setExperience} />
                <EditableSection title="Education" value={education} onChange={setEducation} />
                <EditableSection title="Clinic Details" value={clinicDetails} onChange={setClinicDetails} />
              </>
            )}

            {activeSection === "Account" && (
              <AccountSettings 
                doctor={doctor}
                emailVerificationRequired={emailVerificationRequired}
                setEmailVerificationRequired={setEmailVerificationRequired}
              />
            )}

            {activeSection === "Privacy" && (
              <PrivacySettings 
                privacySettings={privacySettings}
                setPrivacySettings={setPrivacySettings}
              />
            )}

            {activeSection === "Display" && (
              <DisplaySettings 
                displaySettings={displaySettings}
                setDisplaySettings={setDisplaySettings}
              />
            )}

            {activeSection === "Email & Notifications" && (
              <EmailNotificationsSettings 
                emailNotifications={emailNotifications}
                setEmailNotifications={setEmailNotifications}
              />
            )}

            {activeSection === "Languages" && (
              <LanguagesSettings 
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
              />
            )}

            {activeSection === "Subscriptions & Billing" && (
              <SubscriptionsBillingSettings />
            )}

            {activeSection !== "Edit Profile" && activeSection !== "Account" && activeSection !== "Privacy" && activeSection !== "Display" && activeSection !== "Email & Notifications" && activeSection !== "Languages" && activeSection !== "Subscriptions & Billing" && (
              <div className="text-center py-12 text-gray-500">
                {activeSection} settings coming soon...
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


function EditableSection({ title, value, onChange }) {
  return (
    <div className="border-b py-6">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm text-gray-600"
        rows={3}
        placeholder={`Enter your ${title.toLowerCase()}`}
      />
    </div>
  );
}
