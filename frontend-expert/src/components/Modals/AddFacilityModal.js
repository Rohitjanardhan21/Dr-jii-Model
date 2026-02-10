import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button, Input, Select } from "../Form";
import { BiChevronDown } from "react-icons/bi";
import { facilityData, sortsDatas } from "../Datas";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";
import Access from "../Access";
import Uploader from "../Uploader";

function AddFacilityModal({ closeModal, isOpen, doctor, datas }) {
  const [instraction, setInstraction] = useState(facilityData.type[0]);
  const [instraction2, setInstraction2] = useState(facilityData.invitation[0]);
  const [access, setAccess] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    emailId: "",
    mobileNumber: "",
    businessName: "",
    businessTitle: "",
    facilityId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("instruction2:", instraction2);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    // Validation
    if (!formData.emailId || !formData.mobileNumber) {
      toast.error("Please fill in email and mobile number");
      return;
    }

    if (instraction2.name === "Partnership" && !formData.facilityId) {
      toast.error("Please fill in facility ID for partnership");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        fullName: formData.fullName || formData.businessName || formData.emailId.split("@")[0],
        emailId: formData.emailId.trim(),
        mobileNumber: Number(formData.mobileNumber),
        businessName: formData.businessName || formData.emailId.split("@")[0],
        businessTitle: instraction.name || "",
      };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/facility/facilityProfile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      const json = await response.json();

      if (response.ok && json.message) {
        toast.success(json.message || "Facility invited successfully");
        setFormData({
          fullName: "",
          emailId: "",
          mobileNumber: "",
          businessName: "",
          businessTitle: "",
          facilityId: "",
        });
        closeModal();
      } else {
        toast.error(json.message || "Failed to invite facility");
      }
    } catch (error) {
      console.error("Error inviting facility:", error);
      toast.error("Failed to invite facility. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title='Add Facility'
      width={"max-w-3xl"}
    >
      <div className='mb-6 mt-8 flex h-[45px] w-[70%] flex-row items-center justify-center rounded-[5px] bg-[#F8F9FA] p-1'>
        <img
          src={require("../../Assets/images/search.png")}
          className='ml-2 mr-2 h-[16px] w-[16px] text-[#CDCED0]'
        />
        <input
          className='w-full bg-[#F8F9FA] text-start text-[14px]'
          type='text'
          placeholder='Search'
        />
      </div>
      <div className='mb-4 grid w-full gap-4 sm:grid-cols-2'>
        <div className='flex w-full flex-col gap-3'>
          <p className='text-sm text-black'>Invitation for</p>
          <Select
            selectedPerson={instraction2}
            setSelectedPerson={setInstraction2}
            datas={facilityData.invitation}
          >
            <div className='flex-btn w-full rounded-lg border border-border p-4 text-sm font-light text-textGray focus:border focus:border-subMain'>
              {instraction2.name} <BiChevronDown className='text-xl' />
            </div>
          </Select>
        </div>
        <div className='flex w-full flex-col gap-3'>
          <p className='text-sm text-black'>Facility type</p>
          <Select
            selectedPerson={instraction}
            setSelectedPerson={setInstraction}
            datas={facilityData.type}
          >
            <div className='flex-btn w-full rounded-lg border border-border p-4 text-sm font-light text-textGray focus:border focus:border-subMain'>
              {instraction.name} <BiChevronDown className='text-xl' />
            </div>
          </Select>
        </div>
      </div>
      <div className='flex-colo gap-6'>
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input
            label='Full Name'
            color={true}
            placeholder='Enter full name'
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
          />
          <Input
            label='Business Name'
            color={true}
            placeholder='Enter business name'
            value={formData.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
          />
        </div>

        {instraction2.name == "Partnership" && (
          <div className='grid w-full gap-4 sm:grid-cols-2'>
            <Input
              label='Facility ID'
              color={true}
              placeholder="Enter facility ID"
              value={formData.facilityId}
              onChange={(e) => handleInputChange("facilityId", e.target.value)}
            />
          </div>
        )}

        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <Input
            label='Mobile number'
            placeholder='Enter mobile no.'
            color={true}
            type="tel"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            required
          />
          <Input
            label='Email'
            placeholder='Enter your Email'
            color={true}
            type="email"
            value={formData.emailId}
            onChange={(e) => handleInputChange("emailId", e.target.value)}
            required
          />
        </div>

        {/* buttones */}
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <button
            onClick={closeModal}
            className='rounded-lg bg-[#B8B8B8] p-4 text-sm font-light text-[white]'
          >
            Cancel
          </button>
          <Button
            label={isSubmitting ? "Inviting..." : "Invite"}
            onClick={onSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddFacilityModal;
