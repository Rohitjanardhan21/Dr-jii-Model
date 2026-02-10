// components/SpaceSidebar.jsx
import React from 'react';

const spaces = [
  { name: 'Business', img: 'https://via.placeholder.com/24?text=B' },
  { name: 'Enterpreneurshi', img: 'https://via.placeholder.com/24?text=E' },
  { name: 'Surprise', img: 'https://via.placeholder.com/24?text=S' },
  { name: 'Afterlife', img: 'https://via.placeholder.com/24?text=A' },
  { name: 'Photosharing', img: 'https://via.placeholder.com/24?text=P' },
  { name: 'Digital Photography', img: 'https://via.placeholder.com/24?text=D' },
  { name: 'Culture of India', img: 'https://via.placeholder.com/24?text=C' },
];

const SpaceSidebar = () => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm w-full md:w-64">
      {/* Create Space */}
      <div className="flex items-center gap-2 p-3 border rounded text-gray-700 font-medium mb-4 cursor-pointer hover:bg-gray-100">
        <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center text-lg font-bold">+</div>
        <span>Create Space</span>
      </div>

      {/* Space Items */}
      {spaces.map((space, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 border rounded mb-2 bg-white hover:bg-gray-100 cursor-pointer"
        >
          <img src={space.img} alt={space.name} className="w-6 h-6 rounded object-cover" />
          <span className="text-sm text-gray-800">{space.name}</span>
        </div>
      ))}
    </div>
  );
};

export default SpaceSidebar;
