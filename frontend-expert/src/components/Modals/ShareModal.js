import React, { useState } from "react";
import Modal from "./Modal";
import { shareData } from "../Datas";
import { RadioGroup } from "@headlessui/react";
import { Button } from "../Form";
import { toast } from "react-hot-toast";

function ShareModal({
  closeModal,
  isOpen,
  file,
  patient,
  id,
  isPrescription = false,
  isAppointment = false,
}) {
  const [selected, setSelected] = useState();

  const handleSend = async () => {
    if (!file) {
      toast.error("No PDF available to share");
      return;
    }

    if (!selected) {
      toast.error("Please select an option");
      return;
    }
    if (
      selected.title.toLowerCase() === "telegram" ||
      selected.title.toLowerCase() === "whatsapp"
    ) {
      toast.error("Feature not Available yet");
      return;
    }
    if (
      selected.title.toLowerCase() === "email" &&
      !patient?.contactDetails?.email
    ) {
      toast.error("Patient email not available");
      return;
    }

    if (
      selected.title.toLowerCase() === "message" &&
      !(
        patient?.contactDetails?.primaryContact ||
        patient?.contactDetails?.secondaryContact
      )
    ) {
      toast.error("Patient contact number not available");
      return;
    }

    try {
      // Create appropriate file based on type
      let fileName, fileType;
      if (isAppointment) {
        fileName = "appointment.pdf";
        fileType = "application/pdf";
      } else if (isPrescription) {
        fileName = "prescription.pdf";
        fileType = "application/pdf";
      } else {
        fileName = "invoice.pdf";
        fileType = "application/pdf";
      }

      const pdfFile = new File([file], fileName, {
        type: fileType,
      });

      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("name", patient?.fullName || "");
      formData.append("email", patient?.contactDetails?.email || "");
      formData.append("id", id || "");
      
      const contactNumber = patient?.contactDetails?.primaryContact ||
                            patient?.contactDetails?.secondaryContact ||
                            patient?.contactDetails?.landline ||
                            "";
      
      formData.append("contact", contactNumber);

      console.log("Share data being sent:", {
        name: patient?.fullName || "",
        email: patient?.contactDetails?.email || "",
        contact: contactNumber,
        id: id || "",
        patientContactDetails: patient?.contactDetails
      });
      
      console.log("Share data:", {
        fileName,
        fileType,
        patient: patient?.fullName,
        email: patient?.contactDetails?.email,
        contact: patient?.contactDetails?.primaryContact || patient?.contactDetails?.secondaryContact,
        contactDetails: patient?.contactDetails,
        id,
        isAppointment,
        isPrescription
      });

      let endpoint;
      if (isPrescription) {
        endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-prescription/${selected.title.toLowerCase()}`;
      } else if (isAppointment) {
        endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-appointment/${selected.title.toLowerCase()}`;
      } else {
        endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-invoice/${selected.title.toLowerCase()}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData, // no Content-Type needed
      });

      const data = await res.json();
      
      console.log("Backend response:", data);

      if (data.success) {
        let itemType = "Invoice";
        if (isPrescription) itemType = "Prescription";
        if (isAppointment) itemType = "Appointment";
        
        toast.success(
          `${itemType} sent via ${selected.title}`
        );
        closeModal();
      } else {
        let itemType = "invoice";
        if (isPrescription) itemType = "prescription";
        if (isAppointment) itemType = "appointment";
        
        toast.error(
          data.message ||
            `Failed to send ${itemType}`
        );
      }
    } catch (err) {
      console.error("Send error:", err);
      let itemType = "invoice";
      if (isPrescription) itemType = "prescription";
      if (isAppointment) itemType = "appointment";
      
      toast.error(
        `Something went wrong while sending ${itemType}`
      );
    }
  };

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title='Share with patient via'
      width={"max-w-xl"}
    >
      <div className='flex-colo gap-6'>
        {/* data */}
        <div className='w-full'>
          <RadioGroup value={selected} onChange={setSelected}>
            <div className='space-y-2'>
              {shareData.map((user) => (
                <RadioGroup.Option
                  key={user.id}
                  value={user}
                  className={({ active, checked }) =>
                    ` ${active ? "border-subMain bg-subMain text-white" : ""} group rounded-xl border-[1px] border-border p-4 hover:bg-subMain hover:text-white`
                  }
                >
                  {({ active, checked }) => (
                    <div className='flex items-center gap-6'>
                      <div className='flex-colo h-12 w-12 rounded-full bg-text'>
                        <user.icon className='text-xl text-subMain' />
                      </div>
                      <div>
                        <h6 className='text-sm'>{user.title}</h6>
                        <p
                          className={`${
                            active && "text-white"
                          } mt-1 text-xs text-textGray group-hover:text-white`}
                        >
                          {user.description}
                        </p>
                      </div>
                    </div>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>
        {/* button */}

        <Button
          onClick={handleSend}
          // onClick={() => {
          //   toast.error("This feature is not available yet");
          //   closeModal();
          // }}
          label='Send'
        />
      </div>
    </Modal>
  );
}

export default ShareModal;
