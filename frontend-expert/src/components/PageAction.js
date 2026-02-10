import { BiPlus } from "react-icons/bi";
import { useLocation } from "react-router-dom";

function PageAction({ onActionClick }) {
  const location = useLocation();

  // Map page paths to action labels
  const actionLabelMap = {
    "/patients": "Add Patient",
    "/appointments": "New Appointment",
    "/payments": "Add Payment",
    "/services": "Add Service",
  };

  const actionLabel = actionLabelMap[location.pathname];

  if (!actionLabel) return null;

  return (
    <button
      onClick={onActionClick}
      className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0095D9] to-[#0078B3] text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200'
      title={actionLabel}
    >
      <BiPlus className='text-lg' />
      <span className='text-sm'>{actionLabel}</span>
    </button>
  );
}

export default PageAction;
