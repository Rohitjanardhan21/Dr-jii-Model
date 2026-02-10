export const orders = [
  {
    orderId: "ORD-7834",
    patient: {
      name: "Amani Mmasy",
      email: "amanimmasy@gmail.com",
      phone: "+254 712 345 678",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    items: [
      { name: "Clipcal 500", dosage: "30mg", count: 1, price: "₹24.56" },
      { name: "Paracetamol", dosage: "500mg", count: 2, price: "₹12.99" },
    ],
    prescription: "https://example.com/prescriptions/prescription1.pdf",
    address: "Mahalaxmi Nagar, F102 Nariman Point",
    paymentMethod: "Pay on Delivery",
    orderDate: "Tue, 08 Aug 2024, 4:12 pm",
    bill: {
      mrp: 60.00,
    
    },
  },
  {
    orderId: "ORD-7835",
    patient: {
      name: "Emily Carter",
      email: "emilycarter@example.com",
      phone: "+1 312 555 0199",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    items: [
      { name: "Ibuprofen", dosage: "200mg", count: 3, price: "₹15.00" },
      { name: "Zincovit", dosage: "10mg", count: 1, price: "₹5.00" },
    ],
    prescription: "https://example.com/prescriptions/prescription2.pdf",
    address: "456 Elm Street, Brooklyn, NY",
    paymentMethod: "Credit Card",
    orderDate: "Wed, 09 Aug 2024, 10:15 am",
    bill: {
      mrp: 30.00,
      
    },
  },
  {
    orderId: "ORD-7836",
    patient: {
      name: "Rajiv Mehta",
      email: "rajivm@gmail.com",
      phone: "+91 98765 43210",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    items: [
      { name: "Amoxicillin", dosage: "250mg", count: 2, price: "₹18.00" },
    ],
    prescription: "https://example.com/prescriptions/prescription3.pdf",
    address: "2nd Cross, Indiranagar, Bangalore",
    paymentMethod: "UPI",
    orderDate: "Thu, 10 Aug 2024, 2:40 pm",
    bill: {
      mrp: 20.00,
  
    },
  },
  {
    orderId: "ORD-7837",
    patient: {
      name: "Sophia Nguyen",
      email: "sophia.nguyen@example.com",
      phone: "+61 402 123 456",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    items: [
      { name: "Cetirizine", dosage: "10mg", count: 1, price: "₹7.00" },
      { name: "Vitamin D3", dosage: "600 IU", count: 1, price: "₹10.00" },
    ],
    prescription: "https://example.com/prescriptions/prescription4.pdf",
    address: "42 George Street, Sydney",
    paymentMethod: "Net Banking",
    orderDate: "Fri, 11 Aug 2024, 6:00 pm",
    bill: {
      mrp: 20.00,
      
    },
  },
  {
    orderId: "ORD-7838",
    patient: {
      name: "Carlos Martinez",
      email: "carlos.martinez@example.com",
      phone: "+34 612 345 678",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    items: [
      { name: "Metformin", dosage: "500mg", count: 1, price: "₹14.00" },
      { name: "Aspirin", dosage: "75mg", count: 2, price: "₹10.00" },
    ],
    prescription: "https://example.com/prescriptions/prescription5.pdf",
    address: "Calle Mayor 12, Madrid",
    paymentMethod: "Debit Card",
    orderDate: "Sat, 12 Aug 2024, 11:00 am",
    bill: {
      mrp: 30.00,
    },
  },
];


//  const response = await fetch(
//           `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/medical-records/${patientId}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           }
//         );

// const result = await response.json();
//         if (response.ok) {
//           setRecords(result.data);
//         }