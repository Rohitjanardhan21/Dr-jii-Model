import React from "react";
import { sortsDatas } from "../../components/Datas";
import { Button, Select } from "../../components/Form";
import { BiChevronDown } from "react-icons/bi";
import { toast } from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function HealthInfomation() {
  const [loading, setLoading] = React.useState(true);
  const [bloodType, setBloodType] = React.useState(sortsDatas.bloodTypeFilter[0]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-subMain" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-3xl mx-auto bg-white rounded-md">
      <div className="flex flex-col gap-4">
        {/* Blood Group */}
        <div className="max-w-md w-full">
          <label className="text-md font-semibold text-black mb-1 block">
            Blood Group
          </label>
         <div className="pt-3 text-md font-semibold text-gray mb-1 block">
          <Select
            selectedPerson={bloodType}
            setSelectedPerson={setBloodType}
            datas={sortsDatas.bloodTypeFilter}
          >
            <div className="flex items-center justify-between rounded-md border border-gray-300 p-3 text-sm text-gray-400">
              {bloodType?.name} <BiChevronDown className="text-lg" />
            </div>
          </Select>
        </div>

        </div>

        {/* Input fields with uniform height */}
        {[
          { label: "Weight (kg)", placeholder: "60 kg" },
          { label: "Height (ft)", placeholder: "5.5 ft" },
          { label: "Pulse (heart beat/min)", placeholder: "Reading" },
          { label: "Temperature (°F)", placeholder: "Reading" },
        ].map((field, index) => (
          <div key={index} className="max-w-md w-full">
            <label className="text-md font-semibold text-black mb-1 block">
              {field.label}
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md p-3 text-sm"
            />
          </div>
        ))}

        {/* Blood Pressure */}
        <div className="max-w-md w-full">
          <label className="text-md font-semibold text-black mb-1 block">
            Blood Pressure (mmHg)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Systolic"
              className="w-full border border-gray-300 rounded-md p-3 text-sm"
            />
            <span className="self-center">/</span>
            <input
              type="text"
              placeholder="Diastolic"
              className="w-full border border-gray-300 rounded-md p-3 text-sm"
            />
          </div>
        </div>

        {/* Textareas with same height style */}
        {[
          { label: "Allergies", placeholder: "beans, nuts, etc." },
          { label: "Habits", placeholder: "Smoking, Drinking, etc." },
          { label: "Medical History", placeholder: "Diabetes, Malaria" },
        ].map((field, index) => (
          <div key={index} className="max-w-md w-full">
            <label className="text-md font-semibold text-black mb-1 block">
              {field.label}
            </label>
            <textarea
              rows={2}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none"
            />
          </div>
        ))}

        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <div className="w-[320px]">
            <Button
              label="Save Changes"
              className="w-full py-1 text-sm" 
              onClick={() => toast.error("This feature is not available yet")}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default HealthInfomation;
