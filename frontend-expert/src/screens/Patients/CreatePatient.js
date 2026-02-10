import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";

import { toast } from "react-hot-toast";

import PersonalInfo from "../../components/UsedComp/PersonalInfo";

function CreatePatient({ closeModal, onSuccess }) {

    return (
      <div className="">
        {/* Back button and Add Patient heading */} 
        <div
          data-aos='fade-up'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
          className=' bg-white px-6'
        >
          <PersonalInfo 
            titles={true} 
            isModal={true}
            onSave={async (patientData) => {
              try {
                // API call to crete patient
                const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients/create`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify(patientData),
                });

                const result = await response.json();
                if (response.ok) {
                  
                  toast.success(result.message || "Patient created successfully!");
                  
                  if (onSuccess) {
                    onSuccess(result.data || patientData);
                  }
                } else {
                  
                  toast.error(result?.message || "Failed to create patient");
                }
              } catch (error) {
                console.error(error);
                
                toast.error("Something went wrong. Please try again.");
              }
            }}
            closeModal={closeModal}
          />
        </div>
      </div>
    );
  


}

export default CreatePatient;
