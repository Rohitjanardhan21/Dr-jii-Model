import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiEye } from "react-icons/fi";
import Modal from "../../components/Modals/Modal";
import CreateInvoice from "../../screens/Invoices/CreateInvoice"; 

function PaymentsUsed({patientName}) {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invoiceChanged, setInvoiceChanged] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patient/payments/${patientId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPayments();
    }
  }, [patientId,invoiceChanged]);

  const handleEventClick = (id) => {
    navigate(`/payments/preview/${id}`);
  };

  const handleCloseInvoiceModal = () => {
  setIsCreateInvoiceOpen(false);
};


  const exportToCSV = () => {
    const headers = ["patient Name","Start Date", "Services", "Amount", "Status", "Method"];
    const rows = data.map(({ amount, startDate, method, status, services }) => [
      patientName,
      new Date(startDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      services
        ?.map((s) => s.serviceId?.serviceName || "Unknown")
        .join(" | "),
      `${amount}`,
      status,
      method,
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => (csvContent += row.join(",") + "\n"));

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-subMain" />
      </div>
    );
  }

  return (
  <div className="p-6 w-full space-y-1 text-xs">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-xl font-medium">Payments</h3>
    </div>

    <div className="flex items-center gap-2">
      {/* <button
        onClick={exportToCSV}
        className="px-4 py-2 border border-blue-600 text-[14px] text-[#007bb5] rounded hover:bg-blue-50 whitespace-nowrap"
      >
        Export CSV
      </button> */}
      <button
        onClick={() => setIsCreateInvoiceOpen(true)}
        className="rounded bg-[#0097DB] px-4 py-2 text-[14px] text-white hover:bg-[#007bb5] whitespace-nowrap"
      >
        + New Payment
      </button>
    </div>
  </div>
      <div className="text-[10px] text-gray-500 max-w-[300px] mb-4">
        Review and manage all payments made by patients for your medical services.
      </div>


      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-[14px] font-medium text-gray-700">Start Date</th>
              <th className="px-3 py-2 text-left text-[14px] font-medium text-gray-700">Services</th>
              <th className="px-3 py-2 text-left text-[14px] font-medium text-gray-700">Amount</th>
              <th className="px-3 py-2 text-left text-[14px] font-medium text-gray-700">Status</th>
              <th className="px-3 py-2 text-left text-[14px] font-medium text-gray-700">Method</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y p-6 divide-gray-200">
            {data.map((item) => (
              <tr
                key={item._id}
                onClick={() => handleEventClick(item._id)}
                className="cursor-pointer hover:bg-gray-50 transition"
              ><div className="pt-3 pb-3">
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(item.startDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td></div>
                <td className="px-4 py-2 whitespace-nowrap">
                  {item.services && item.services.length > 0
                    ? item.services
                        .map((s) => s.serviceId?.serviceName || "Unknown")
                        .join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">₹{item.amount}</td>
                <td className="py-2 pl-3 whitespace-nowrap">
                  <span
                    className={`text-[12px] pxr-2 py-1 p-2 rounded-full font-medium
                      ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{item.method}</td>
              </tr>
            ))}
          </tbody>

        </table>
        <div className="mt-4 text-xs text-gray-500">
          Showing 1-{data.length} payments
        </div>
        {isCreateInvoiceOpen && (
  <Modal
    isOpen={isCreateInvoiceOpen}
    closeModal={() => setIsCreateInvoiceOpen(false)}
    title='Create Invoice'
    width='max-w-6xl'
  >
    <div className='max-h-[80vh] overflow-y-auto'>
      <CreateInvoice
        closeModal={handleCloseInvoiceModal}
        onSuccess={() => setInvoiceChanged(true)}
        defaultPatient={{ _id: patientId, fullName: patientName }}
      />
    </div>
  </Modal>
)}
      </div>
    </div>
  );
}

export default PaymentsUsed;
