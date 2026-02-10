import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";

function PatientPopupPage({ isOpen, setIsOpen, patient }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!patient) return;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [patient]);

  if (!patient) return null;

  const {
    _id,
    title,
    email,
    phone,
    gender,
    blood,
    date,
    createdAt,
    image,
    age,
  } = patient;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white w-[95%] md:w-[850px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg px-8 py-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 border rounded-md hover:bg-gray-100"
            >
              <IoArrowBackOutline size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {title || "Patient Info"}
            </h2>
          </div>
          {_id && (
            <button
              onClick={() => navigate(`/patients/preview/${_id}`)}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              View Full Profile
            </button>
          )}
        </div>

        {/* Profile Box */}
        <div className="border rounded-md p-6 flex flex-col items-center text-center mb-6">
          <img
            src={image}
            alt={title}
            className="w-24 h-24 rounded-full mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{email}</p>
          <p className="text-sm text-gray-700">{phone}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
          <InfoItem label="Gender" value={gender} />
          <InfoItem label="Blood Group" value={blood} />
          <InfoItem label="Age" value={age} />
          <InfoItem label="Registered Date" value={date} />
          <InfoItem
            label="Created At"
            value={new Date(createdAt).toLocaleString()}
          />
          <InfoItem label="Patient ID" value={_id} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-black">{value || "N/A"}</p>
    </div>
  );
}

export default PatientPopupPage;
