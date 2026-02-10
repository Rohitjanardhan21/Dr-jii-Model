import { useLocation } from "react-router-dom";
import { BiPlus } from "react-icons/bi";

function ActionButton() {
  const location = useLocation();
  const pathname = location.pathname;

  // Define action buttons for each page
  const actionMap = {
    // "/dashboard": { label: "Quick Action", icon: BiPlus, event: "action:dashboard" },
    "/patients": { label: "Add Patient", icon: BiPlus, event: "action:addPatient" },
    "/appointments": { label: "New Appointment", icon: BiPlus, event: "action:addAppointment" },
    "/payments": { label: "Add Payment", icon: BiPlus, event: "action:addPayment" },
    "/services": { label: "Add Service", icon: BiPlus, event: "action:addService" },
    "/invoices": { label: "Create Invoice", icon: BiPlus, event: "action:createInvoice" },
    "/medicine": { label: "Add Medicine", icon: BiPlus, event: "action:addMedicine" },
    "/facility": { label: "Add Facility", icon: BiPlus, event: "action:addFacility" },
    "/receptions": { label: "Add Reception", icon: BiPlus, event: "action:addReception" },
    "/campaigns": { label: "New Campaign", icon: BiPlus, event: "action:newCampaign" },
  };

  // Get the action for the current page
  const currentAction = Object.entries(actionMap).find(([path]) => 
    pathname.startsWith(path)
  )?.[1];

  const handleClick = () => {
    if (currentAction) {
      // Dispatch custom event that screens can listen for
      window.dispatchEvent(new CustomEvent(currentAction.event));
    }
  };

  if (!currentAction) return null;

  const Icon = currentAction.icon;

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0095D9] to-[#0078B3] text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      title={currentAction.label}
    >
      <Icon className="text-lg" />
      <span className="hidden sm:inline text-sm">{currentAction.label}</span>
    </button>
  );
}

export default ActionButton;
