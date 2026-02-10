import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Layout";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { Button, Select, Textarea, Input } from "../../components/Form";
import { BsSend } from "react-icons/bs";
import { sortsDatas } from "../../components/Datas";
import { BiChevronDown, BiPlus } from "react-icons/bi";
import SenderReceverComp from "../../components/SenderReceverComp";
import { InvoiceProductsTable } from "../../components/Tables";
import { RiShareBoxLine, RiDeleteBin6Line, RiCloseLine } from "react-icons/ri";
import { MdOutlineCloudDownload } from "react-icons/md";
import { AiOutlinePrinter, AiOutlineWarning } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import ShareModal from "../../components/Modals/ShareModal";
import { useReactToPrint } from "react-to-print";
import {
  downloadInvoicePDF,
  generateInvoicePDFBlob,
} from "../../utils/invoiceUtils";

function EditPayment() {
  const { id } = useParams();
  const [selected, setSelected] = useState(sortsDatas?.status[1]?.name);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [editableServices, setEditableServices] = useState([]);
  const [uniquePatients, setUniquePatients] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [patient, setPatient] = useState(null);
  const [discount, setDiscount] = useState(payment?.discount || 0);
  const [tax, setTax] = useState(payment?.tax || 0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sharePDF, setSharePDF] = useState(null);

  const componentRef = useRef(null);

  const navigate = useNavigate();

  // console.log("Payment: ",payment);
  // console.log("patient:",patient);

  useEffect(() => {
    const fetchUniquePatients = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/unique/patients`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        setUniquePatients(json?.patients || []);
      } catch (e) {
        console.log("Error fetching unique patients:", e);
      }
    };

    fetchUniquePatients();
  }, []);

  const fetchDataForService = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/services`,
        {
          credentials: "include",
        }
      );
      const json = await response.json();
      setServicesData(json);
      console.log("Fetched Services:", json);
    } catch (e) {
      console.log("error fetching...", e);
    }
  };

  useEffect(() => {
    fetchDataForService();
  }, []);

  // Fetch payment by ID
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payment/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        if (data.success) {
          setPayment(data.data);
          console.log("Data to edit:", data.data);
          setSelected(data.data.status);
          setNotes(data.data.notes || "");
          setPatient(data.data.patientId);
          setDiscount(data.data?.discount || 0);
          setTax(data.data?.tax || 0);
          const editable = data.data.services.map((item) => ({
            _id: item._id || item.serviceId,
            serviceName: item?.name,
            price: item?.price,
            quantity: item?.quantity,
          }));
          console.log("editable");
          setEditableServices(editable);
        } else {
          toast.error("Payment not found");
        }
      } catch (error) {
        toast.error("Failed to fetch payment");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  // Delete payment functionality extracted from transaction table
  const handleDeletePayment = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payment/${payment._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Payment deleted successfully");
        // Redirect to payments list
        navigate("/payments");
      } else {
        toast.error(data.message || "Failed to delete payment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const servicesPayload = editableServices.map((item) => {
        // Check if it's a valid MongoDB ObjectId (24 hex characters) or a temporary ID
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item._id);
        const isTemporaryId = item._id.startsWith("temp_");

        const servicePayload = {
          quantity: item.quantity,
          name: item.serviceName,
          price: item.price,
        };

        // Only add serviceId if it's a valid ObjectId from the database (not temporary)
        if (isValidObjectId && !isTemporaryId) {
          servicePayload.serviceId = item._id;
        }

        return servicePayload;
      });

      const body = {
        status: selected,
        notes: notes,
        method: payment?.method || "Cash",
        discount: discount,
        tax: tax,
        amount: grandTotal,
        services: servicesPayload,
      };

      console.log("Update Payment Body:", body);

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payment/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Payment updated successfully");
        setPayment(data.data); // Optional: refresh with updated data
        navigate("/payments");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update payment");
    }
  };
  console.log("patient:", patient);

  const printStyles = `
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  body * {
    visibility: hidden;
  }

  .not-printable-content, .not-printable-content * {
    visibility: hidden;
    display: none !important; 
  }

  .printable-content, .printable-content * {
    visibility: visible;
  }

  .printable-content {
    margin: 0 !important;
    padding: 10px !important;
    box-sizing: border-box;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    overflow: visible !important;
    display: block !important;
    transform: none !important;
    font-size: 10px !important;
    line-height: 1.2 !important;
  }

  /* Force single page layout */
  .printable-content {
    max-height: 297mm !important; /* A4 height */
    overflow: hidden !important;
  }

  .avoid-break, .avoid-break * {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .no-scroll-on-print {
    overflow: visible !important;
  }

  .invoice-header, .invoice-main, table, tr, td, th {
    page-break-inside: avoid !important;
  }

  .overflow-x-scroll {
    overflow: visible !important;
  }

  /* Grid and flex layout adjustments for print */
  .print-grid-layout {
    display: block !important;
    width: 100% !important;
    gap: 5px !important;
    margin: 0 !important;
  }

  .flex-rows {
    flex-wrap: wrap !important;
    gap: 5px !important;
  }

  /* Reduce all spacing */
  .p-5, .p-4, .p-3, .p-2, .p-1 {
    padding: 5px !important;
  }

  .px-6, .px-5, .px-4, .px-3, .px-2, .px-1 {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }

  .py-4, .py-3, .py-2, .py-1 {
    padding-top: 3px !important;
    padding-bottom: 3px !important;
  }

  .mb-4, .mb-3, .mb-2, .mb-1 {
    margin-bottom: 5px !important;
  }

  .mt-4, .mt-3, .mt-2, .mt-1 {
    margin-top: 5px !important;
  }

  .gap-4, .gap-3, .gap-2, .gap-1 {
    gap: 5px !important;
  }

  /* Table adjustments for single page */
  table {
    width: 100% !important;
    table-layout: fixed !important;
    page-break-inside: avoid !important;
    font-size: 9px !important;
    margin: 0 !important;
  }

  th, td {
    padding: 3px !important;
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    font-size: 9px !important;
    line-height: 1.1 !important;
  }

  /* Reduce font sizes */
  .text-xl { font-size: 14px !important; }
  .text-lg { font-size: 12px !important; }
  .text-md { font-size: 11px !important; }
  .text-sm { font-size: 10px !important; }
  .text-xs { font-size: 9px !important; }

  /* Header adjustments */
  h1, h2, h3, h4, h5, h6 {
    margin: 5px 0 !important;
    line-height: 1.2 !important;
  }

  /* Remove unnecessary spacing */
  .border, .border-1, .border-2 {
    border-width: 1px !important;
  }

  .rounded-xl, .rounded-lg, .rounded-md {
    border-radius: 3px !important;
  }

  @page {
    size: A4 portrait;
    margin: 5mm;
  }

  @media print and (orientation: landscape) {
    .printable-content {
      width: 1122px; /* A4 width in landscape at 96 DPI */
      max-height: 210mm !important; /* A4 height in landscape */
    }
  }

  @media print and (orientation: portrait) {
    .printable-content {
      width: 794px; /* A4 width in portrait at 96 DPI */
      max-height: 297mm !important; /* A4 height in portrait */
    }
  }
}
`;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${payment?._id || "payment"}`,
    pageStyle: printStyles,
    onAfterPrint: () => toast.success("Printed successfully!"),
    onPrintError: (err) => {
      console.error("Print error:", err);
      toast.error("Print failed");
    },
  });

  const handlePaymentPrint = () => {
    if (!componentRef.current) {
      toast.error("Nothing to print!");
      return;
    }
    handlePrint();
  };

  const handlePaymentDownload = () => {
    downloadInvoicePDF(
      componentRef.current,
      `invoice_${payment?._id || "preview"}.pdf`,
      () => toast.loading("Download starting..."),
      () => {
        toast.dismiss();
        toast.success("Successfully downloaded!");
      }
    );
  };

  const handleShareClick = async () => {
    if (!componentRef.current) {
      toast.error("Nothing to share!");
      return;
    }

    toast.loading("Preparing PDF...");
    try {
      const pdfBlob = await generateInvoicePDFBlob(componentRef.current);

      if (!pdfBlob) {
        toast.dismiss();
        toast.error("Failed to generate PDF");
        return;
      }

      setSharePDF(pdfBlob); // store blob for modal
      setIsShareOpen(true);
      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  if (loading)
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  if (!payment)
    return (
      <Layout>
        <p>Payment not found</p>
      </Layout>
    );

  const subTotal = editableServices?.reduce((acc, item) => {
    const price = Number(item?.price) || 0;
    const qty = Number(item?.quantity) || 0;
    return acc + price * qty;
  }, 0);

  const discountAmount = (subTotal * discount) / 100;
  const taxAmount = (subTotal * tax) / 100;
  const grandTotal = subTotal - discountAmount + taxAmount;

  const paymentDetails = [
    { label: "Paid By:", value: patient?.fullName || "N/A" },
    { label: "Currency:", value: payment?.currency },
    { label: "Sub Total:", value: subTotal.toFixed(2) },
    { label: "Discount:", value: `${discountAmount.toFixed(2)}` },
    { label: "Tax:", value: `${taxAmount.toFixed(2)}` },
    { label: "Grand Total:", value: grandTotal.toFixed(2) },
  ];

  const buttonClass =
    "bg-subMain flex-rows gap-3 bg-opacity-5 text-subMain rounded-lg border border-subMain border-dashed px-4 py-3 text-sm";

  return (
    <Layout>
      <style>{printStyles}</style>
      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          closeModal={() => {
            setIsShareOpen(false);
          }}
          file={sharePDF}
          patient={patient}
          id={id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black bg-opacity-50 transition-opacity'
            onClick={() => setShowDeleteDialog(false)}
          />

          {/* Dialog */}
          <div className='relative mx-4 w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all'>
            {/* Header */}
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100'>
                  <AiOutlineWarning className='h-6 w-6 text-red-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Delete Payment
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              >
                <RiCloseLine className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            <div className='mb-6'>
              <p className='text-sm text-gray-600'>
                Are you sure you want to delete this payment? This action cannot
                be undone and will permanently remove all associated data.
              </p>
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePayment}
                className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              >
                <RiDeleteBin6Line className='h-4 w-4' />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex-btn flex-wrap gap-4'>
        <div className='no-print flex items-center gap-4'>
          <Link
            to='/payments'
            className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
          >
            <IoArrowBackOutline />
          </Link>
          <h1 className='text-xl font-semibold'>Payment</h1>
        </div>
        <div className='flex flex-wrap items-center gap-4'>
          {/* button */}
          <button
            // onClick={() => {
            //   setIsShareOpen(true);
            // }}
            onClick={handleShareClick}
            className={buttonClass}
          >
            Share <RiShareBoxLine />
          </button>
          <button onClick={handlePaymentDownload} className={buttonClass}>
            Download <MdOutlineCloudDownload />
          </button>
          <button onClick={handlePaymentPrint} className={buttonClass}>
            Print <AiOutlinePrinter />
          </button>
        </div>

        <div
          className='printable-content letter-container invoice-main printable-content avoid-break my-3 rounded-xl border-[1px] border-border bg-white p-5'
          ref={componentRef}
          data-aos='fade-up'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
        >
          <div className='avoid-break'>
            {/* Header */}
            <div className='avoid-break grid grid-cols-1 items-center gap-2 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='avoid-break col-span-4 flex w-full justify-between'>
                <div className='avoid-break flex flex-col gap-2 sm:items-start'>
                  <div className='flex gap-2'>
                    <p className='w-20 text-sm font-extralight'>Name:</p>
                    <h6 className='text-xs font-medium'>{patient.fullName}</h6>
                  </div>
                  <div className='flex gap-2'>
                    <p className='w-20 text-sm font-extralight'>Email:</p>
                    <h6 className='text-xs font-medium'>
                      {patient.contactDetails.email}
                    </h6>
                  </div>
                  <div className='flex gap-2'>
                    <p className='w-20 text-sm font-extralight'>Contact:</p>
                    <h6 className='text-xs font-medium'>
                      {patient.contactDetails.primaryContact ||
                        patient.contactDetails.secondaryContact}
                    </h6>
                  </div>
                </div>

                <div className='avoid-break flex flex-col gap-2 sm:items-end'>
                  <h6 className='text-xs font-medium'>#{payment._id}</h6>
                  <div className='flex gap-4'>
                    <p className='text-sm font-extralight'>Date:</p>
                    <h6 className='text-xs font-medium'>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </h6>
                  </div>
                  <div className='flex gap-4'>
                    <p className='text-sm font-extralight'>Due Date:</p>
                    <h6 className='text-xs font-medium'>
                      {new Date(payment.endDate).toLocaleDateString()}
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            {/* Sender and receiver */}

            {/* Products & Status */}
            <div className='invoice-section'>
              <div className='avoid-break print-grid-layout mt-4 flex flex-col items-stretch gap-4 lg:flex-row'>
                <div className='col-span-6 w-[91%] lg:col-span-5'>
                  <div className='avoid-break w-full rounded-xl border border-border p-6'>
                    {/* Status change */}
                    <div className='not-printable-content mb-4 w-full'>
                      <p className='mb-3 text-sm font-bold'>Change Status</p>
                      <Select
                        selectedPerson={selected}
                        setSelectedPerson={setSelected}
                        datas={sortsDatas?.status}
                      >
                        <div className='flex h-14 w-full items-center justify-between rounded-md border border-border px-4 text-xs text-main'>
                          <p>{selected}</p>
                          <BiChevronDown className='text-xl' />
                        </div>
                      </Select>
                    </div>

                    <div className='not-printable-content'>
                      <Textarea
                        label='Notes'
                        placeholder='Thank you for your business. We hope to work with you again soon!'
                        color={true}
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <InvoiceProductsTable
                      data={editableServices}
                      setData={setEditableServices}
                      servicesData={servicesData}
                      currency={payment?.currency}
                    />

                    {/* Modified button row with Add Order and Delete Payment buttons */}
                    <div className='not-printable-content mt-4 flex items-center justify-between gap-4'>
                      <button
                        onClick={() =>
                          setEditableServices((prev) => [
                            ...prev,
                            {
                              _id: `temp_${Date.now()}`, // Use prefix to identify temporary IDs
                              serviceName: "",
                              price: 0,
                              quantity: 1,
                            },
                          ])
                        }
                        className='flex-rows flex-1 gap-2 rounded-lg border border-dashed border-subMain py-4 text-sm text-subMain'
                      >
                        <BiPlus /> Add Order or Service
                      </button>

                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        className='flex-rows gap-2 rounded-lg border border-dashed border-red-500 bg-red-500 bg-opacity-5 px-4 py-4 text-sm text-red-500 transition-colors hover:bg-opacity-10'
                      >
                        <RiDeleteBin6Line /> Delete Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className='avoid-break mb-2 flex flex-col justify-between gap-4 lg:w-[30%]'>
                  {/* Inputs for Tax & Discount */}
                  <div className='flex w-full flex-col gap-1.5 p-2'>
                    <div className='w-full text-base'>
                      <label className='font-semibold text-black'>
                        Discount
                      </label>
                      <input
                        type='number'
                        value={discount}
                        min={0}
                        max={100}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        placeholder='Enter discount'
                        className='mt-2 w-full rounded-lg border border-border bg-transparent p-2 text-base font-semibold placeholder-gray-400 focus:border focus:border-subMain'
                      />
                    </div>

                    <div className='w-full text-base'>
                      <label className='font-semibold text-black'>
                        Tax (%)
                      </label>
                      <input
                        type='number'
                        value={tax}
                        min={0}
                        max={100}
                        onChange={(e) => setTax(Number(e.target.value))}
                        placeholder='Enter tax percentage'
                        className='mt-2 w-full rounded-lg border border-border bg-transparent p-2 text-base font-semibold placeholder-gray-400 focus:border focus:border-subMain'
                      />
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className='flex w-full flex-col gap-3 rounded-xl border border-border p-4'>
                    {paymentDetails.map((item, index, array) => (
                      <div key={index} className='flex-btn gap-4'>
                        <p className='text-sm font-extralight'>{item.label}</p>
                        <h6
                          className={`text-sm font-medium ${
                            index === array.length - 1 ? "text-green-600" : ""
                          }`}
                        >
                          {item.value}
                        </h6>
                      </div>
                    ))}

                    <div className='not-printable-content'>
                      <Button
                        label='Update'
                        onClick={handleUpdate}
                        Icon={BsSend}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EditPayment;
