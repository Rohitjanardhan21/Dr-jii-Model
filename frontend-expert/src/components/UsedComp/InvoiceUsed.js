import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { FiMail, FiPrinter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function InvoiceUsed() {
  const navigate = useNavigate();

  const dummyInvoices = [
    {
      _id: "1",
      invoiceId: "#206791",
      date: "12/06/2021",
      patientName: "Mumtaz Ali",
      treatment: "Follow up",
      dueDate: "16/06/2021",
      amount: "6070",
    },
    {
      _id: "2",
      invoiceId: "#206791",
      date: "10/02/2023",
      patientName: "Noufal Naushad",
      treatment: "Follow up",
      dueDate: "14/02/2023",
      amount: "6070",
    },
    {
      _id: "3",
      invoiceId: "#206791",
      date: "09/01/2023",
      patientName: "Poonam Rawat",
      treatment: "Follow up",
      dueDate: "13/01/2023",
      amount: "6070",
    },
    {
      _id: "4",
      invoiceId: "#206791",
      date: "08/01/2023",
      patientName: "Reshma R",
      treatment: "Follow up",
      dueDate: "12/01/2023",
      amount: "6070",
    },
  ];

  const [invoicesData] = useState(dummyInvoices);

  const handlePreview = (invoiceId) => {
    navigate(`/invoices/preview/${invoiceId}`);
  };

  return (
    <div className="p-6 w-full bg-[#FAFAFA] min-h-screen text-[#2E2E2E]">
      {/* Header Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-y-4">
        {/* Left: Report Category */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm font-medium text-[#2E2E2E]">Select Report Category</label>
          <div className="relative w-32">
            <select className="appearance-none w-full border border-gray-300 rounded-md pl-3 pr-6 py-2 text-sm text-gray-400 bg-white">
              <option>Income</option>
              <option>Expenses</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</div>
          </div>
        </div>

        {/* Center: Dates */}
        <div className="flex items-center gap-2 justify-center min-w-[300px]">
          <input
            type="date"
            placeholder="1 Dec 2021"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-400"
          />
          <span className="text-gray-500">To</span>
          <input
            type="date"
            placeholder="31 Dec 2022"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-400"
          />
        </div>

        {/* Right: Mail & Print */}
        <div className="flex items-center gap-3">
          <button className="flex flex-col items-center border border-red-500 text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">
            <FiMail className="text-base" />
            <span className="text-xs pt-[2px]">Mail</span>
          </button>
          <button className="flex flex-col items-center border border-red-500 text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">
            <FiPrinter className="text-base" />
            <span className="text-xs pt-[2px]">Print</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-md shadow-sm mb-6">
        <div className="bg-[#F3F3F3] px-4 py-2 rounded-t-md">
          <h2 className="text-md font-semibold text-black">Summary</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm bg-white">
          <div>
            <div className="font-medium text-black">Cost(INR)</div>
            <div>396.00</div>
          </div>
          <div>
            <div className="font-medium text-black">Discount(INR)</div>
            <div>0.00</div>
          </div>
          <div>
            <div className="font-medium text-black">Income After Discount(INR)</div>
            <div>396.00</div>
          </div>
          <div>
            <div className="font-medium text-black">Tax(INR)</div>
            <div>0.00</div>
          </div>
          <div>
            <div className="font-medium text-black">Invoice Amount(INR)</div>
            <div>396.00</div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
<div className="bg-white rounded-md shadow-sm p-4">
  <h2 className="text-md font-semibold mb-4 text-black">Invoices</h2>
  <div className="overflow-x-auto overflow-y-auto max-h-[350px]">
    <table className="w-full table-auto text-sm text-left text-gray-700">
      <thead className="bg-[#F3F3F3] text-gray-700 sticky top-0 z-10">
        <tr>
          <th className="px-4 py-2">Serial Number</th>
          <th className="px-4 py-2">Invoice ID</th>
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Patient</th>
          <th className="px-4 py-2">Treatments & Products</th>
          <th className="px-4 py-2">Due Date</th>
          <th className="px-4 py-2">Amount</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoicesData.map((invoice, index) => (
          <tr
            key={invoice._id}
            className="border-b border-gray-200 hover:bg-gray-50"
          >
            <td className="px-4 py-3">{index + 1}</td>
            <td className="px-4 py-3">{invoice.invoiceId}</td>
            <td className="px-4 py-3">{invoice.date}</td>
            <td className="px-4 py-3">{invoice.patientName}</td>
            <td className="px-4 py-3">{invoice.treatment}</td>
            <td className="px-4 py-3">{invoice.dueDate}</td>
            <td className="px-4 py-3 text-[#2E2E2E] font-semibold">
              ₹{invoice.amount}
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => handlePreview(invoice._id)}
                className="text-red-500 hover:text-red-600"
              >
                <FaEye />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
}

export default InvoiceUsed;
