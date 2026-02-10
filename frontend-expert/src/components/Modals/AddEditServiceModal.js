import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { Button, Input, Switchi, Textarea } from "../Form";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";

function AddEditServiceModal({ closeModal, isOpen, datas, onServiceUpdated }) {
  const [serviceName, setServiceName] = useState("Consultant");
  const [price, setPrice] = useState(500);
  const [description, setDescription] = useState("");
  const [check, setCheck] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = datas && (datas._id || datas.id);
  const isDefaultService = datas && datas.isDefault;

  useEffect(() => {
    if (isEditing && datas && (datas._id || datas.id)) {
      setServiceName(datas.serviceName || datas.name || "");
      setPrice(datas.price || 0);
      setDescription(datas.description || "");
      setCheck(!datas.isDisabled);
    } else {
      // Reset to defaults for new service
      setServiceName("Consultant");
      setPrice(500);
      setDescription("");
      setCheck(false);
    }
  }, [datas, isEditing]);

  // Additional effect to ensure defaults are set when modal opens for new service
  useEffect(() => {
    if (isOpen && !isEditing) {
      setServiceName("Consultant");
      setPrice(500);
      setDescription("");
      setCheck(false);
    }
  }, [isOpen, isEditing]);

  const handleSave = async () => {
    if (!serviceName || price <= 0) {
      toast.error("Please fill all required fields correctly.");
      console.warn("Validation failed:", { serviceName, price });
      return;
    }

    setLoading(true);

    try {
      const serviceData = {
        serviceName,
        price,
        description,
        isDisabled: !check,
      };

      console.log("Prepared serviceData:", serviceData);

      let response;
      let endpoint;

      // Special handling for default service - convert it to real service first
      if (isEditing && isDefaultService) {
        // First, create the service in the database
        const createEndpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services/create`;
        console.log("Converting default service to real service...");
        
        const createResponse = await fetch(createEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(serviceData),
        });

        if (createResponse.ok) {
          const createdService = await createResponse.json();
          toast.success("Service added successfully!");
          closeModal();
          if (onServiceUpdated) onServiceUpdated();
          return;
        } else {
          const errorResult = await createResponse.text();
          const errorMessage = "Failed to save service.";
          toast.error(errorMessage);
          return;
        }
      } else if (isEditing) {
        // Normal edit for existing real service
        const serviceId = datas._id || datas.id;
        endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services/edit/${serviceId}`;
        console.log("Sending PUT request to:", endpoint);

        response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(serviceData),
        });
      } else {
        // Create new service
        endpoint = `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services/create`;
        console.log("Sending POST request to:", endpoint);

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(serviceData),
        });
      }

      // Handle response for normal edit/create
      if (response) {
      console.log("Raw response status:", response.status);
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      const result = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      console.log("Parsed response:", result);

      if (response.ok) {
        toast.success(
          isEditing
            ? "Service updated successfully!"
            : "Service created successfully!"
        );
        closeModal();
        if (onServiceUpdated) onServiceUpdated();
      } else {
        const errorMessage =
          typeof result === "object" && result.message
            ? result.message
            : "Failed to save service.";
        toast.error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={isEditing ? (isDefaultService ? "Default Service " : "Service") : "New Service"}
      width={"max-w-3xl"}
    >
      <div className='flex-colo gap-4'>
        {isDefaultService && (
          <div className='w-full rounded-lg bg-blue-50 p-3 text-sm text-blue-700'>
            <p>⚠️ This is a default service. Click on Save to add this service.</p>
          </div>
        )}
        
        <Input
          label='Service Name'
          color={true}
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder='Enter service name'
        />

        <Input
          label='Price (Tsh)'
          type='number'
          color={true}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder='Enter price'
        />

        <Textarea
          label='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Write description here...'
          color={true}
          rows={4}
        />

        <div className='flex w-full items-center gap-2'>
          <Switchi
            label='Status'
            checked={check}
            onChange={() => setCheck(!check)}
          />
          <p className={`text-sm ${check ? "text-subMain" : "text-textGray"}`}>
            {check ? "Enabled" : "Disabled"}
          </p>
        </div>

        <div className='grid w-full gap-3 sm:grid-cols-2'>
          <button
            onClick={closeModal}
            disabled={loading}
            className='rounded-lg bg-red-600 bg-opacity-5 px-3 py-2 text-sm font-light text-red-600 disabled:opacity-50'
          >
            {isEditing ? "Discard" : "Cancel"}
          </button>
          <Button
            label={loading ? "Saving..." :  "Save"}
            Icon={HiOutlineCheckCircle}
            onClick={handleSave}
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddEditServiceModal;
