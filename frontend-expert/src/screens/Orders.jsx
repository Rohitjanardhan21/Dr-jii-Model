import React, { useEffect, useState } from 'react';
import Layout from "../Layout";
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const title = "Orders";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-orders`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          const formattedOrders = data.data.map((item, index) => ({
            id: item._id,
            orderId: item._id,
            date: new Date().toLocaleDateString(),
            patient: {
              name: item.patientName,
              avatar: item.patientImage,
            },
            address: `${item.patientAddress?.street || ''}, ${item.patientAddress?.city || ''}`,
            bill: {
              mrp:
                (item.medications?.reduce((acc, med) => acc + (med.price || 0), 0) || 0) +
                (item.diagnosis?.reduce((acc, diag) => acc + (diag.price || 0), 0) || 0),
            },
            medications: item.medications || [],
            diagnosis: item.diagnosis || [],
          }));

          setOrders(formattedOrders);
        } else {
          console.error("Failed to fetch orders:", data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const goToOrderDetails = (orderId, order) => {
    navigate(`/orders/${orderId}`, { state: { order } });
  };

  if (loading) {
    return (
      <Layout title={title}>
        <div className="bg-gray-50 p-6 min-h-[200px] flex items-center justify-center">
          {/* Keep empty while route-level blur loader shows */}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={title}>
      <div className="bg-gray-50 p-6">
        <h2 className="text-xl font-semibold mb-4">Order lists</h2>
        
        <div className="overflow-x-auto bg-white rounded-xl shadow h-full flex flex-col">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No orders found</div>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => goToOrderDetails(order.orderId, order)}
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-800">{order.orderId}</td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <img
                        src={order.patient.avatar}
                        alt={order.patient.name}
                        className="w-8 h-8 rounded-full"
                      />
                      {order.patient.name}
                    </td>
                    <td className="px-6 py-4">{order.address}</td>
                    <td className="px-6 py-4">₹{order.bill.mrp}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination (static for now) */}
          <div className="flex justify-between items-center px-6 py-3 text-sm text-gray-600 mt-auto">
            <div>Showing {orders.length} of {orders.length} orderlists</div>
            <div className="space-x-2">
              <button className="border px-2 py-1 rounded text-gray-400 cursor-not-allowed" disabled>{'<'}</button>
              <span>1</span>
              <button className="border px-2 py-1 rounded hover:bg-gray-200">{'>'}</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
