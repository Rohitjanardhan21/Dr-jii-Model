// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const AddMedicine = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="add-medicine-container">
//       <div className="header">
//         <button onClick={() => navigate(-1)}>←</button>
//         <h2>New Medicine</h2>
//       </div>

//       <form className="medicine-form">
//         <div className="row">
//           <div className="field">
//             <label>Medicine Name</label>
//             <input type="text" placeholder="Enter medicine name" />
//           </div>
//           <div className="field">
//             <label>Measure</label>
//             <select>
//               <option>Select Measure</option>
//               <option>Tablet</option>
//               <option>Syrup</option>
//               <option>Injection</option>
//             </select>
//           </div>
//         </div>

//         <div className="row">
//           <div className="field">
//             <label>Price (Tsh)</label>
//             <input type="number" placeholder="0" />
//           </div>
//           <div className="field">
//             <label>Instock</label>
//             <input type="number" placeholder="0" />
//           </div>
//         </div>

//         <div className="field full-width">
//           <label>Description</label>
//           <textarea placeholder="Write description here..."></textarea>
//         </div>

//         <div className="form-actions">
//           <button className="cancel" onClick={() => navigate(-1)}>Cancel</button>
//           <button className="save">Save ✓</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddMedicine;




import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddMedicine = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medicineName: "",
    measure: "",
    price: 0,
    instock: 0,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    navigate(-1); // Navigate back
  };

  const handleCancel = () => {
    navigate(-1); // Navigate back
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-3xl p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <button onClick={handleCancel} className="text-2xl mr-4">←</button>
          <h2 className="text-xl font-semibold">New Medicine</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Medicine Name</label>
            <input
              type="text"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Measure</label>
            <select
              name="measure"
              value={formData.measure}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Measure</option>
              <option value="tablet">Tablet</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Price (Tsh)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Instock</label>
            <input
              type="number"
              name="instock"
              value={formData.instock}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded px-3 py-2"
            placeholder="Write description here..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="bg-red-100 text-red-600 px-6 py-2 rounded hover:bg-red-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
