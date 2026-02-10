import axios from "axios";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { toastHandler } from "../../utils/toastHandler";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import { useNavigate } from "react-router-dom";

const PreviewProfile = ({ step, nextStep, prevStep, allData, setIsAdharPageVerified }) => {
  const {doctor, setDoctor, getDoctorData} =useDoctorAuthStore();
  const {
    register,
    formState: { errors },
    trigger,
    watch,
  } = useFormContext();
  const [showModal, setShowModal] = useState(false);

  const publicProfile = watch("publicProfile", "Yes");
  const about = watch("about", "");
  const navigate = useNavigate();

const handleSubmitProfile = async () => {
  const isValid = await trigger();
  if (!isValid) return;
  // Include isProfileCompleted: true to mark profile as complete in database
  const data = { doctor, about, publicProfile, isProfileCompleted: true };
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctor-government-registration/new-registration`,
      data,
      { withCredentials: true }
    );
    await toastHandler(
      res,
      "Updating Profile",
      "Profile Updated Successfully",
      "Error Updating Profile"
    );
    if (res.status === 200) {
      console.log("Success response:", res.data);
      
      // Mark profile as complete immediately for progress calculation
      // This ensures Header shows 100% before navigation
      if (res.data?.data) {
        const updatedDoctor = { 
          ...doctor, 
          ...res.data.data, 
          isProfileComplete: true,
          isProfileCompleted: true // Also set the database field name
        };
        setDoctor(updatedDoctor);
        console.log("Updated doctor in store with isProfileComplete and isProfileCompleted:", updatedDoctor);
      } else {
        // If response doesn't have data, still mark as complete
        const updatedDoctor = { 
          ...doctor, 
          isProfileComplete: true,
          isProfileCompleted: true // Also set the database field name
        };
        setDoctor(updatedDoctor);
        console.log("Marked profile as complete in store");
      }
      
      // Give Header time to recalculate with isProfileComplete flag
      // Small delay ensures the percentage updates to 100% before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Always fetch fresh doctor data from server to ensure all fields are up-to-date
      // This ensures the Header component recalculates percentage correctly
      try {
        const freshDoctorData = await getDoctorData();
        console.log("Fetched fresh doctor data after profile creation:", freshDoctorData);
        
        // Preserve isProfileComplete and isProfileCompleted flags even if server doesn't return them yet
        if (freshDoctorData && (!freshDoctorData.isProfileComplete || !freshDoctorData.isProfileCompleted)) {
          const doctorWithCompleteFlag = { 
            ...freshDoctorData, 
            isProfileComplete: true,
            isProfileCompleted: true
          };
          setDoctor(doctorWithCompleteFlag);
          console.log("Preserved isProfileComplete and isProfileCompleted flags after fresh data fetch");
        }
        
        // Navigate to doctor profile page with doctor ID as slug
        const doctorSlug = freshDoctorData?._id || doctor?._id || doctor?.id;
        if (doctorSlug) {
          navigate(`/docprofile/${doctorSlug}`);
        } else {
          navigate("/editprofile");
        }
      } catch (error) {
        console.error("Error fetching fresh doctor data:", error);
        // Navigate anyway
        const doctorSlug = doctor?._id || doctor?.id;
        if (doctorSlug) {
          navigate(`/docprofile/${doctorSlug}`);
        } else {
          navigate("/editprofile");
        }
      }
    }
  } catch (error) {
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Error updating profile";
    
    alert(`Registration Failed: ${errorMessage}`);
    toastHandler(null, "", "", errorMessage);
  }
};
// Unused function - commented out
// const handleHPRProfileSubmit = () => {
//   const doctorSlug = doctor?._id || doctor?.id;
//   if (doctorSlug) {
//     navigate(`/docprofile/${doctorSlug}`);
//   } else {
//     navigate("/editprofile");
//   }
// };

  return (
    <div className="mt-4 min-h-[80dvh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-4">
            The below information is available for public display.
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full" >
            <img src={doctor?.doctorImage} alt="Doctor" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-lg">{allData?.personalDetails?.fullName || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-800">
            <p><strong>System of medicine</strong><br />{allData?.systemOfMedicine?.systemOfMedicine || "N/A"}</p>
            <p><strong>Email Address</strong><br />{doctor?.emailId || "N/A"}</p>
            <p><strong>Mobile Number</strong><br />{doctor?.mobileNumber || "N/A"}</p>
            <p><strong>Language</strong><br />{allData?.personalDetails?.language || "N/A"}</p>
            <p><strong>Experience</strong><br />{allData?.currentWorkDetails?.natureOfWork || "N/A"}</p>
            <p><strong>Work status</strong><br />{allData?.currentWorkDetails?.workStatus || "N/A"}</p>
            <p><strong>Qualification</strong><br />{allData?.qualificationDetails?.degreeName || "N/A"}</p>
            <p><strong>Place of work</strong><br />{allData?.placeOfWork?.facilityName || "N/A"}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-md">
            To preview your details,{" "}
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Click here
            </button>
          </p>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-md">
              Your profile will be visible to the public?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-md">
                <input
                  type="radio"
                  value="Yes"
                  {...register("publicProfile", { required: "Please select an option" })}
                  defaultChecked={publicProfile === "Yes"}
                  className="accent-blue-600"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-md">
                <input
                  type="radio"
                  value="No"
                  {...register("publicProfile", { required: "Please select an option" })}
                  defaultChecked={publicProfile === "No"}
                  className="accent-blue-600"
                />
                No
              </label>
            </div>
            {errors.publicProfile && <p className="text-sm text-red-600">{errors.publicProfile.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-sm">About</label>
            <textarea
              rows={6}
              placeholder="Write about yourself..."
                            {...register("about", {
                required: "About section is required",
                maxLength: { value: 500, message: "About section cannot exceed 500 characters" },
              })}
              className="w-full rounded-md border border-gray-300 p-3 focus:ring focus:ring-blue-300"
            />
            <p className="text-sm text-gray-500 mt-1">{about.length}/500 characters</p>
            {errors.about && <p className="text-sm text-red-500">{errors.about.message}</p>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Profile Preview</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <IoClose size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Personal Details</h4>
                <p><strong>Name:</strong> {allData?.personalDetails?.fullName || "N/A"}</p>
                <p><strong>Title:</strong> {allData?.personalDetails?.title || "N/A"}</p>
                <p><strong>DOB:</strong> {allData?.personalDetails?.dob || "N/A"}</p>
                <p><strong>Nationality:</strong> {allData?.personalDetails?.nationality || "N/A"}</p>
                <p><strong>Language:</strong> {allData?.personalDetails?.language || "N/A"}</p>
                <p><strong>Email:</strong> {doctor?.emailId || "N/A"}</p>
                <p><strong>Mobile:</strong> {doctor?.mobileNumber || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Address</h4>
                <p><strong>Address:</strong> {allData?.addressPerKyc?.address || "N/A"}</p>
                <p><strong>Pincode:</strong> {allData?.addressPerKyc?.pincode || "N/A"}</p>
                <p><strong>State:</strong> {allData?.addressPerKyc?.state || "N/A"}</p>
                <p><strong>District:</strong> {allData?.addressPerKyc?.district || "N/A"}</p>
                <p><strong>Country:</strong> {allData?.addressPerKyc?.country || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Qualification Details</h4>
                <p><strong>Degree:</strong> {allData?.qualificationDetails?.degreeName || "N/A"}</p>
                <p><strong>College:</strong> {allData?.qualificationDetails?.college || "N/A"}</p>
                <p><strong>University:</strong> {allData?.qualificationDetails?.university || "N/A"}</p>
                <p><strong>Passing Year:</strong> {allData?.qualificationDetails?.passingYear || "N/A"}</p>
                <p><strong>Country of Qualification:</strong> {allData?.qualificationDetails?.countryOfQualification || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Registration Details</h4>
                <p><strong>Council:</strong> {allData?.registrationDetails?.registerWithCouncil || "N/A"}</p>
                <p><strong>Registration Number:</strong> {allData?.registrationDetails?.registrationNumber || "N/A"}</p>
                <p><strong>Date of Registration:</strong> {allData?.registrationDetails?.dateOfRegistration || "N/A"}</p>
                <p><strong>Status:</strong> {allData?.registrationDetails?.status || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Work Details</h4>
                <p><strong>Currently Working:</strong> {allData?.currentWorkDetails?.currentlyWorking ? "Yes" : "No"}</p>
                <p><strong>Nature of Work:</strong> {allData?.currentWorkDetails?.natureOfWork || "N/A"}</p>
                <p><strong>Work Status:</strong> {allData?.currentWorkDetails?.workStatus || "N/A"}</p>
                <p><strong>Teleconsultation URL:</strong> {allData?.currentWorkDetails?.teleconsultationUrl || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Place of Work</h4>
                <p><strong>Facility Name:</strong> {allData?.placeOfWork?.facilityName || "N/A"}</p>
                <p><strong>State:</strong> {allData?.placeOfWork?.state || "N/A"}</p>
                <p><strong>District:</strong> {allData?.placeOfWork?.district || "N/A"}</p>
                <p><strong>Facility ID:</strong> {allData?.placeOfWork?.facilityId || "N/A"}</p>
              </div>
              <div>
                <h4 className="font-semibold">About</h4>
                <p>{about || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        {step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            Back
          </button>
        )}
        <div className="flex gap-4">
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: "#0095D9" }}
            onClick={handleSubmitProfile}
          >
            Submit Profile
          </button>
        </div>
      </div> 
    </div>
  );
};

export default React.memo(PreviewProfile);
