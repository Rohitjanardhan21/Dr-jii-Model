import React, { useEffect, useState } from "react";
import { Checkbox } from "./Form";

function Access({ setAccess }) {
  const thclass = "text-start text-xs font-medium py-3 px-2 whitespace-nowrap";
  const tdclass = "text-start text-sm py-4 px-2 whitespace-nowrap";
  const [parientAccess, setParientAccess] = useState({
    read: false,
    create: false,
    delete: false,
    edit: false,
  });
  const [appointmentAccess, setAppointmentAccess] = useState({
    read: false,
    create: false,
    delete: false,
    edit: false,
  });
  const [invoicesAccess, setInvoicesAccess] = useState({
    read: false,
    create: false,
    delete: false,
    edit: false,
  });
  const [paymentsAccess, setPaymentsAccess] = useState({
    read: false,
    create: false,
    delete: false,
    edit: false,
  });

  // on change patient
  const onChangePatient = (e) => {
    setParientAccess({ ...parientAccess, [e.target.name]: e.target.checked });
  };
  // on change appointment
  const onChangeAppointment = (e) => {
    setAppointmentAccess({
      ...appointmentAccess,
      [e.target.name]: e.target.checked,
    });
  };

  // on change invoices
  const onChangeInvoices = (e) => {
    setInvoicesAccess({ ...invoicesAccess, [e.target.name]: e.target.checked });
  };

  // on change payments
  const onChangePayments = (e) => {
    setPaymentsAccess({ ...paymentsAccess, [e.target.name]: e.target.checked });
  };

  const datas = [
    {
      id: 1,
      name: "Parient",
      access: parientAccess,
      onChange: onChangePatient,
    },
    {
      id: 2,
      name: "Appointment",
      access: appointmentAccess,
      onChange: onChangeAppointment,
    },
    {
      id: 3,
      name: "Invoices",
      access: invoicesAccess,
      onChange: onChangeInvoices,
    },
    {
      id: 4,
      name: "Payments",
      access: paymentsAccess,
      onChange: onChangePayments,
    },
  ];

  // send access to parent component
  useEffect(() => {
    setAccess({
      parientAccess,
      appointmentAccess,
      invoicesAccess,
      paymentsAccess,
    });
  }, [
    parientAccess,
    appointmentAccess,
    invoicesAccess,
    paymentsAccess,
    setAccess,
  ]);

  return (
    <div className='w-full'>
      <h1 className='mb-3 text-sm text-black'>Access</h1>
      <div className='w-full overflow-x-scroll'>
        <table className='w-full table-auto'>
          <thead className='overflow-hidden rounded-md bg-dry'>
            <tr>
              {["", "Read", "Edit", "Create", "Delete"].map((perm) => (
                <th key={perm} className={thclass}>
                  {perm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datas.map((item) => (
              <tr
                key={item.id}
                className='transitions border-b border-border hover:bg-greyed'
              >
                <td className={`text-xs font-light ${tdclass}`}>{item.name}</td>
                {["read", "edit", "create", "delete"].map((perm) => (
                  <td key={perm} className={tdclass}>
                    <Checkbox
                      name={perm}
                      checked={item.access[perm]}
                      onChange={item.onChange}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Access;
