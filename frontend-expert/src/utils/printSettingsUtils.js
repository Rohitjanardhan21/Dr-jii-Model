export const defaultPrintSettings = {
  sections: {
    vitals: true,
    symptoms: true,
    diagnosis: true,
    diagnosisTests: true,
    medications: true,
    notes: true,
    advice: true,
    followUp: true,
    treatment: true,
  },

  patientForm: {
    enabled: true,
    age: true,
    mobileNumber: true,
    gender: true,
    uhid: true,
    patientAddress: true,
    city: true,
    pincode: true,
    mailId: true,
  },

  medications: {
    enabled: true,
    genericName: true,
    productType: true,
    brandName: true,
    composition: true,
    dosage: true,
    frequency: true,
    timing: true,
    duration: true,
    route: true,
  },

  diagnosis: {
    enabled: true,
    properties: true,
    hidePropertyHeaders: false,
  },

  symptoms: {
    enabled: true,
    properties: true,
    hidePropertyHeaders: false,
  },

  examinations: {
    enabled: true,
  },

  customSection: {
    enabled: true,
  },
};

export const loadPrintSettings = () => {
  try {
    const saved = localStorage.getItem('printSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultPrintSettings, ...parsed };
    }
  } catch (error) {
    console.error('Error loading print settings:', error);
  }
  return defaultPrintSettings;
};

export const savePrintSettings = (settings) => {
  try {
    localStorage.setItem('printSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving print settings:', error);
    return false;
  }
};

export const applyPrintSettingsToDOM = (clone, settings) => {
  if (!settings.sections.vitals) {
    const section = clone.querySelector('[data-section="vitals"]');
    if (section) section.remove();
  }

  if (!settings.sections.symptoms) {
    const section = clone.querySelector('[data-section="symptoms"]');
    if (section) section.remove();
  }

  if (!settings.sections.diagnosis) {
    const section = clone.querySelector('[data-section="diagnosis"]');
    if (section) section.remove();
  }

  if (!settings.sections.diagnosisTests) {
    const section = clone.querySelector('[data-section="diagnosisTests"]');
    if (section) section.remove();
  }

  if (!settings.sections.medications) {
    const section = clone.querySelector('[data-section="medications"]');
    if (section) section.remove();
  } else {
    const medSection = clone.querySelector('[data-section="medications"]');
    if (medSection && settings.medications) {
      if (!settings.medications.route) {
        medSection.querySelectorAll('[data-medication-field="route"]').forEach(el => el.remove());
      }
      if (!settings.medications.composition) {
        medSection.querySelectorAll('[data-medication-field="composition"]').forEach(el => el.remove());
      }
      if (!settings.medications.frequency) {
        medSection.querySelectorAll('[data-medication-field="frequency"]').forEach(el => el.remove());
      }
      if (!settings.medications.timing) {
        medSection.querySelectorAll('[data-medication-field="timing"]').forEach(el => el.remove());
      }
      if (!settings.medications.duration) {
        medSection.querySelectorAll('[data-medication-field="duration"]').forEach(el => el.remove());
      }
      if (!settings.medications.genericName) {
        medSection.querySelectorAll('[data-medication-field="genericName"]').forEach(el => el.remove());
      }
    }
  }

  if (!settings.sections.notes) {
    const section = clone.querySelector('[data-section="notes"]');
    if (section) section.remove();
  }

  if (!settings.sections.advice) {
    const section = clone.querySelector('[data-section="advice"]');
    if (section) section.remove();
  }

  if (!settings.sections.followUp) {
    const section = clone.querySelector('[data-section="followUp"]');
    if (section) section.remove();
  }

  if (!settings.sections.treatment) {
    const section = clone.querySelector('[data-section="treatment"]');
    if (section) section.remove();
  }

  if (settings.patientForm) {
    const patientSection = clone.querySelector('[data-section="patientDetails"]');
    if (patientSection) {
      if (!settings.patientForm.enabled) {
        // If entire form is disabled, remove the whole section or all details? 
        // Usually means remove the whole section, but let's just assume we want to process individual fields if the config object exists.
        // Actually, if settings.patientForm.enabled is false, usually we hide everything. 
        // But the previous logic was: if (settings.patientForm && !settings.patientForm.enabled) -> process individual fields? That was definitely wrong.
        // Let's assume if enabled is explicitly false, we hide the whole section? 
        // No, let's look at defaultPrintSettings. enabled: true.
        // If the user unchecks "Patient Details" (the main toggle), then settings.patientForm.enabled becomes false.
        // If that's the case, we should remove the whole section.
      }

      if (settings.patientForm.enabled === false) {
        patientSection.remove();
      } else {
        // Process individual fields
        if (!settings.patientForm.age) {
          patientSection.querySelectorAll('[data-patient-field="age"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.mobileNumber) {
          patientSection.querySelectorAll('[data-patient-field="mobileNumber"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.gender) {
          patientSection.querySelectorAll('[data-patient-field="gender"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.uhid) {
          patientSection.querySelectorAll('[data-patient-field="uhid"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.patientAddress) {
          patientSection.querySelectorAll('[data-patient-field="address"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.city) {
          patientSection.querySelectorAll('[data-patient-field="city"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.pincode) {
          patientSection.querySelectorAll('[data-patient-field="pincode"]').forEach(el => el.remove());
        }
        if (!settings.patientForm.mailId) {
          patientSection.querySelectorAll('[data-patient-field="mailId"]').forEach(el => el.remove());
        }
        // Added logic for biometrics (Height/Weight) if you have a setting for it.
        // Since defaultPrintSettings doesn't have 'biometrics' or 'height'/'weight' explicitly defined in the snippet I saw earlier, 
        // I will assume for now 'age' was the user's specific complaint. 
        // If 'biometrics' was intended to be toggleable, it should be added to defaultPrintSettings.
        // For now, I'll stick to fixing the Age issue as requested.
      }
    }
  }

  const checkboxes = clone.querySelectorAll('.print-checkbox-container');
  checkboxes.forEach((checkbox) => checkbox.remove());

  return clone;
};
