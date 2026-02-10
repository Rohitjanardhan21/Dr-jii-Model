import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import { invoicesData } from "../../components/Datas";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCloudDownload } from "react-icons/md";
import { AiOutlinePrinter } from "react-icons/ai";
import PaymentModal from "../../components/Modals/PaymentModal";
import { RiShareBoxLine } from "react-icons/ri";
import ShareModal from "../../components/Modals/ShareModal";
import SenderReceverComp from "../../components/SenderReceverComp";
import { InvoiceProductsTable } from "../../components/Tables";
import {  formatDate } from "../../Assets/Data";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { downloadInvoicePDF } from "../../utils/invoiceUtils";
function PreviewInvoice() {
  const { id } = useParams();
  const [isOpen, setIsoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({});
  const [loading, setLoading] = useState(true);

  
   const componentRef = useRef();
   const handleDownload = () => {

 downloadInvoicePDF(
      componentRef.current,
      `invoice_${invoiceData?.invoiceId || "preview"}.pdf`,
      () => toast.loading("Download starting..."),
      () => {
        toast.dismiss(); 
        toast.success("Successfully downloaded!");
      }
    );
};
    const handlePrint = useReactToPrint({
  contentRef: componentRef,

});
  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getInvoiceById/${id}`);
      const json = await response.json();
      setInvoiceData(json.data);
    } catch (e) {
      console.log("error fetching...", e);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buttonClass =
    "bg-subMain flex-rows gap-3 bg-opacity-5 text-subMain rounded-lg border border-subMain border-dashed px-4 py-3 text-sm";
  const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .printable-content, .printable-content * {
      visibility: visible;
    }
    .printable-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 20px;
    }
    .no-print {
      display: none !important;
    }
    table {
      page-break-inside: avoid;
    }
  .avoid-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    @page {
      size: auto;
      margin: 5mm;
    }
  }
`;
  const invoice = invoicesData.find(
    (invoice) => invoice._id?.toString() === id
  );
  if (loading) {
      return (  
        <Layout>
          <p>Loading...</p>
        </Layout>
      );
    }

  return (
    <Layout>
      <style>{printStyles}</style>
      {isOpen && (
        <PaymentModal
          isOpen={isOpen}
          closeModal={() => {
            setIsoOpen(false);
          }}
        />
      )}
      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          closeModal={() => {
            setIsShareOpen(false);
          }}
        />
      )}
      <div className='flex-btn flex-wrap gap-4'>
        <div className='flex items-center gap-4'>
          <Link
            to='/invoices'
            className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
          >
            <IoArrowBackOutline />
          </Link>
          <h1 className='text-xl font-semibold'>Preview Invoice</h1>
        </div>
        <div className='flex flex-wrap items-center gap-4 no-print'>
          {/* button */}
          <button
            onClick={() => {
              setIsShareOpen(true);
            }}
            className={buttonClass}
          >
            Share <RiShareBoxLine />
          </button>
          <button onClick={handleDownload} className={buttonClass}
          >
            Download <MdOutlineCloudDownload />
          </button>
          <button onClick={handlePrint}
            className={buttonClass}
          >
            Print <AiOutlinePrinter />
          </button>
          <Link to={`/invoices/edit/` + invoice?.id} className={buttonClass}>
            Edit <FiEdit />
          </Link>
          <button
            onClick={() => {
              setIsoOpen(true);
            }}
            className='rounded-lg bg-subMain px-6 py-3 text-sm text-white'
          >
            Generate To Payment
          </button>
        </div>
      </div>
      <div  ref={componentRef}
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 rounded-xl border-[1px] border-border bg-white p-5 printable-content'
      >
        {/* header */}
                  <div className="avoid-break" >

        <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-2 lg:grid-cols-4 invoice-container'>
          <div className='lg:col-span-3'>
            
          </div>

          <div className='flex flex-col gap-4 sm:items-end'>
            <h6 className='text-xs font-medium'>#{invoiceData?.invoiceId}</h6>

            <div className='flex gap-4'>
              <p className='text-sm font-extralight'>Date:</p>
              <h6 className='text-xs font-medium'>
                {formatDate(invoiceData?.createdDate)}
              </h6>
            </div>
            <div className='flex gap-4'>
              <p className='text-sm font-extralight'>Due Date:</p>
              <h6 className='text-xs font-medium'>
                {formatDate(invoiceData?.dueDate)}
              </h6>
            </div>
          </div>
        </div>
        {/* sender and recever */}
        <SenderReceverComp item={invoice?.to} functions={{}} button={false} />
        {/* products */}
        <div className='mt-8 grid grid-cols-6 gap-6'>
          <div className='col-span-6 overflow-hidden rounded-xl border border-border p-6 lg:col-span-4'>
            <InvoiceProductsTable
              data={invoiceData?.items}
              functions={{}}
              button={false}
            />
          </div>
          <div className='col-span-6 flex flex-col gap-6 lg:col-span-2'>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Currency:</p>
              <h6 className='text-sm font-medium'>{invoiceData.currency}</h6>
            </div>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Sub Total:</p>
              <h6 className='text-sm font-medium'>{invoiceData.subTotal}</h6>
            </div>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Discount:</p>
              <h6 className='text-sm font-medium'>
                {invoiceData.discount ? invoiceData.discount : 0}
              </h6>
            </div>
            {/* <div className="flex-btn gap-4">
              <p className="text-sm font-extralight">Tax:</p>
              <h6 className="text-sm font-medium">$4.90</h6> 
            </div> */}
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Grand Total:</p>
              <h6 className='text-sm font-medium text-green-600'>
                {invoiceData.subTotal}
              </h6>
            </div>
            {/* notes */}
            <div className='w-full rounded-lg border border-border p-4'>
              <h1 className='text-sm font-medium'>Notes</h1>
              <p className='mt-2 text-xs font-light leading-5'>
                Thank you for your business. We hope to work with you again
                soon. You can pay your invoice online at
                www.example.com/payments
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}

export default PreviewInvoice;
