/**
 * Normalizes profile update payload to match backend API contract
 * Ensures consistent data structure regardless of frontend form state
 * 
 * @param {Object} formData - The form data object
 * @param {boolean} hasImageFile - Whether the request includes an image file
 * @returns {Object|FormData} - Normalized payload matching backend expectations
 */
export const normalizeProfilePayload = (formData, hasImageFile = false) => {
  if (hasImageFile && formData instanceof FormData) {
    // For FormData with image, ensure all fields are properly appended
    // The backend expects specific field names
    return formData; // FormData is already in the correct format
  }

  // For JSON payloads, ensure nested structure matches backend expectations
  return {
    // Update personalDetails
    personalDetails: {
      fullName: formData.fullName || formData.displayName || ''
    },
    // Update systemOfMedicine
    systemOfMedicine: {
      systemOfMedicine: formData.specialization || formData.systemOfMedicine || ''
    },
    // Update qualificationDetails
    qualificationDetails: {
      degreeName: formData.degree || formData.education || formData.degreeName || ''
    },
    // Update placeOfWork
    placeOfWork: {
      facilityName: formData.clinicDetails || formData.facilityName || ''
    },
    // Update flat fields
    about: formData.about || '',
    currentWorkDetails: {
      workStatus: formData.experience || formData.workStatus || '',
      natureOfWork: formData.natureOfWork || ''
    },
    mobile: formData.mobile || formData.mobileNumber || ''
  };
};

