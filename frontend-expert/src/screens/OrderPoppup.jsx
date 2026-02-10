import React from "react";
import { useNavigate } from "react-router-dom";

const OrderPopup = ({ order, onClose }) => {
  const navigate = useNavigate();
  if (!order) return null;
    console.log("Order Details:", order);
  const goToOrderDetails = (orderId, order) => {
    navigate(`/orders/${orderId}`, { state: { order } });   
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-30 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white w-[95%] md:w-[850px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg px-8 py-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <button
          className="absolute top-3 left-4 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          ✕
        </button>
                    
                  </div>
                  {(
                    <button
                       onClick={() => goToOrderDetails(order.id, order)}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      View Order Details
                    </button>
                  )}
                </div>
        {/* Close Button */}
       

        {/* Heading */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Order Details
        </h2>
      

        {/* Patient Info Section */}
        <div className="border rounded-md p-6 flex flex-col items-center text-center mb-6 bg-gray-50">
          <img
            src={order.patient.avatar}
            alt={order.patient.name}
            className="w-24 h-24 rounded-full mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-900">{order.patient.name}</h3>
          <p className="text-sm text-gray-500">{order.address}</p>
        </div>

        {/* Medications */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Medications</h3>
          {order.medications.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
              {order.medications.map((med, idx) => (
                <li key={idx}>
                  {med.name} - ₹{med.price || 0}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No medications</p>
          )}
        </div>

        {/* Diagnosis */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Diagnosis</h3>
          {order.diagnosis.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
              {order.diagnosis.map((diag, idx) => (
                <li key={idx}>
                  {diag.name} - ₹{diag.price || 0}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No diagnosis</p>
          )}
        </div>

        {/* Total Bill */}
        <div className="text-right font-semibold text-lg text-gray-900 border-t pt-4 mb-4">
          Total: ₹{order.bill.mrp}.00
        </div>

        {/* View Details Button */}
        <div className="text-right">
          
        </div>
      </div>
    </div>
  );
};

export default OrderPopup;
