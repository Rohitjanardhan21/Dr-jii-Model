import React, { useState } from "react";
import Layout from "../Layout";
import { useParams, useLocation } from "react-router-dom";
import OrderedItemCard from "../components/OrderedItemCard";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { ExternalLink } from "lucide-react";
import medImg from "../Assets/images/med.png";
import presImg from "../Assets/images/pres.png";
import ReactStars from "react-rating-stars-component"; // ⭐️ ADD THIS
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const navigate = useNavigate();
  console.log("location:", location);
  const order = location.state?.order; 

  console.log("Order Details:", order?.diagnosis);


  const [itemCounts, setItemCounts] = useState(
    () => (order?.medications || []).map(() => 1)
  );

  const [showStars, setShowStars] = useState(false); 

  const increaseCount = (index) => {
    const updated = [...itemCounts];
    updated[index] += 1;
    setItemCounts(updated);
  };

  const decreaseCount = (index) => {
    const updated = [...itemCounts];
    updated[index] = Math.max(1, updated[index] - 1);
    setItemCounts(updated);
  };

  if (!order) {
    return <Layout title="Order Details"><div className='p-6'>Order not found</div></Layout>;
  }

  const title = "Order Details";
  const mrp =
    (order.medications?.reduce((acc, med) => acc + (med.price || 0), 0) || 0) +
    (order.diagnosis?.reduce((acc, diag) => acc + (diag.price || 0), 0) || 0);
  const discount = mrp * 0.1;
  const itemTotal = mrp - discount;
  const handlingCharge = 2.0;
  const deliveryCharge = mrp > 50 ? "Free" : 5.0;
  const donation = 1.0;
  const total =
    itemTotal +
    handlingCharge +
    (deliveryCharge === "Free" ? 0 : deliveryCharge) +
    donation;

  const items =
    order.medications?.map((med) => ({
      name: med.name,
      dosage: med.composition,
      price: med.price,
    })) || [];

  return (
    <Layout title={title}>
      <div className='bg-gray-50 p-4 sm:p-6'>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border rounded-md hover:bg-gray-100"
          >
            <IoArrowBackOutline size={20} />
          </button>
          <h2 className='text-xl font-semibold'>Order Details</h2>
        </div>
        <div className='flex gap-6'>
          <div className='flex-1 space-y-4 rounded-xl bg-gray-50 p-6 shadow-sm'>
            <div>Items in this order:</div>
            {items.map((item, index) => (
              <div
                key={index}
                className='mb-4 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm'
              >
                <div className='w-6 text-lg font-medium'>{index + 1}</div>
                <div className='flex w-1/4 items-center rounded-lg bg-gray-50 p-4 shadow-sm'>
                  <Avatar src={medImg} className='w-50 h-50' />
                  <div className='ml-4'>
                    <div className='text-sm font-semibold'>{item.name}</div>
                    <div className='text-sm font-semibold text-blue-500'>
                      ₹{item.price}
                    </div>
                    <div className='mt-1 text-xs text-gray-500'>
                      Dosage: {item.dosage}
                    </div>
                  </div>
                </div>
                <div className='grid flex-1 grid-cols-4 items-center gap-4'>
                  <div>
                    <div className='text-sm font-semibold'>Medications</div>
                    <div className='text-sm'>{item.name}</div>
                    <div className='text-xs text-gray-500'>{item.dosage}</div>
                  </div>
                  <div>
                    <div className='text-sm font-semibold'>Frequency</div>
                    <div className='text-sm'>
                      {order.medications[index]?.frequency || "N/A"}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {order.medications[index]?.timing || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-semibold'>Duration</div>
                    <div className='text-sm'>
                      {order.medications[index]?.duration || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-semibold'>Remarks</div>
                    <div className='text-sm text-gray-600'>
                      {order.medications[index]?.instruction || "No remarks"}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ⭐️ Feedback Section */}
            <div
              className='container'
              style={{
                height: "auto",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: "10px",
                borderRadius: "10px",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3>How were your ordered items</h3>
                <h5 style={{ opacity: 0.6 }}>
                  Your feedback helps us improve
                </h5>
              </div>

                {!showStars ? (
                  <Button variant='contained' onClick={() => setShowStars(true)}>
                    Rate Now
                  </Button>
                ) : (
                  <ReactStars
                    count={5}
                    size={28}
                    activeColor='#ffd700'
                    isHalf={false}
                    onChange={(newRating) =>
                      console.log("Rated with: ", newRating)
                    }
                  />
                )}
              </div>

              {/* Prescription */}
              <div
                className='container'
                style={{
                  backgroundColor: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  height: "100px",
                }}
              >
                <h4 className='text-sm font-semibold'>Attached Prescription</h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <img
                    src={presImg}
                    alt='pres img'
                    style={{ height: "50px", borderRadius: "5px" }}
                  />
                  <ExternalLink /> <span>View</span>
                </div>
              </div>

              {/* Order Info */}
              <div
                className='container'
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px",
                  height: "100px",
                }}
              >
                <div style={{ flex: "1 1 45%" }}>
                  <div style={{ fontSize: "12px", color: "gray" }}>
                    Order ID
                  </div>
                  <div style={{ fontWeight: "500" }}>{order.orderId}</div>
                </div>
                <div style={{ flex: "1 1 45%" }}>
                  <div style={{ fontSize: "12px", color: "gray" }}>
                    Payment method
                  </div>
                  <div style={{ fontWeight: "500" }}>
                    {order.paymentMethod || "Pay on Delivery"}
                  </div>
                </div>
                <div style={{ flex: "1 1 45%" }}>
                  <div style={{ fontSize: "12px", color: "gray" }}>
                    Delivery Address
                  </div>
                  <div style={{ fontWeight: "500" }}>{order.address}</div>
                </div>
                <div style={{ flex: "1 1 45%" }}>
                  <div style={{ fontSize: "12px", color: "gray" }}>
                    Order Placed On
                  </div>
                  <div style={{ fontWeight: "500" }}>{order.date}</div>
                </div>
              </div>

              {/* Bill Details */}
              <div
                className='container'
                style={{
                  height: "230px",
                  backgroundColor: "white",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                <h4 className='mb-2 text-sm font-semibold'>Bill Details</h4>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>MRP</span>
                    <span className='font-medium'>₹{mrp.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Product Discount</span>
                    <span className='font-medium text-green-600'>
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Item Total</span>
                    <span className='font-medium'>₹{itemTotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Handling Charge</span>
                    <span className='font-medium text-blue-500'>
                      +₹{handlingCharge.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Delivery Charge</span>
                    <span className='font-medium text-green-500'>
                      {deliveryCharge}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Feeding India Donation</span>
                    <span className='font-medium text-blue-500'>
                      ₹{donation.toFixed(2)}
                    </span>
                  </div>
                  <Divider variant='middle' />
                  <div className='flex justify-between'>
                    <span className='text-gray-800'>Bill Total</span>
                    <span className='font-medium'>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </Layout>
  );
};

export default OrderDetails;
