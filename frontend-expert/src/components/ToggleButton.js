import React, { useState } from "react";

const ToggleButton = () => {
  // State to manage the toggle status
  const [isToggled, setIsToggled] = useState(false);

  // Function to toggle the state
  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`rounded-md p-2 transition-colors ${
          isToggled ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
        }`}
      >
        {isToggled ? "On" : "Off"}
      </button>
    </div>
  );
};

export default ToggleButton;
