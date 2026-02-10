/**
 * Utility functions for HPR (Healthcare Professional Registration) percentage calculation
 */

/**
 * Check if Step 4 (Profile Completion) is complete
 * Uses multiple fields for backward compatibility and reliability:
 * - isProfileCompleted (database field - primary source of truth)
 * - isProfileComplete (legacy frontend field)
 * - hprRegistrationStatus === 'completed' (alternative indicator)
 * - about field (fallback inference if Steps 1-3 are complete)
 * 
 * @param {Object} doctor - Doctor object
 * @param {boolean} steps1to3Complete - Whether Steps 1-3 are complete
 * @returns {boolean} True if Step 4 is complete
 */
const isStep4Complete = (doctor, steps1to3Complete) => {
  if (!doctor) return false;
  
  // Helper function to check if a value is truthy and not empty
  const isNotEmpty = (value) => value !== null && value !== undefined && value !== '';
  
  // Priority 1: Database field (isProfileCompleted) - primary source of truth
  if (doctor.isProfileCompleted === true) {
    return true;
  }
  
  // Priority 2: Legacy frontend field (isProfileComplete) - for backward compatibility
  if (doctor.isProfileComplete === true) {
    return true;
  }
  
  // Priority 3: HPR registration status
  if (doctor.hprRegistrationStatus === 'completed') {
    return true;
  }
  
  // Priority 4: Fallback - infer completion if Steps 1-3 are done AND about field exists
  // This handles cases where backend doesn't return completion flags after login
  if (steps1to3Complete && isNotEmpty(doctor.about)) {
    return true;
  }
  
  return false;
};

/**
 * Get the current step of HPR registration based on doctor data
 * @param {Object} doctor - Doctor object from store
 * @returns {number} Current step (-1 to 3)
 */
export const getCurrentStep = (doctor) => {
  if (!doctor) return -1;

  // Helper function to check if a value is truthy and not empty
  const isNotEmpty = (value) => value !== null && value !== undefined && value !== '';
  
  // Debug logging
  console.log("=== getCurrentStep Debug ===");
  console.log("Doctor object:", doctor);
  console.log("personalDetails:", doctor.personalDetails);
  console.log("addressPerKyc:", doctor.addressPerKyc);
  console.log("registrationDetails:", doctor.registrationDetails);
  console.log("qualificationDetails:", doctor.qualificationDetails);
  console.log("currentWorkDetails:", doctor.currentWorkDetails);
  console.log("placeOfWork:", doctor.placeOfWork);

  const personalDetailsFields = {
    fullName: doctor.personalDetails?.fullName,
    title: doctor.personalDetails?.title,
    dob: doctor.personalDetails?.dob,
    // Check gender in multiple possible locations
    gender: doctor.personalDetails?.gender || doctor.gender,
    nationality: doctor.personalDetails?.nationality,
    language: doctor.personalDetails?.language,
  };

  const addressFields = {
    address: doctor.addressPerKyc?.address,
    pincode: doctor.addressPerKyc?.pincode,
    state: doctor.addressPerKyc?.state,
    district: doctor.addressPerKyc?.district,
    country: doctor.addressPerKyc?.country,
  };
  
  // Check each field individually for debugging
  // Note: Making gender optional as it might not always be present in the API response
  const step1Checks = {
    fullName: isNotEmpty(personalDetailsFields.fullName),
    title: isNotEmpty(personalDetailsFields.title),
    dob: isNotEmpty(personalDetailsFields.dob),
    gender: isNotEmpty(personalDetailsFields.gender), // Optional - might not be in response
    nationality: isNotEmpty(personalDetailsFields.nationality),
    language: isNotEmpty(personalDetailsFields.language),
    address: isNotEmpty(addressFields.address),
    pincode: isNotEmpty(addressFields.pincode),
    state: isNotEmpty(addressFields.state),
    district: isNotEmpty(addressFields.district),
    country: isNotEmpty(addressFields.country),
  };

  console.log("Step 1 field checks:", step1Checks);
  const missingFields = Object.keys(step1Checks).filter(key => !step1Checks[key]);
  // Remove gender from missing fields if other critical fields are present
  const criticalMissingFields = missingFields.filter(key => key !== 'gender');
  console.log("Missing fields:", missingFields);
  console.log("Critical missing fields (excluding gender):", criticalMissingFields);

  // Step 1 is complete if all fields except gender are present (gender is optional)
  const step1Complete = !!(
    step1Checks.fullName &&
    step1Checks.title &&
    step1Checks.dob &&
    // gender is optional - don't require it
    step1Checks.nationality &&
    step1Checks.language &&
    step1Checks.address &&
    step1Checks.pincode &&
    step1Checks.state &&
    step1Checks.district &&
    step1Checks.country
  );

  if (!step1Complete) {
    console.log("Step 1 not complete - returning -1 (0%)");
    console.log("Values checked:", {
      personalDetailsFields,
      addressFields
    });
    return -1;
  }
  console.log("Step 1 complete!");

  const registrationFields = {
    registerWithCouncil: doctor.registrationDetails?.registerWithCouncil,
    registrationNumber: doctor.registrationDetails?.registrationNumber,
    dateOfRegistration: doctor.registrationDetails?.dateOfRegistration,
    status: doctor.registrationDetails?.status,
    registrationCertificate: doctor.registrationDetails?.registrationCertificate,
  };

  const qualificationFields = {
    degreeName: doctor.qualificationDetails?.degreeName,
    college: doctor.qualificationDetails?.college,
    university: doctor.qualificationDetails?.university,
    passingMonth: doctor.qualificationDetails?.passingMonth,
    passingYear: doctor.qualificationDetails?.passingYear,
    country: doctor.qualificationDetails?.country,
    state: doctor.qualificationDetails?.state,
    countryOfQualification: doctor.qualificationDetails?.countryOfQualification,
    nameSameAsAadhar: doctor.qualificationDetails?.nameSameAsAadhar,
    degreeUrl: doctor.qualificationDetails?.degreeUrl,
  };

  // Check Step 2 fields individually
  const step2Checks = {
    registerWithCouncil: isNotEmpty(registrationFields.registerWithCouncil),
    registrationNumber: isNotEmpty(registrationFields.registrationNumber),
    dateOfRegistration: isNotEmpty(registrationFields.dateOfRegistration),
    status: isNotEmpty(registrationFields.status),
    registrationCertificate: isNotEmpty(registrationFields.registrationCertificate),
    degreeName: isNotEmpty(qualificationFields.degreeName),
    college: isNotEmpty(qualificationFields.college),
    university: isNotEmpty(qualificationFields.university),
    passingMonth: isNotEmpty(qualificationFields.passingMonth),
    passingYear: isNotEmpty(qualificationFields.passingYear),
    country: isNotEmpty(qualificationFields.country),
    state: isNotEmpty(qualificationFields.state),
    countryOfQualification: isNotEmpty(qualificationFields.countryOfQualification),
    degreeUrl: isNotEmpty(qualificationFields.degreeUrl),
  };

  console.log("Step 2 field checks:", step2Checks);
  console.log("Step 2 registration fields:", registrationFields);
  console.log("Step 2 qualification fields:", qualificationFields);

  const step2Complete = !!(
    step2Checks.registerWithCouncil &&
    step2Checks.registrationNumber &&
    step2Checks.dateOfRegistration &&
    step2Checks.status &&
    step2Checks.registrationCertificate &&
    step2Checks.degreeName &&
    step2Checks.college &&
    step2Checks.university &&
    step2Checks.passingMonth &&
    step2Checks.passingYear &&
    step2Checks.country &&
    step2Checks.state &&
    step2Checks.countryOfQualification &&
    step2Checks.degreeUrl
  );

  if (!step2Complete) {
    const missingStep2Fields = Object.keys(step2Checks).filter(key => !step2Checks[key]);
    console.log("Step 2 not complete - missing fields:", missingStep2Fields);
    console.log("Step 2 not complete - returning 0 (25%)");
    return 0;
  }
  console.log("Step 2 complete!");

  const workFields = {
    currentlyWorking: doctor.currentWorkDetails?.currentlyWorking,
    natureOfWork: doctor.currentWorkDetails?.natureOfWork,
    workStatus: doctor.currentWorkDetails?.workStatus,
    // Check experience in multiple possible locations
    experience: doctor.currentWorkDetails?.experience || doctor.experience || doctor.yearsOfExperience || doctor.currentWorkDetails?.yearsOfExperience,
  };

  const placeOfWorkFields = {
    facilityId: doctor.placeOfWork?.facilityId,
    facilityName: doctor.placeOfWork?.facilityName,
    state: doctor.placeOfWork?.state,
    district: doctor.placeOfWork?.district,
  };

  // Check Step 3 fields individually
  const step3Checks = {
    currentlyWorking: isNotEmpty(workFields.currentlyWorking),
    natureOfWork: isNotEmpty(workFields.natureOfWork),
    workStatus: isNotEmpty(workFields.workStatus),
    experience: isNotEmpty(workFields.experience),
    facilityId: isNotEmpty(placeOfWorkFields.facilityId),
    facilityName: isNotEmpty(placeOfWorkFields.facilityName),
    state: isNotEmpty(placeOfWorkFields.state),
    district: isNotEmpty(placeOfWorkFields.district),
  };

  console.log("Step 3 field checks:", step3Checks);
  console.log("Step 3 work fields:", workFields);
  console.log("Step 3 place of work fields:", placeOfWorkFields);

  const step3Complete = !!(
    step3Checks.currentlyWorking &&
    step3Checks.natureOfWork &&
    step3Checks.workStatus &&
    step3Checks.experience &&
    (step3Checks.facilityId || 
     (step3Checks.facilityName && 
      step3Checks.state && 
      step3Checks.district))
  );

  if (!step3Complete) {
    const missingStep3Fields = Object.keys(step3Checks).filter(key => {
      if (key === 'facilityId' || key === 'facilityName' || key === 'state' || key === 'district') {
        // These are part of an OR condition, so check separately
        return false;
      }
      return !step3Checks[key];
    });
    console.log("Step 3 not complete - missing fields:", missingStep3Fields);
    console.log("Step 3 not complete - returning 1 (50%)");
    return 1;
  }
  console.log("Step 3 complete!");

  // Use centralized Step 4 completion check
  const step4Complete = isStep4Complete(doctor, step3Complete);

  if (!step4Complete) {
    console.log("Step 4 not complete - returning 2 (75%)");
    console.log("Step 4 check - isProfileCompleted:", doctor.isProfileCompleted, "isProfileComplete:", doctor.isProfileComplete, "hprStatus:", doctor.hprRegistrationStatus, "about:", !!doctor.about);
    return 2;
  }
  console.log("Step 4 complete - returning 3 (100%)");
  return 3; 
};

/**
 * Get the progress percentage based on the current step
 * @param {number} step - Current step (-1 to 3)
 * @returns {number} Percentage (0 to 100)
 */
export const getProgressPercentage = (step) => {
  if (step >= 3) return 100; 
  if (step >= 2) return 75;  
  if (step >= 1) return 50;   
  if (step >= 0) return 25;   
  return 0;                   
};

/**
 * Get the complete HPR registration percentage for a doctor
 * @param {Object} doctor - Doctor object from store
 * @returns {number} Percentage (0 to 100)
 */
export const getHprRegistrationPercentage = (doctor) => {
  const currentStep = getCurrentStep(doctor);
  return getProgressPercentage(currentStep);
};
