import React from "react";

const OrderedItemCard = ({ name, dosage, count, price }) => (
  <div className="bg-gray-100 p-4 rounded-lg w-48">
    <div className="font-semibold text-sm">{name}</div>
    <div className="text-xs text-gray-500">Dosage: {dosage}</div>
    <div className="flex justify-between items-center mt-2 text-sm">
      <span>× {count}</span>
      <span>{price}</span>
    </div>
  </div>
);

export default OrderedItemCard;
