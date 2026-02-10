import React, { useEffect, useRef, useState, useCallback } from "react";
import Layout from "../../Layout";
import { AiOutlineEdit } from "react-icons/ai";
import { IoShareSocialOutline } from "react-icons/io5";
import ReactStars from "react-rating-stars-component";
import { MdVerified } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import SmallCircularProgress from "../../components/UsedComp/SmallCircularProgress";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import { getHprRegistrationPercentage } from "../../utils/hprUtils";
import Modal from "../../components/Modals/Modal";
import { toast } from "react-hot-toast";

// Updated data array with only Profile and Reviews
const data = [
  "Profile",
  // "Answers",
  // "Questions", 
  // "Followers",
  // "Following",
  "Reviews",
  // "Spaces",
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  const { slug } = useParams(); // <-- From URL
  const location = useLocation();
  const [showQR, setShowQR] = useState(false);
  const qrContainerRef = useRef(null);
  const doctorId = slug?.slice(-24); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { doctor: authDoctor } = useDoctorAuthStore();
  const [fetchedDoctor, setFetchedDoctor] = useState(null);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);
  const [showPendingTooltip, setShowPendingTooltip] = useState(false);


  // Use fetched doctor if available, otherwise use auth doctor
  const displayDoctor = fetchedDoctor || authDoctor;
  const percentage = getHprRegistrationPercentage(displayDoctor);
  
  // Check if we're on the registration screen (steps 0-3)
  // During registration steps, show percentage circle
  // After "Submit Profile" is clicked, show pending icon
  const isOnRegistrationScreen = location.pathname === '/registerPersonalDetail';

  // Helper function to get doctor image URL (returns null if no image found)
  const getDoctorImage = (doc) => {
    if (!doc) return null;
    
    // Check multiple possible image locations, including nested docRefId
    const imagePaths = [
      doc.doctorImage,
      doc.docRefId?.doctorImage, // Nested docRefId.doctorImage (from API)
      doc.personalDetails?.doctorImage,
      doc.image,
      doc.docRefId?.image,
      doc.personalDetails?.image,
      doc.profileImage,
      doc.avatar,
      doc.profilePicture,
      // Check if there's a nested structure
      doc.userId?.doctorImage,
      doc.userId?.image,
      // Check in any nested object
      doc.doctor?.doctorImage,
      doc.doctor?.image
    ];
    
    for (const imgPath of imagePaths) {
      if (imgPath && typeof imgPath === 'string' && imgPath.trim() !== '' && imgPath !== 'undefined') {
        return imgPath;
      }
    }
    
    return null;
  };
  
  // Determine if this is the authenticated doctor viewing their own profile
  const isOwnProfile = authDoctor && (authDoctor._id === doctorId || (fetchedDoctor && authDoctor._id === fetchedDoctor._id));
  
  
  // Get image - prioritize authenticated doctor's image when viewing own profile
  let doctorImageSrc;
  
  // When viewing own profile while logged in, use authenticated doctor's image (always most up-to-date)
  if (isOwnProfile) {
    const authImage = getDoctorImage(authDoctor);
    const fetchedImage = getDoctorImage(fetchedDoctor);
    
    doctorImageSrc = authImage || fetchedImage || require("../../Assets/images/profile3.png");
  } else {
    // For other doctors or public access, use fetched doctor's image from API
    const fetchedImage = getDoctorImage(fetchedDoctor);
    
    const authImage = getDoctorImage(authDoctor);
    doctorImageSrc = fetchedImage || authImage || require("../../Assets/images/profile3.png");
  }


  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const handleShareProfile = async () => {
    const profileUrl = window.location.href;
    const doctorName = displayDoctor?.fullName || displayDoctor?.personalDetails?.fullName || "Doctor";
    const shareData = {
      title: `Dr. ${doctorName} - Avijo Expert`,
      text: `Check out Dr. ${doctorName}'s profile on Avijo Expert`,
      url: profileUrl,
    };

    try {
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Profile shared successfully!");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(profileUrl);
        toast.success("Profile link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error.name !== "AbortError") {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(profileUrl);
          toast.success("Profile link copied to clipboard!");
        } catch (clipboardError) {
          toast.error("Failed to share profile");
          console.error("Share error:", clipboardError);
        }
      }
    }
  };

  const downloadQR = () => {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("QR code not ready yet. Please wait a moment.");
      return;
    }
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded successfully!");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getDoctorProfile/${doctorId}`);
        
        if (response.data && response.data.data) {
          const profileData = response.data.data;
          
          // Determine the best image to use
          const apiImage = getDoctorImage(profileData);
          const authImage = authDoctor ? getDoctorImage(authDoctor) : null;
          
          // If this is the authenticated doctor viewing their own profile, prioritize authDoctor's image
          const isOwnProfileCheck = authDoctor && (authDoctor._id === doctorId || authDoctor._id === profileData._id);
          
          if (isOwnProfileCheck) {
            // Use authDoctor's image (always most up-to-date for own profile)
            // But also preserve docRefId structure from API
            // IMPORTANT: Preserve isProfileComplete, isProfileCompleted, and hprRegistrationStatus from authDoctor
            // to ensure percentage calculation is correct
            const mergedDoctor = {
              ...profileData,
              doctorImage: authImage || apiImage || profileData.docRefId?.doctorImage || null,
              // Preserve completion flags from authDoctor for accurate percentage calculation
              // Note: isProfileCompleted is the database field, isProfileComplete is the frontend field
              isProfileComplete: authDoctor.isProfileComplete || profileData.isProfileComplete,
              isProfileCompleted: authDoctor.isProfileCompleted || profileData.isProfileCompleted,
              hprRegistrationStatus: authDoctor.hprRegistrationStatus || profileData.hprRegistrationStatus,
              // Preserve docRefId structure and update image if available
              docRefId: {
                ...(profileData.docRefId || {}),
                doctorImage: authImage || profileData.docRefId?.doctorImage || null
              },
              personalDetails: {
                ...(profileData.personalDetails || {}),
                doctorImage: authImage || profileData.personalDetails?.doctorImage || null
              }
            };
            
            setFetchedDoctor(mergedDoctor);
          } else {
            // For public access or other doctors, use API response (including docRefId structure)
            setFetchedDoctor(profileData);
          }
        } else {
          // If API doesn't return data, try to use auth doctor if available
          if (!authDoctor) {
            console.error("No doctor data available");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // If fetching fails and no auth doctor, show error
        if (!authDoctor) {
          console.error("Failed to load doctor profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, authDoctor?._id]); // Using authDoctor?._id (stable primitive) instead of authDoctor object to avoid unnecessary re-renders

  const tabPanel = () => {
    switch (activeTab) {
      case 0:
        return <ProfileComponent doctor={displayDoctor} />;
      // case 1:
      //   return <Answers />;
      // case 2:
      //   return <Questions />;
      // case 3:
      //   return <Followers />;
      // case 4:
      //   return <Following />;
      case 1: // Updated index for Reviews since other tabs are commented
        return <Reviews doctorProfileId={doctorId}/>;
      // case 6:
      //   return <Spaces />;
      default:
        return;
    }
  };

  if (loading) {
    return (  
      <Layout>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading doctor profile...</p>
        </div>
      </Layout>
    );
  }

  if (!displayDoctor) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Doctor profile not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='flex w-full flex-col rounded-xl'>
        <div className='flex w-full flex-col items-center bg-white md:flex-row pt-3 mt-3 p-3 pl-1 pr-3 pb-4 shadow-md'>
          <img
              key={`doctor-image-${doctorImageSrc}-${displayDoctor?._id}`}
              
              src={doctorImageSrc}
              alt='user'
              className='h-[150px] w-[150px] rounded-full object-cover border border-gray-200'
              onError={(e) => {
                const defaultImg = require("../../Assets/images/profile3.png");
                if (e.target.src !== defaultImg) {
                  e.target.src = defaultImg;
                }
              }}
           />
          <div className='ml-6 flex flex-col'>
            <div className='flex items-center'>
              <span className='text-[35px] text-[Gilroy-SemiBold] font-semibold text-gray-800'>
                Dr. {displayDoctor?.fullName || displayDoctor?.personalDetails?.fullName || "Doctor"}
              </span>
              {percentage === 100 ? (
                <div 
                  className='relative ml-3 mt-1'
                  onMouseEnter={() => setShowVerifiedTooltip(true)}
                  onMouseLeave={() => setShowVerifiedTooltip(false)}
                >
                  <MdVerified className='text-[#0095D9] text-2xl cursor-pointer' />
                  {showVerifiedTooltip && (
                    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50'>
                      Completed
                    </div>
                  )}
                </div>
              ) : isOnRegistrationScreen ? (
                // Show percentage circle during registration steps (0-3)
                <div className='relative ml-3 mt-1'>
                  <SmallCircularProgress percentage={percentage} />
                </div>
              ) : (displayDoctor?.isProfileComplete || displayDoctor?.hprRegistrationStatus) ? (
                // Show pending icon only after "Submit Profile" is clicked (not on registration screen)
                <div 
                  className='relative ml-2'
                  onMouseEnter={() => setShowPendingTooltip(true)}
                  onMouseLeave={() => setShowPendingTooltip(false)}
                >
                  <FaClock className='text-orange-500 text-xl cursor-pointer' />
                  {showPendingTooltip && (
                    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50'>
                      Pending
                    </div>
                  )}
                </div>
              ) : (
                // Default: show percentage circle if not submitted yet
                <div className='relative ml-3 mt-1'>
                  <SmallCircularProgress percentage={percentage} />
                </div>
              )}
            </div>
            {/* Commented out Followers/Following */}
            {/* <span className='text-[20px] text-[#5D5D5D] text-[Gilroy-SemiBold]'>
              {" "}
              0 Followers . 0 Following
            </span> */}
            
            {/* Doctor ID and Specialization */}
            <div className='flex flex-col gap-1'>
              <span className='text-[20px] text-[#5D5D5D] text-[Gilroy-SemiBold]'>
                Doctor ID: {displayDoctor?._id || displayDoctor?.doctorId || "N/A"}
              </span>
              <span className='text-[20px] text-[#5D5D5D] text-[Gilroy-SemiBold]'>
                Specialization: {Array.isArray(displayDoctor?.systemOfMedicine?.systemOfMedicine) 
                  ? displayDoctor.systemOfMedicine.systemOfMedicine.join(", ") 
                  : displayDoctor?.systemOfMedicine?.systemOfMedicine || displayDoctor?.specialization || "Not specified"}
              </span>
            </div>
            <div className='mt-4 flex flex-col items-start'>
              <div className='flex flex-row'>
                {/* Only show Edit Profile button if user is viewing their own profile */}
                {authDoctor && (authDoctor._id === doctorId || authDoctor._id === displayDoctor?._id) && (
                  <div className='flex w-32 cursor-pointer flex-row items-center rounded-md border border-[#0095D9] p-2'>
                    <AiOutlineEdit className='ml-2 h-4 w-4 text-[#0095D9]' />
                    <span className='pl-2 text-sm text-[#0095D9]'>
                      <button onClick={handleEditProfile}>
                        Edit Profile
                      </button>
                    </span>
                  </div>
                )}
                <div
                  onClick={() => setShowQR(true)}
                  className='border-[2px] border-[#0095D9] ml-4 flex w-32 cursor-pointer flex-row items-center rounded-md p-2'
                >
                  <IoShareSocialOutline className='ml-2 h-4 w-4 text-[#0095D9]' />
                  <span className='pl-2 text-sm text-[#0095D9]'>Show QR</span>
                </div>
                <div 
                  onClick={handleShareProfile}
                  className='border-[2px] border-[#0095D9] ml-4 flex cursor-pointer flex-row items-center rounded-full p-2'
                >
                  <IoShareSocialOutline className='h-4 w-4 text-[#0095D9]' />
                </div>
              </div>          
            </div>
          </div>
        </div>
        {/* QR Code Modal */}
        <Modal
          isOpen={showQR}
          closeModal={() => setShowQR(false)}
          title="QR Code"
          width="max-w-md"
        >
          <div
            ref={qrContainerRef}
            className='flex flex-col items-center justify-center py-6'
          >
            <QRCodeCanvas
              id='qr-gen'
              value={window.location.href}
              size={300}
              level='H'
              includeMargin={true}
            />
            <div className='mt-6 flex flex-row gap-3'>
              <button
                onClick={downloadQR}
                className='rounded-md bg-[#0095D9] px-6 py-2 text-sm font-medium text-white hover:bg-[#007fbf] transition-colors'
              >
                Download QR
              </button>
              <button
                onClick={() => setShowQR(false)}
                className='rounded-md border border-[#0095D9] px-6 py-2 text-sm font-medium text-[#0095D9] hover:bg-[#eef9ff] transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
        <div className='flex w-full flex-row border-b-2 bg-white p-2 shadow-md'>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveTab(index)}
              className={`${activeTab === index ? `border-b-2 border-[#0095D9]` : `border-0`} m-2 ml-6 cursor-pointer items-center`}
            >
              <span
                className={`${activeTab === index ? `text-[#0095D9]` : `text-[#313131]`} text-md text-center`}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
        {tabPanel()}
      </div>
    </Layout>
  );
}

const ProfileComponent = ({ doctor }) => {
  if (!doctor) {
    return <div className="p-5 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="my-8 w-full flex flex-col gap-4">
      {/* About Section */}
        <div className="rounded-lg bg-white p-3 pl-1 pr-3 pb-4 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
          {doctor.about || "No information provided"}
        </p>
      </div>

      {/* Specialization Section */}
      <div className="rounded-lg bg-white p-3 pl-1 pr-3 pb-4 shadow-md">
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Specialization</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
          {Array.isArray(doctor.specialization)
            ? doctor.systemOfMedicine?.systemOfMedicine.join(", ")
            : doctor.systemOfMedicine?.systemOfMedicine || "Not specified"}
        </p>
      </div>

      {/* Experience Section */}
      <div className="rounded-lg bg-white p-3 pl-1 pr-3 pb-4 shadow-md">
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Experience</h1>
          <div className="text-gray-600 text-sm leading-relaxed">
          {/* Display years of experience - prioritize currentWorkDetails.experience from Work Details step */}
          {(() => {
            const experienceYears = doctor.currentWorkDetails?.experience || doctor.experience || doctor.yearsOfExperience || doctor.currentWorkDetails?.yearsOfExperience;
            
            // Handle text values like "less than 1" and "greater than 5"
            let experienceDisplayText = "";
            if (experienceYears) {
              const isNumeric = !isNaN(experienceYears) && !isNaN(parseFloat(experienceYears));
              experienceDisplayText = isNumeric 
                ? `${experienceYears} ${Number(experienceYears) === 1 ? 'year' : 'years'}`
                : experienceYears; // Display as-is for "less than 1", "greater than 5", etc.
            }
            
            // If currently working, show work status and nature of work with experience
            if (doctor.currentWorkDetails?.currentlyWorking) {
              const workInfo = `${doctor.currentWorkDetails.workStatus || ""} ${doctor.currentWorkDetails?.natureOfWork || ""}`.trim();
              return (
                <p>
                  Currently Working – {workInfo}
                  {experienceDisplayText && ` - ${experienceDisplayText}`}
                </p>
              );
            }
            
            // If not currently working but has experience, show just experience
            if (experienceDisplayText) {
              return (
                <p className="mb-2">
                  <span className="font-medium">Years of Experience:</span> {" "}
                  {experienceDisplayText}
                </p>
              );
            }
            
            return null;
          })()}
        </div>
      </div>

      {/* Education Section */}
       <div className="rounded-lg bg-white p-3 pl-1 pr-3 pb-4 shadow-md">
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Education</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
          Degree - {doctor.qualificationDetails?.degreeName || "Not specified"} <br />
          College - {doctor.qualificationDetails?.college || "Not specified"} <br />
          University - {doctor.qualificationDetails?.university || "Not specified"} <br />
          Passout - {doctor.qualificationDetails?.passingMonth || "Not specified"}, {doctor.qualificationDetails?.passingYear || "Not specified"}
        </p>
      </div>

      {/* Clinic Details Section */}
       <div className="rounded-lg bg-white p-3 pl-1 pr-3 pb-4 shadow-md">
          <h1 className="text-lg font-semibold text-gray-800 mb-2">Clinic Details</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
          {doctor.placeOfWork?.facilityName ||
            "Not specified"}, {doctor.placeOfWork?.district ||
            " "}, {doctor.placeOfWork?.state ||
            " "}<br />
        </p>
      </div>
    </div>
  );
};

const Reviews = ({ doctorProfileId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch reviews from backend
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if doctorProfileId is provided
      if (!doctorProfileId) {
        throw new Error('Doctor Profile ID is required');
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/getAllReview?doctorProfileId=${doctorProfileId}&t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      console.log("Reviews array:", data.reviews);
      console.log("Number of reviews:", data.reviews?.length || 0);
      
      setReviews(data.reviews || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorProfileId]);

  // Fetch reviews on component mount and when doctorProfileId changes
  useEffect(() => {
    fetchReviews();
  }, [doctorProfileId, fetchReviews]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-[#8E8E8E]">Loading reviews...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-500">
          Error loading reviews: {error}
          <button 
            onClick={fetchReviews}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No reviews state
  if (reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-[#8E8E8E]">No reviews available</div>
      </div>
    );
  }

  return (
    <>
      {reviews.map((review) => (
        <div key={review._id} className='mt-6 flex flex-col items-center border p-8 shadow-lg'>
          <div className='flex w-[90%] flex-row items-start justify-between'>
            <div className='flex flex-row items-center'>
              <img
                src={review.userId?.userImage || require("../../Assets/images/profile3.png")}
                className='h-[120px] w-[120px] rounded-full object-cover'
                alt={`${review.userId?.fullName || 'User'} profile`}
                onError={(e) => {
                  e.target.src = require("../../Assets/images/profile3.png");
                }}
              />
              <div className='flex flex-col pl-4'>
                <span className='text-[30px] text-[#555555] text-[Gilroy-SemiBold]'>
                  {review.userId?.fullName || 'Anonymous User'}
                </span>
                <div className='mt-4 flex flex-row'>
                  <span className='text-[18px] text-[#8E8E8E] text-[Gilroy-SemiBold]'>
                    Visited For
                  </span>
                  <span className='ml-2 text-[18px] text-[Gilroy-SemiBold] text-black'>
                    {review.doctorProfileId?.specialization || 'General Consultation'}
                  </span>
                </div>
                <div className='flex flex-row items-center'>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={24}
                    isHalf={true}
                    emptyIcon={<i className='far fa-star-o'></i>}
                    halfIcon={<i className='fa fa-star-half-alt'></i>}
                    fullIcon={<i className='fa fa-star'></i>}
                    activeColor='#ffd700'
                    edit={false} // Make stars read-only
                  />
                  <span className='text-md ml-2 text-[#555555]'>
                    ({review.rating})
                  </span>
                </div>
              </div>
            </div>
            <span className='text-md text-[#8E8E8E]'>
              {formatDate(review.createdAt)}
            </span>
          </div>
          <span className='text-md mt-4 w-[90%] text-[#8E8E8E]'>
            {review.comment}
          </span>
          {/* Display doctor experience if available */}
          {(() => {
            const experienceValue = review.doctorProfileId?.currentWorkDetails?.experience || 
                                   review.doctorProfileId?.experience || 
                                   review.doctorProfileId?.yearsOfExperience ||
                                   review.doctorProfileId?.currentWorkDetails?.yearsOfExperience;
            if (!experienceValue) return null;
            
            // Handle text values like "less than 1" and "greater than 5"
            const isNumeric = !isNaN(experienceValue) && !isNaN(parseFloat(experienceValue));
            const displayText = isNumeric 
              ? `${experienceValue} ${Number(experienceValue) === 1 ? 'year' : 'years'}`
              : experienceValue; // Display as-is for "less than 1", "greater than 5", etc.
            
            return (
              <div className='mt-2 w-[90%] text-sm text-[#8E8E8E]'>
                Doctor Experience: {displayText}
              </div>
            );
          })()}
        </div>
      ))}
    </>
  );
};

// COMMENTED OUT SECTIONS
/*
const Answers = () => {
  return (
    <div>
      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 flex w-full flex-col rounded-xl border-[1px] border-border bg-white p-5'
      >
        <div className='flex w-full flex-row items-start justify-between p-2'>
          <div className='flex flex-row items-center'>
            <span className='h-[40px] w-[40px] rounded-full bg-[#0095D9] text-center text-[28px] text-[Gilroy-SemiBold] text-white'>
              S
            </span>
            <div className='flex flex-col pl-4'>
              <div className='flex flex-row'>
                <span className='text-[22px] text-[Gilroy-SemiBold] text-[black]'>
                  Stuff man have to deal with
                </span>
              </div>
              <span className='text-md text-[#555555]'>
                Answered by Anthony 7h
              </span>
            </div>
          </div>
        </div>
        <span className='mt-4 pl-2 text-[20px] text-[Gilroy-SemiBold] text-[black]'>
          How do I care for my health without doing anything?
        </span>
        <span className='mt-2 pl-2 text-[14px] text-[#898989] text-[Gilroy-SemiBold]'>
          No answer yet . Last followed 14m
        </span>
        <div className='flex w-full flex-row items-center justify-between p-2'>
          <div className='mt-4 flex w-full flex-row items-center'>
            <div className='flex w-36 flex-row items-center justify-between rounded-xl border border-[#DEDEDE] p-2 pl-4 pr-4'>
              <PiArrowFatUp className='h-4 w-4 text-[#0095D9]' />
              <span className='text-md text-[#717171]'>Upvote</span>
              <PiArrowFatDown className='h-4 w-4' />
            </div>
            <IoChatbubbleOutline className='ml-2 h-6 w-6 text-black' />
            <FiRefreshCcw className='ml-2 h-6 w-6 text-black' />
          </div>
          <BsThreeDots className='ml-2 h-6 w-6 text-black' />
        </div>
      </div>
    </div>
  );
};

const Questions = () => {
  const data1 = [
    {
      id: 0,
      heading:
        "Do real fighter pilots really fly around with their masks hanging loose half the time like they do in the movies?",
      text: "4 answers Last followed 8mo",
    },
    {
      id: 1,
      heading:
        "Do real fighter pilots really fly around with their masks hanging loose half the time like they do in the movies?",
      text: "4 answers Last followed 8mo",
    },
    {
      id: 2,
      heading:
        "Do real fighter pilots really fly around with their masks hanging loose half the time like they do in the movies?",
      text: "4 answers Last followed 8mo",
    },
  ];

  return (
    <>
      {data1.map((item) => (
        <div
          data-aos='fade-up'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
          className='my-8 flex w-full flex-col border-b-[1px] border-[#C3C3C3] bg-white p-5'
        >
          <div className='flex w-full flex-row items-start justify-between p-2'>
            <div className='flex w-full flex-row items-center'>
              <span className='text-[20px] text-[Gilroy-SemiBold] text-black'>
                {item.heading}
              </span>
            </div>
          </div>
          <span className='mt-2 pl-2 text-[14px] text-[#898989] text-[Gilroy-SemiBold]'>
            {item.text}
          </span>
          <div className='flex w-full flex-row items-center justify-between p-2'>
            <div className='mt-4 flex w-full flex-row items-center'>
              <div className='flex w-32 flex-row items-center rounded-full bg-[#F8F8F8] p-2'>
                <img
                  src={require("../../Assets/images/answer.png")}
                  className='ml-2 h-4 w-4'
                />
                <span className='text-md pl-2 text-[#717171]'>Answer</span>
              </div>
            </div>
            <PiArrowFatDown className='mr-2 h-[19] w-[18] text-[#555555]' />
            <BsThreeDots className='ml-2 h-6 w-6 text-black' />
          </div>
        </div>
      ))}
    </>
  );
};

const Followers = () => {
  return (
    <div>
      {data.map((item) => (
        <div className='m-2 mt-4 flex w-full flex-row items-center justify-between border p-2 pl-4 pr-4'>
          <div className='flex flex-row items-center'>
            <img
              src={require("../../Assets/images/profile2.png")}
              className='h-[40px] w-[40px] rounded-full bg-[#0095D9] text-center text-[28px] text-[Gilroy-SemiBold] text-white'
            />
            <div className='flex flex-col pl-4'>
              <div className='flex flex-row items-center'>
                <span className='text-[18px] text-[#555555] text-[Gilroy-SemiBold]'>
                  Nancy Johnson{" "}
                </span>
                <span className='text-md ml-2 text-[#6A6A6A]'>
                  {" "}
                  studied at University of Cambridge (2012)
                </span>
              </div>
              <span className='text-md text-[#6A6A6A]'>
                6.3k views last week
              </span>
            </div>
          </div>
          <div className='flex flex-row items-center justify-center rounded-lg border border-[#0097DB] p-2'>
            <AiOutlineUserAdd className='h-[17px] w-[14px] text-[#0097DB]' />
            <span className='ml-2 text-sm text-[#0097DB]'>Follow</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Following = () => {
  const data2 = [
    {
      id: 0,
      image: require("../../Assets/images/following1.png"),
      text: "Assignment Forum",
    },
    {
      id: 1,
      image: require("../../Assets/images/following2.png"),
      text: "Space",
    },
    {
      id: 2,
      image: require("../../Assets/images/following3.png"),
      text: "United states",
    },
  ];

  return (
    <div>
      {data2.map((item) => (
        <div className='m-2 mt-4 flex w-[65%] flex-row items-center justify-between border-b pb-8 pl-4 pr-4 pt-8'>
          <div className='flex flex-row items-center'>
            <img
              src={item.image}
              className='h-[44px] w-[44px] rounded-lg bg-[#0095D9] text-center text-[28px] text-[Gilroy-SemiBold] text-white'
            />
            <div className='flex flex-col pl-4'>
              <div className='flex flex-row items-center'>
                <span className='text-[16px] text-[Gilroy-SemiBold] text-black'>
                  {item.text}
                </span>
              </div>
              <span className='text-[14px] text-[#6A6A6A]'>32K followers</span>
              <span className='text-[14px] text-[#6A6A6A]'>
                Questions and discussions regarding academia, assignments,
                homework, school, etc.
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Spaces = () => {
  const images = [
    "https://s3-alpha-sig.figma.com/img/4ad3/218e/91325235b506925419c879025ee57826?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=S2kGcY0tcN8Z5roNl-0TGZBfI4ldIYcL40ZTFPE2~oNFTJFj1v-OzFcmaL4F2FXpXZr3MzD-PuigQ0TAnU2i2yxlhcJDk2M1rcDZBc1Xccq8SiOgT-subdoqMEicY-xyETDUHhQsDMozGa8jc9C5Ig4qAmmRhEaDo7GG94xCY0oOvUGR8MoRii~AynKv4m9GiewiXc8ffEI86iQhizisbJ6glzwzgvdUqnTCAKwz6efnYgS1V52LiQz~FG1LQwguCQKWg~syVcTKV~JOhzwGcD7uiJlWhFLtQYkARF8JbAJwyVSJnh8axkINvNQVyvzAdOcmt4hU4SfuNivv7R1f5Q__",
    "https://s3-alpha-sig.figma.com/img/0a26/80a5/323e67e62a1eb1cbc3dd70c08baaa8ee?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=ILSoYXX5uCgUXy28kKAI3~9sKpBTqfdaN2aN7C9ReHSMHv~tOiumaZHJPYTXt9ro7wGdww7KRSDc7MeiFp8lu~d7DJFjwMduxZFRzQScEl2aiM79dDM3UkcMlO3ya93gXgOlPI71K4pDtWGfphe2RSTmAyTDPbCBOX2mCa9fOHg3fXuE5ZIMlnee1UDin2tNSWLz~vEFVCfyzPeChqHhT5qLIGb7LicNVjJTmnoTGROwP0XQ3LWhkzz-2pNk-PFc0bbNQ4-0DLY4Wmoolvlh~5iiUxPCD3B49XV4ajCrPKxqz2BKe5kfdpMrj48LqxxYgVuXZ~0MOis7Gq6YuoherA__",
    "https://s3-alpha-sig.figma.com/img/6b6a/324a/72a7b49edcd031fee6bf1bdc073c5c10?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=nRSC16yIoxR5CjiYGjBFi5~Gp1ywE7hjt6eqvwvwGUoyGqXZq4BBHnRhk0Nu9DAq5eVT7pkv6xNZJhDd02iURU4IUSrfDvTyYw6PpMy8tG3na0wCPimiWrnov61Yrvxj1S6fW-eIOs-8KHrrZOcn6XuvaSiuMxjOrJKliCXTccniti4PU-k~SuTcgbGVP4y8n8quRnYmp04nRr8xxpHOD2EQI2VF~I1qgrQYPeqs-t-ZQz17NAtQW-vc4EfixWg6N7U1rajK4D6gFTq7It7AH1OJt4k9GxL7aHM891ZkckdFJuxdIucMXozDFUBD340g3tDdFlAV6oZZlb1s48w0XQ__",
    "https://s3-alpha-sig.figma.com/img/4ad3/218e/91325235b506925419c879025ee57826?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=S2kGcY0tcN8Z5roNl-0TGZBfI4ldIYcL40ZTFPE2~oNFTJFj1v-OzFcmaL4F2FXpXZr3MzD-PuigQ0TAnU2i2yxlhcJDk2M1rcDZBc1Xccq8SiOgT-subdoqMEicY-xyETDUHhQsDMozGa8jc9C5Ig4qAmmRhEaDo7GG94xCY0oOvUGR8MoRii~AynKv4m9GiewiXc8ffEI86iQhizisbJ6glzwzgvdUqnTCAKwz6efnYgS1V52LiQz~FG1LQwguCQKWg~syVcTKV~JOhzwGcD7uiJlWhFLtQYkARF8JbAJwyVSJnh8axkINvNQVyvzAdOcmt4hU4SfuNivv7R1f5Q__",
    "https://s3-alpha-sig.figma.com/img/0a26/80a5/323e67e62a1eb1cbc3dd70c08baaa8ee?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=ILSoYXX5uCgUXy28kKAI3~9sKpBTqfdaN2aN7C9ReHSMHv~tOiumaZHJPYTXt9ro7wGdww7KRSDc7MeiFp8lu~d7DJFjwMduxZFRzQScEl2aiM79dDM3UkcMlO3ya93gXgOlPI71K4pDtWGfphe2RSTmAyTDPbCBOX2mCa9fOHg3fXuE5ZIMlnee1UDin2tNSWLz~vEFVCfyzPeChqHhT5qLIGb7LicNVjJTmnoTGROwP0XQ3LWhkzz-2pNk-PFc0bbNQ4-0DLY4Wmoolvlh~5iiUxPCD3B49XV4ajCrPKxqz2BKe5kfdpMrj48LqxxYgVuXZ~0MOis7Gq6YuoherA__",
    "https://s3-alpha-sig.figma.com/img/6b6a/324a/72a7b49edcd031fee6bf1bdc073c5c10?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=nRSC16yIoxR5CjiYGjBFi5~Gp1ywE7hjt6eqvwvwGUoyGqXZq4BBHnRhk0Nu9DAq5eVT7pkv6xNZJhDd02iURU4IUSrfDvTyYw6PpMy8tG3na0wCPimiWrnov61Yrvxj1S6fW-eIOs-8KHrrZOcn6XuvaSiuMxjOrJKliCXTccniti4PU-k~SuTcgbGVP4y8n8quRnYmp04nRr8xxpHOD2EQI2VF~I1qgrQYPeqs-t-ZQz17NAtQW-vc4EfixWg6N7U1rajK4D6gFTq7It7AH1OJt4k9GxL7aHM891ZkckdFJuxdIucMXozDFUBD340g3tDdFlAV6oZZlb1s48w0XQ__",
  ];

  return (
    <div>
      <div className='mt-6 flex flex-col items-center p-8'>
        <div className='flex w-[90%] flex-col items-center md:flex-row md:items-start md:justify-between'>
          <div className='flex flex-row items-center'>
            <div className='flex flex-col pl-4'>
              <span className='text-[30px] text-[#555555] text-[Gilroy-SemiBold]'>
                Welcome to Spaces!{" "}
              </span>
              <div className='mt-2 flex flex-row'>
                <span className='text-[18px] text-[#8E8E8E] text-[Gilroy-SemiBold]'>
                  Follow Spaces to explore your interests on Quora.
                </span>
              </div>
              <div className='mt-8 flex w-full flex-row items-center'>
                <div className='flex flex-row items-center rounded-full border border-[#0095D9] p-2 pl-4 pr-4'>
                  <MdAddCircleOutline className='ml-2 h-4 w-4 text-[#0095D9]' />
                  <span className='pl-2 text-sm text-[#0095D9]'>
                    Create a Space
                  </span>
                </div>
                <div className='ml-4 flex flex-row items-center rounded-full border border-[#0095D9] p-2 pl-4 pr-4'>
                  <RiCompass3Line className='ml-2 h-4 w-4 text-[#0095D9]' />
                  <span className='pl-2 text-sm text-[#0095D9]'>
                    Discover Spaces
                  </span>
                </div>
              </div>
            </div>
          </div>
          <img
            src='https://s3-alpha-sig.figma.com/img/29b2/7009/84a716b85814569d689635d2ec454fa2?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=GHXTETXoK1NFGWtXjeoY9BxOWT24eljCxiCWOJxEwTuY75vzsam4TvoyatrSf06oOUAkHg5ILhMQ7-UhhrcipdK6V6Q4cLBXR5MYl6TcDFYikilXq7a5XCtbAM-3cKfbHrfcvwcN-kJC~pLn2YUflJzSNg63KamazLr~bNnWRZvrBAZwFlTK2QsIihoMx5ldFuID-I7hkl06Kh2OLbJlMqLhXs9FhHGzsX~DoHISJEAh63d0G8HO4BgV5lU3SJ36x63H~~QEjTLckvrw45nPrFdUZ2NDkgQLTS-VAyuITH4Z-jhaAcq7l5fQeGKntiggIIp6II7Wu7JFISu6kfQQsw__'
            className='h-[140px] w-[240px] sm:mt-4'
          />
        </div>
        <div className='mt-6 flex w-[90%] flex-col'>
          <span className='text-[30px] text-[#555555] text-[Gilroy-SemiBold]'>
            Discover Spaces{" "}
          </span>
          <div className='mt-2 flex flex-row'>
            <span className='text-[18px] text-[#565656] text-[Gilroy-SemiBold]'>
              Spaces you might like
            </span>
          </div>
        </div>
        <div className='mt-4 grid w-[80%] grid-cols-1 gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {images.map((item, index) => (
            <div className='flex flex-col items-center sm:w-full md:w-[100%] lg:w-[220px]'>
              <img
                src={item}
                className='h-[180px] w-full rounded-tl-xl rounded-tr-xl'
                alt={`pic-${index}`}
              />
              <span className='mt-4 text-center text-[18px] text-[Gilroy-SemiBold] text-[black]'>
                United State of America
              </span>
              <span className='mt-2 text-center text-[12px] text-[#636363]'>
                Erectile Dystunction, Premoture Ejaculation, Testicular` Pain
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ); 
}; */
